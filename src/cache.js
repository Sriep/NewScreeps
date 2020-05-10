/**
 * @fileOverview screeps
 * Created by piers on 30/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");

const cache = {

    path(from, toArray, name, range, useRoad, redo) {
        //console.log("path from", from, "to length", toArray.length, "name", name, "useRoad", useRoad, "redo", redo);
        if (toArray.length === 0) {
            console.log("path toArray.length === 0 toArray", JSON.stringify(toArray));
            return undefined;
        }
        if (!name) {
            name = toArrya[0].id;
        }
        if (!range) {
            range = 1
        }
        flag = Game.flags[from.id];
        //console.log("path stored in", toArray[0].room.name)
        if (!flag.memory[toArray[0].room.name]) {
            flag.memory[toArray[0].room.name] ={};
        }
        if (!flag.memory[toArray[0].room.name][name]) {
            flag.memory[toArray[0].room.name][name] ={};
        }
        const tag = useRoad ? "road" : "noroad";
        if (!redo && flag.memory[toArray[0].room.name][name][tag]) {
            //console.log("pathflag.memory ", JSON.stringify(flag.memory[toArray[0].room.name]))
            return flag.memory[toArray[0].room.name][name][tag];
        }
        let goals = _.map(toArray, function(to) {
            return { pos: to.pos, range: range };
        });
        let pfPath;
        if (useRoad) {
            pfPath = PathFinder.search(from.pos, goals, {
                maxCost: gc.MAX_HARVESTER_ROUTE_LENGTH,
                swampCost: 1,
            })
        } else {
            pfPath = PathFinder.search(from.pos, goals, {
                maxCost: gc.MAX_HARVESTER_ROUTE_LENGTH,
                swampCost: 5,
            })
        }

        flag.memory[toArray[0].room.name][name][tag] = {
            path: this.serialisePath(pfPath.path),
            ops: pfPath.ops,
            cost: pfPath.cost,
            incomplete: pfPath.incomplete,
        };
        return flag.memory[toArray[0].room.name][name][tag];
    },

    distance(from, toArray, name, range, useRoad) {
        //const flag = Game.flags[from.id];
        //const tag = useRoad ? "road" : "noroad";
        //const room = toArray[0].room;
        //if (!flag.memory[name] || !flag.memory[name][tag] ) {
            const p = this.path(from, toArray, name, range, useRoad);
            //console.log("name", name,"tag", tag,"cache distance", JSON.stringify(flag.memory))
            //console.log(p.cost,"cache distance", JSON.stringify(p))
            return p.cost
        //}

        //console.log("name", name,"tag", tag,"cache distance", JSON.stringify(flag.memory))
        //console.log(flag.memory[name][tag].cost,"chache distance3", JSON.stringify(flag.memory[name][tag]))
        //return flag.memory[name][tag].cost;
    },

    distanceSourceSpawn: function(source, spawnRoom, useRoad, redo) {
        spawns = spawnRoom.find(FIND_MY_SPAWNS);
        return this.distance(source, spawns, "spawn", 1, useRoad, redo);
    },

    distanceSourceController: function (source, room, useRoad, redo) {
        return this.distance(source, [room.controller], "controller", 1, useRoad, redo);
    },

    distanceUpgraderSpawn: function (fromRoom, spawnRoom, useRoad, redo) {
        spawns = spawnRoom.find(FIND_MY_SPAWNS);
        return this.distance(fromRoom.controller, spawns, "spawns", 1, useRoad, redo);
    },

    global: function(fn, name, args) {
        if (!global[name]) {
            global[name] = fn(...args);
        }
        return global[name];
    },

    sPos: function (pos) {
        return this.sPoint(pos) + pos.roomName;
    },

    dPos: function (dPos) {
        const point = dPoint(dPos);
        return new RoomPosition(point.x, point.y, dPos.substring(1))
    },

    sPoint: function (point) {
        return String.fromCharCode(point.x + 50 * point.y);
    },

    dPoint: function(str) {
        const code = str.charCodeAt(0)
        return {"x": code % 50, "y": Math.floor(code / 50)};
    },

    dRoomPos: function(str, roomName) {
        const code = str.charCodeAt(0);
        console.log("dRoomPos code", code,"x",code % 50,"y",Math.floor(code / 50),"room",roomName);
        return new RoomPosition(code % 50, Math.floor(code / 50), roomName)
    },


    serialisePath: function (path) {
        let sPath = [];
        for ( let i in path) {
            sPath.push(path[i].x + 50 * path[i].y);
        }
        return String.fromCharCode(...sPath);
    },

    deserialisePath: function (uString, headerOnly) {
        let path = [];
        for (let i in uString.length) {
            code = uString.charCodeAt(i)
            path.push({"x": code % 50, "y": Math.floor(code / 50)});
        }
        return path;
    },
}

module.exports = cache;