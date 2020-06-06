/**
 * @fileOverview screeps
 * Created by piers on 25/05/2020
 * @author Piers Shepperson
 */
const C = require("./Constants");
const flag = require("./flag");
const budget = require("./budget");
const gf = require("./gf");
const gc = require("./gc");
const cache = require("./cache");
const race = require("./race");

function FlagRoom (name) {
    let roomFlag;
    if (name) {
        this.name = name;
        roomFlag = flag.getRoomFlag(name);
    }
    if (roomFlag) {
        this.m = roomFlag.memory;
    } else {
        m = {
            flagged : false,
            mapped : false,
            roomType : this.RoomType.Unknown,
        };
        this.m = m;
        this.m.local = JSON.stringify(m);
    }
}

FlagRoom.prototype.RoomType = {
    "MyOwned": "MyOwned",
    "MyReserved" : "MyReserved",
    "UserOwned" :"UserOwned",
    "UserReserved" : "UserReserved",
    "InvaderOwned" : "InvaderOwned", // don't think this ever happens?!
    "InvaderReserved" : "InvaderReserved",
    "SourceKeeper" : "SourceKeeper",
    "Neutral" : "Neutral",
    "None" : "None",
    "Unknown" : "Unknown",
};

FlagRoom.prototype.mapRoom = function() {
    this.m.roomType = this.roomType();
    if (this.m.roomType === this.RoomType.Unknown) {
        return false;
    }
    const room = Game.rooms[this.name];
    // todo temp
    if (room.controller && room.controller.reservation) {
        this.m.reserver = room.controller.reservation.username
    }
    if (room.controller && room.controller.owner) {
        this.m.reserver = room.controller.owner.username
    }
    // end temp

    const cores = room.find(C.FIND_STRUCTURES, {
        filter: { structureType: C.STRUCTURE_INVADER_CORE }
    });
    if (cores.length > 0) {
        this[C.STRUCTURE_INVADER_CORE] = true;
    }

    const linkInfo = {};
    for (let room of _.filter(Game.rooms, r => {
        return r.controller && r.controller.my && r.controller.level > 0
       })) {
       if (Game.map.getRoomLinearDistance(room.name, this.name) <= gc.MAX_COLONY_DISTANCE) {
            //this.m.linkInfo[room.name] = this.linkRoomInfo(room)
           linkInfo[room.name] = JSON.stringify(this.linkRoomInfo(room));
       }
    }
    this.m.linkInfo = linkInfo;
};

FlagRoom.prototype.linkRoomInfo = function(owned) {
    const home = Game.rooms[this.name];
    const info = {};
    const sources = home.find(C.FIND_SOURCES);
    const spawns = owned.find(C.FIND_MY_SPAWNS);
    info["sources"] = [];
    for (let source of sources) {
        info.sources.push({
            id : source.id,
            energyCapacity : source.energyCapacity,
            pathSpawn : cache.path(source, spawns, "spawn", 1, false, true),
            pathSpawnRoad : cache.path(source, spawns, "spawn", 1, true, true),
            pathController : cache.path(source, [owned.controller], "spawn", 1, true, true),
            pathControllerRoad : cache.path(source, [owned.controller], "spawn", 1, true, true),
        })
    }
    const minerals = home.find(C.FIND_MINERALS);
    gf.assertLt(minerals.length, 2, "should be zero or one minerals");
    if (minerals.length > 0){
        info["minerals"] = {
            id : minerals[0].id,
            density : minerals[0].density,
            mineralType : minerals[0].mineralType,
            pathSpawn : cache.path(minerals[0], spawns, "spawn", 1, false, true),
            pathSpawnRoad : cache.path(minerals[0], spawns, "spawn", 1, true, true),
            pathController : cache.path(minerals[0], [owned.controller], "spawn", 1, false, true),
            pathControllerRoad : cache.path(minerals[0], [owned.controller], "spawn", 1, true, true),
        }
    }
    if (home.controller) {
        info["controller"] = {
            id : home.controller.id,
            pathSpawn : cache.path(home.controller, spawns, "spawn", 1, false, true),
            pathSpawnRoad : cache.path(home.controller, spawns, "spawn", 1, true, true),
        }
    }
    return info;
};

