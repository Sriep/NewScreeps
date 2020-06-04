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

function FlagRoom (name) {
    let roomFlag;
    if (name) {
        this.name = name;
        roomFlag = flag.getRoomFlag(name);
    }
    if (roomFlag) {
        this.m = roomFlag.memory;
    } else {
        this.m = {
            flagged : false,
            mapped : false,
            roomType : this.RoomType.Unknown,
        }
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
    if (this.roomType() === this.RoomType.Unknown) {
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

    if (!this.m.linkInfo) {
        this.m.linkInfo = {}
    }

    //console.log("Flagroom before filter name",this.name);
    //const tRooms = _.filter(Game.rooms, r => {
    //    console.log("in filter r",r, JSON.stringify(r));
    //    return r.controller.my && r.controller.level > 0
    //});
    //console.log("Flagroom mapRoom", JSON.stringify(tRooms));

    for (let room of _.filter(Game.rooms, r => {
        return r.controller && r.controller.my && r.controller.level > 0
       })) {
       if (Game.map.getRoomLinearDistance(room.name, this.name) <= gc.MAX_COLONY_DISTANCE) {
            this.m.linkInfo[room.name] = this.linkRoomInfo(room)
       }
    }
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
            pathSpawn : cache.path(source, spawns, "spawn", 1, false, true,true),
            pathSpawnRoad : cache.path(source, spawns, "spawn", 1, true, true,true),
            pathController : cache.path(source, [owned.controller], "spawn", 1, false,true,true),
            pathControllerRoad : cache.path(source, [owned.controller], "spawn", 1, true, true,true),
        })
    }
    const minerals = home.find(C.FIND_MINERALS);
    gf.assertLt(minerals.length, 2, "should be zero or one minerals");
    if (minerals.length > 0){
        info["minerals"] = {
            id : minerals[0].id,
            density : minerals[0].density,
            mineralType : minerals[0].mineralType,
            pathSpawn : cache.path(minerals[0], spawns, "spawn", 1, false, true,true),
            pathSpawnRoad : cache.path(minerals[0], spawns, "spawn", 1, true, true,true),
            pathController : cache.path(minerals[0], [owned.controller], "spawn", 1, false, true,true),
            pathControllerRoad : cache.path(minerals[0], [owned.controller], "spawn", 1, true, true,true),
        }
    }
    if (home.controller) {
        info["controller"] = {
            id : home.controller.id,
            pathSpawn : cache.path(home.controller, spawns, "spawn", 1, false, true,true),
            pathSpawnRoad : cache.path(home.controller, spawns, "spawn", 1, true, true,true),
        }
    }
    return info;
};

FlagRoom.prototype.value = function (spawnRoom, roads, reserve, srEnergyCap) {
    let totalValues = {
        "parts": { "hW": 0, "pC": 0, "uW": 0},
        "startUpCost": 0,
        "runningCostRepair": 0,
        "runningCostCreeps": 0,
        "netEnergy": 0,
        "netParts": 0,
        "profitParts" : 0,
    };
    console.log("FlagRoom value linkInfo", JSON.stringify(this.m));
    for (let source of this.m.linkInfo[spawnRoom].sources) {
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
    if (reserve) {
        const pathCost = roads ? this.m.linkInfo[spawnRoom].controller.pathSpawnRoad.cost
            : this.m.linkInfo[spawnRoom].controller.pathSpawn.cost;
        const cRs = budget.reserverParts(pathCost);
        const reserverCost = budget.convertPartsToEnergy(0, 0, 0,0, cRs, false);
        value.parts["cR"] = cRs;
        value["runningCostCreeps"] = value["runningCostCreeps"] + reserverCost;
        value["netEnergy"] = value["netEnergy"] - reserverCost;
        value["netParts"] = value["netParts"] + cRs;
        value["profitParts"] = value["netEnergy"]/value["netParts"];
    } else {
        value.parts["cR"] = 0;
    }
};

FlagRoom.prototype.valueDefenceCost = function (spawnRoom, value) {
    
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
    return this.m.sources;
};

FlagRoom.prototype.getMineral = function () {
    return this.m.mineral;
};

FlagRoom.prototype.getController = function () {
    return this.m.controller;
};

FlagRoom.prototype.getSourcePosts = function(sourceId) {
    return this.m.sources[sourceId].harvesterPosts;
};

FlagRoom.prototype.getContainerPos = function (id) {
    if (id === this.m.mineral.id) {
        return this.getMineralContainerPos();
    }
    return this.getSourceContainerPos(id);
};

FlagRoom.prototype.getSourceContainerPos = function (sourceId) {
    return this.m.sources[sourceId].containerPos;
};

FlagRoom.prototype.getControllerPosts = function () {
    return this.m.controller.upgraderPosts;
};

FlagRoom.prototype.getMineralContainerPos = function() {
    return this.m.mineral.containerPos;
};

FlagRoom.prototype.getMineralPosts = function() {
    return this.m.mineral.harvesterPosts;
};

module.exports = FlagRoom;