/**
 * @fileOverview screeps
 * Created by piers on 25/05/2020
 * @author Piers Shepperson
 */

const flag = require("flag");

function FlagRoom (name) {
    this.name = name;
    const roomFlag = flag.getRoomFlag(name);
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
    "InvaderOwned" : "InvaderOwned",
    "InvaderReserved" : "InvaderReserved",
    "SourceKeeper" : "SourceKeeper",
    "Neutral" : "Neutral",
    "Unknown" : "Unknown",
};

FlagRoom.prototype.mapRoom = function() {
    if (!this.updateRoomType()) {
        return false;
    }
    
};

FlagRoom.prototype.updateRoomType = function () {
    const room = Game.rooms[newRoom];
    if (!room) {
        return false;
    }
    if (room.controller.my) {
        this.m.roomType = (room.controller.level > 0)
            ? this.RoomType.MyOwned : this.RoomType.MyReserved;
        return true;
    }
    if (room.controller.owner && room.controller.owner !== "Invader") {
        this.m.roomType = (room.controller.level > 0)
            ? this.RoomType.UserOwned : this.RoomType.UserReserved;
        return true;
    }
    if (room.controller.owner === "Invader") {
        this.m.roomType = (room.controller.level > 0)
            ? this.RoomType.InvaderOwned : this.RoomType.InvaderReserved;
        return true;
    }
    const lairs = room.find(FIND_STRUCTURES, {
        filter: { structureType: STRUCTURE_KEEPER_LAIR }
    });
    if (lairs.length > 0) {
        this.m.roomType = this.RoomType.SourceKeeper;
        return true;
    }
    const cores = room.find(FIND_STRUCTURES, {
        filter: { structureType: STRUCTURE_INVADER_CORE }
    });
    if (cores.length > 0) {
        this.m.roomType = this.RoomType.InvaderOwned;
        return true
    }
    this.m.roomType = this.RoomType.Neutral;
    return true;
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