FlagRoom.prototype.local= function(spawnRoom) {
    return  cache.global(FlagRoom.prototype._local,this,[spawnRoom],this.name + ".local.");
};

FlagRoom.prototype._local = function(spawnRoom) {
    return JSON.parse(this.m.local[spawnRoom])
};

FlagRoom.prototype.linkInfo= function(spawnRoom) {
    return  cache.global(FlagRoom.prototype._linkInfo,this,[spawnRoom],this.name + ".linkInfo.");
};

FlagRoom.prototype._linkInfo = function(spawnRoom) {
    return JSON.parse(this.m.linkInfo[spawnRoom])
};

FlagRoom.prototype.value = function (spawnRoom, roads, reserve, srEnergyCap) {
    return  cache.global(
        FlagRoom.prototype._value,
        this,
        [spawnRoom, !!roads, !!reserve, (srEnergyCap ? srEnergyCap : false)],
        this.name + ".value." + spawnRoom + "." + (roads ? 1 : 0) + (reserve ? 1 : 0) + "." + (srEnergyCap ? srEnergyCap.toString() : 0),
    );
};

FlagRoom.prototype._value = function (spawnRoom, roads, reserve, srEnergyCap) {
    let totalValues = {
        "parts": { "hW": 0, "pC": 0, "uW": 0},
        "startUpCost": 0,
        "runningCostRepair": 0,
        "runningCostCreeps": 0,
        "netEnergy": 0,
        "netParts": 0,
        "profitParts" : 0,
    };
    for (let source of this.linkInfo(spawnRoom).sources) {
        totalValues = budget.addSourceValues(totalValues, budget.valueSource(
            reserve ? 2*source.energyCapacity : source.energyCapacity,
            roads ? source.pathSpawnRoad.cost : source.pathSpawn.cost,
            roads? source.pathControllerRoad.cost : source.pathController.cost,
            roads,
            (source.pathController.cost - source.pathControllerRoad.cost)/4,
            srEnergyCap,
        ))
    }
    if (!gf.isEmpty(totalValues)) {
        this.valueReserveCost(spawnRoom, totalValues, reserve, roads);
        this.valueDefenceCost(spawnRoom, totalValues);
    }
    return totalValues;
};

FlagRoom.prototype.valueReserveCost = function (spawnRoom, value, reserve, roads) {
    const linkInfo = this.linkInfo(spawnRoom);
    if (reserve && linkInfo.controller) {
        const pathCost = roads ? linkInfo.controller.pathSpawnRoad.cost
            : linkInfo.controller.pathSpawn.cost;
        const cRs = budget.reserverParts(pathCost);
        const reserverCost = budget.convertPartsToEnergy(0, 0, 0,0, cRs, false);
        value.parts["cR"] = cRs;
        value["runningCostCreeps"] += reserverCost;
        value["netEnergy"] -= reserverCost;
        value["netParts"] += cRs;
        value["profitParts"] = value["netEnergy"]/value["netParts"];
        if (this.m.roomType === this.RoomType.InvaderReserved)  {
            let swordsmanCost = gc.MIN_SWORDSMAN_EC_INVADER_RESERVER;
            const d = linkInfo.controller.pathSpawn.cost;
            swordsmanCost *= (C.CREEP_LIFE_TIME)/(C.CREEP_LIFE_TIME - d);
            value["startUpCost"] += swordsmanCost;
        }
    } else {
        value.parts["cR"] = 0;
    }
};

FlagRoom.prototype.valueDefenceCost = function (spawnRoom, value) {
    if (this.m.keeperLairs) {
        let keeperBaneCost = race.getCost(gc.RACE_PALADIN, 10000,11);
        const d = this.linkInfo(spawnRoom).sources[0].pathSpawn.cost;
        keeperBaneCost *= (C.CREEP_LIFE_TIME)/(C.CREEP_LIFE_TIME - d);
        value.parts["pH"] = 11;
        value["runningCostCreeps"] = value["runningCostCreeps"] + keeperBaneCost;
        value["netEnergy"] = value["netEnergy"] - keeperBaneCost;
        value["netParts"] = value["netParts"] + 50;
        value["profitParts"] = value["netEnergy"]/value["netParts"];
    }
};

