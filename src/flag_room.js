/**
 * @fileOverview screeps
 * Created by piers on 25/05/2020
 * @author Piers Shepperson
 */

const flag = require("flag");

function FlagRoom (name) {
    this.name = name;
    this.m = flag.getRoomFlag(name).memory;
}

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