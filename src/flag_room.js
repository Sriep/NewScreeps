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

FlagRoom.prototype.PathType = {
    "SourceSpawn" : "SourceSpawn",
    "SourceSpawnRoad" : "SourceSpawnRoad",
    "SourceController" : "SourceController",
    "SourceControllerRoad" : "SourceControllerRoad",
    "MineralSpawn" : "MineralSpawn",
    "MineralSpawnRoad" : "MineralSpawnRoad",
    "MineralController" : "MineralController",
    "MineralControllerRoad" : "MineralControllerRoad", 
    "ControllerSpawn" : "Controller",
    "ControllerSpawnRoad" : "ControllerSpawnRoad",
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

    const paths = {};
    for (let room of _.filter(Game.rooms, r => {
        return r.controller && r.controller.my && r.controller.level > 0
       })) {
       if (Game.map.getRoomLinearDistance(room.name, this.name) <= gc.MAX_COLONY_DISTANCE) {
            //this.m.linkInfo[room.name] = this.linkRoomInfo(room)
           paths[room.name] = JSON.stringify(this._setPaths(room));
       }
    }
    this.m.paths = paths;
};

FlagRoom.prototype.resetPaths = function(spawnRoom) {
    this.m.paths[spawnRoom] = this._setPaths(spawnRoom)
};

FlagRoom.prototype._setPaths = function(spawnRoom) {
    const home = Game.rooms[this.name];
    const paths = {};
    const sources = home.find(C.FIND_SOURCES);
    const spawns = spawnRoom.find(C.FIND_MY_SPAWNS);
    paths["SourceSpawn"] = {};
    paths["SourceSpawnRoad"] = {};
    paths["SourceController"] = {};
    paths["SourceControllerRoad"] = {};
    for (let source of sources) {
        paths["SourceSpawn"][source.id] = cache.path(source, spawns, "spawn", 1, false, true);
        paths["SourceSpawnRoad"][source.id] = cache.path(source, spawns, "spawn", 1, true, true);
        paths["SourceController"][source.id] = cache.path(source, [spawnRoom.controller], "spawn", 1, true, true);
        paths["SourceControllerRoad"][source.id] = cache.path(source, [spawnRoom.controller], "spawn", 1, true, true);
    }
    const minerals = home.find(C.FIND_MINERALS);
    if (minerals.length > 0) {
        paths["MineralSpawn"] = cache.path(minerals[0], spawns, "spawn", 1, false, true);
        paths["MineralSpawnRoad"] = cache.path(minerals[0], spawns, "spawn", 1, true, true);
        paths["MineralController"] = cache.path(minerals[0], [spawnRoom.controller], "spawn", 1, false, true);
        paths["MineralControllerRoadSpawn"] = cache.path(minerals[0], [spawnRoom.controller], "spawn", 1, true, true)
    }
    if (home.controller) {
        paths["ControllerSpawn"] = cache.path(home.controller, spawns, "spawn", 1, false, true);
        paths["ControllerSpawnRoad"] = cache.path(home.controller, spawns, "spawn", 1, true, true)
    }
    return paths;
};

FlagRoom.prototype.local= function() {
    return  cache.global(FlagRoom.prototype._local,this,[],this.name+".local");
};

FlagRoom.prototype._local = function() {
    //console.log("_local spawnRoom", JSON.stringify(this));
    return JSON.parse(this.m.local)
};

FlagRoom.prototype.paths= function(spawnRoom) {
    return  cache.global(FlagRoom.prototype._paths,this,[spawnRoom],this.name + ".paths.");
};

FlagRoom.prototype._paths = function(spawnRoom) {
    return JSON.parse(this.m.paths[spawnRoom])
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
    const paths = this.paths(spawnRoom);
    const local = this.local();
    const sources = local.sources;
    for (let id in sources) {
        totalValues = budget.addSourceValues(totalValues, budget.valueSource(
            reserve ? 2*sources[id].energyCapacity : sources[id].energyCapacity,
            roads ? paths.SourceSpawnRoad[id].cost : paths.SourceSpawn[id].cost,
            roads ? paths.SourceControllerRoad[id].cost : paths.SourceController[id].cost,
            roads,
            (paths.SourceController[id].cost - paths.SourceControllerRoad[id].cost)/4,
            srEnergyCap,
        ))
    }
    if (!gf.isEmpty(totalValues)) {
        this._valueReserveCost(spawnRoom, totalValues, reserve, roads);
        this._valueDefenceCost(spawnRoom, totalValues);
    }
    return totalValues;
};

FlagRoom.prototype._valueReserveCost = function (spawnRoom, value, reserve, roads) {
    const paths = this.paths(spawnRoom);
    if (reserve && this.local().controller) {
        const pathCost = roads ? paths.ControllerSpawnRoad.cost : paths.ControllerSpawn.cost;
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

FlagRoom.prototype._valueDefenceCost = function (spawnRoom, value) {
    if (this.isKeeperLair()) {
        const keys = (Object.keys(this.paths(spawnRoom).SourceSpawn));
        let keeperBaneCost = race.getCost(gc.RACE_PALADIN, 10000,11);
        const d = this.paths(spawnRoom).SourceSpawn[keys[0]].cost;
        keeperBaneCost *= (C.CREEP_LIFE_TIME)/(C.CREEP_LIFE_TIME - d);
        value.parts["pH"] = 11;
        value["runningCostCreeps"] = value["runningCostCreeps"] + keeperBaneCost;
        value["netEnergy"] = value["netEnergy"] - keeperBaneCost;
        value["netParts"] = value["netParts"] + 50;
        value["profitParts"] = value["netEnergy"]/value["netParts"];
    }
};

FlagRoom.prototype.getPath = function (pathName, roomName, id) {
    if (id) {
        return this.paths(roomName)[pathName][id]
    }
    return this.paths(roomName)[pathName]
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
    const sources = this.local().sources;
    //console.log("sources", JSON.stringify(sources));
    for (let id in sources) {
        sources[id].harvestPosts = cache.deserialiseRoArray(sources[id].harvestPosts, this.name);
        sources[id].containerPos = cache.dPos(sources[id].containerPos, this.name);
    }
    return sources;
};

FlagRoom.prototype.getMineral = function () {
    return  cache.global(FlagRoom.prototype._getMineral, this,[],this.name + ".getMineral.",);
};

FlagRoom.prototype._getMineral = function () {
    const mineral = this.local().mineral;
    mineral.harvestPosts = cache.deserialiseRoArray(mineral.harvestPosts, this.name);
    mineral.containerPos = cache.dPos(mineral.containerPos, this.name);
    return mineral;
};

FlagRoom.prototype.getController = function () {
    return cache.global(FlagRoom.prototype._getController, this,[],this.name + ".getController.",);
};

FlagRoom.prototype._getController = function () {
    const controller = this.local().controller;
    controller.containerPos = cache.deserialiseRoArray(controller.containerPos, this.name);
    controller.upgradePosts = cache.deserialiseRoArray(controller.upgradePosts, this.name);
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
    return this.getSources()[id].containerPos;
};

FlagRoom.prototype.getUpgradePosts = function () {
    return this.getController().upgradePosts;
};

FlagRoom.prototype.getUpgradeContainerPos = function () {
    //console.log("flagroom containerPos", JSON.stringify(this.getController().containerPos));
    return this.getController().containerPos;
};

FlagRoom.prototype.isKeeperLair = function () {
    return this.local().keeperLairs
};

module.exports = FlagRoom;
























