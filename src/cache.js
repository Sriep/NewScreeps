/**
 * @fileOverview screeps
 * Created by piers on 30/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");

const cache = {

    distanceSourceSpawn: function (source, room) {
        const flag = Game.flags[source.id];
        if (!flag.memory.roomName.spawn) {
            const spawns = room.find(FIND_MY_SPAWNS);
            console.log("distanceSourceSpawn sawns", spawns)
            let goals = _.map(room.find(FIND_MY_SPAWNS), function(spawn) {
                return { pos: spawn.pos, range: 1 };
            });
            pfPath = PathFinder.search(source.pos, goals, {
                maxCost: gc.MAX_HARVESTER_ROUTE_LENGTH
            })
            console.log("distanceSourceSpawn path", JSTON.toString(path))
            if (ret.incomplete) {
                return undefined;
            }
            flag.memory.roomName.spawn = {
                path: this.serialisePath(pfPath.path),
                ops: pfPath.ops,
                cost: pfPath.cost,
            }
            console.log("distanceSourceSpawn flag", JSTON.toString(flag.memory))
            return pfPath.cost;
        }
        return flag.memory.roomName.spawn.cost;
    },

    distanceSourceController: function (source, room) {
        const flag = Game.flags[source.id];
        if (!flag.memory.roomName.controller) {
            console.log("distanceSourceSpawn con", spawns);
            let goal = { pos: room.contorller.pos, range: 1 }
            pfPath = PathFinder.search(source.pos, goal, {
                maxCost: gc.MAX_HARVESTER_ROUTE_LENGTH
            })
            console.log("distanceSourceSpawn path", JSTON.toString(path))
            if (ret.incomplete) {
                return undefined;
            }
            flag.memory.roomName.controller = {
                path: this.serialisePath(pfPath.path),
                ops: pfPath.ops,
                cost: pfPath.cost,
            }
            console.log("distanceSourceSpawn flag", JSTON.toString(flag.memory))
            return pfPath.cost;
        }
        return flag.memory.roomName.controller.cost;
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