FlagRoom.prototype.roomType = function () {
    const room = Game.rooms[this.name];
    if (!room) {
        return this.RoomType.Unknown;
    }
    if (room.controller && room.controller.my) {
        return (room.controller.level > 0) ? this.RoomType.MyOwned : this.RoomType.MyReserved;
    }
    if (room.controller && room.controller.owner && room.controller.owner.username !== "Invader") {
        return  this.RoomType.UserOwned
    }
    if (room.controller && room.controller.reservation && room.controller.reservation.username !== "Invader") {
        return this.RoomType.UserReserved;
    }
    if (room.controller && room.controller.owner) {
        return this.RoomType.InvaderOwned
    }
    if (room.controller && room.controller.reservation) {
        return this.RoomType.InvaderReserved;
    }
    if (room.controller) {
        return this.RoomType.Neutral;
    }
    const lairs = room.find(C.FIND_STRUCTURES, {
        filter: { structureType: C.STRUCTURE_KEEPER_LAIR }
    });
    if (lairs.length > 0) {
        return this.RoomType.SourceKeeper;
    }
    return this.RoomType.None;
};

FlagRoom.prototype.getSources = function () {
    return  cache.global(FlagRoom.prototype._getSources, this,[],this.name + ".getSources.",);
};

FlagRoom.prototype._getSources = function () {
    const sources = JSON.parse(this.local().sources);
    for (let source of sources) {
        source.harvestPosts = cache.deserialiseRoPath(source.harvestPosts, this.name);
        source.containerPos = cache.dPos(source.containerPos, this.name);
    }
    return sources;
};

FlagRoom.prototype.getMineral = function () {
    return  cache.global(FlagRoom.prototype._getMineral, this,[],this.name + ".getMineral.",);
};

FlagRoom.prototype._getMineral = function () {
    const mineral = JSON.parse(this.local().mineral);
    mineral.harvestPosts = cache.deserialiseRoPath(mineral.harvestPosts, this.name);
    mineral.containerPos = cache.dPos(mineral.containerPos, this.name);
    return mineral;
};

FlagRoom.prototype.getController = function () {
    return cache.global(FlagRoom.prototype._getController, this,[],this.name + ".getController.",);
};

FlagRoom.prototype._getController = function () {
    const controller = JSON.parse(this.local().mineral);
    controller.containerPos = cache.deserialiseRoPath(controller.containerPos, this.name);
    const upgradePosts = [];
    for (let i = 0 ; i < controller.containerPos.length ; i++ ) {
        upgradePosts.push(cache.deserialiseRoPath(controller.upgradePosts[i], this.name));
    }
    controller.upgradePosts = upgradePosts;
    return controller;
};

FlagRoom.prototype.getSourcePosts = function(sourceId) {
    return this.getSources()[sourceId].harvestPosts;
};

FlagRoom.prototype.getHarvestPosts = function(id) {
    if (this.local().mineral.id === id) {
        return this.getMineral().harvestPosts;
    }
    return this.getSources()[sourceId].harvestPosts;
};

FlagRoom.prototype.getSourceContainerPos = function (sourceId) {
    return this.getSources()[sourceId].containerPos;
};

FlagRoom.prototype.getMineralContainerPos = function() {
    return this.getMineral().containerPos;
};

FlagRoom.prototype.getHarvestContainerPos = function (id) {
    if (this.local().mineral.id === id) {
        return this.getMineral().containerPos;
    }
    return this.getSources()[sourceId].containerPos;
};

FlagRoom.prototype.getUpgradePosts = function () {
    let upgradePosts = [];
    for (let posts of this.getController().upgradePosts) {
        upgradePosts = upgradePosts.concat(posts)
    }
    return upgradePosts;
};

FlagRoom.prototype.getUpgradeContainerPos = function () {
    return this.getController().containerPos;
};

module.exports = FlagRoom;