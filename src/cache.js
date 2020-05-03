/**
 * @fileOverview screeps
 * Created by piers on 30/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");

const cache = {

    path(from, toArray, name, range) {
        if (toArray.length === 0) {
            return undefined;
        }
        if (!name) {
            name = toArrya[0].id;
        }
        if (!range) {
            range = 1
        }

        flag = Game.flags[from.id];
        if (!flag.memory[name]) {
            flag.memory[name] ={};
        }
        if (flag.memory[name].path) {
            return flag.memory[name].path.cost;
        }
        let goals = _.map(toArray, function(to) {
            return { pos: to.pos, range: range };
        });
        pfPath = PathFinder.search(from.pos, goals, {
            maxCost: gc.MAX_HARVESTER_ROUTE_LENGTH
        })
        if (pfPath.incomplete) {
            delete flag.memory[to.id];
            return undefined;
        }
        flag.memory[name].path = {
            path: this.serialisePath(pfPath.path),
            ops: pfPath.ops,
            cost: pfPath.cost,
        }
        return flag.memory[name].path;
    },

    distance(from, toArray, name, range) {
        return this.path(from, toArray, name, range).cost
    },

    distanceSourceSpawn: function (source, room) {
        const d = this.pathSourceSpawn(source, room);
        //console.log("pathSourceSpawn", JSON.stringify(d))
        return d;
    },
    pathSourceSpawn(source, room) {
        const roomName = room.name
        const flag = Game.flags[source.id];
        if (!flag.memory.roomName) {
            flag.memory.roomName = {};
        }
        if (!flag.memory.roomName.path) {
            const spawns = room.find(FIND_MY_SPAWNS);
            const d = this.path(source, spawns, roomName, 1)
            //console.log("path", JSON.stringify(d));
            return d;
        }
        //console.log("cached path", JSON.stringify(flag.memory.roomName.path))
        return flag.memory.roomName.path;
    },

    distanceSourceController: function (source, room) {
        const flag = Game.flags[source.id];
        if (!flag.memory[room.controller.id]) {
            flag.memory[room.controller.id] = {};
        }
        if (!flag.memory[room.controller.id] || !flag.memory[room.controller.id].path) {
            return this.distance(source, [room.controller], room.controller.id, 1);
        }
        return flag.memory[room.controller.id].path.cost;
    },

    distanceUpgraderSpawn: function (fromRoom, spawnRoom) {
        const flag = Game.flags[fromRoom.controller.id];
        if (!flag.memory.roomName) {
            flag.memory.roomName = {};
        }
        if (!flag.memory.roomName.path) {
            const spawns = spawnRoom.find(FIND_MY_SPAWNS);
            return this.distance(fromRoom.controller.id, spawns, spawnRoom, 1);
        }
        return flag.memory.roomName.path.cost;
    },

    serialisePath: function (path) {
        header = {}
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
            path.push({"x": code % 500, "y": Math.floor(code / 50)});
        }
        return path;
    },
}

module.exports = cache;