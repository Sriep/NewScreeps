/**
 * @fileOverview screeps
 * Created by piers on 30/04/2020
 * @author Piers Shepperson
 */
const gc = require("./gc");
const gf = require("./gf");
const profiler = require('screeps-profiler');

const cache = {

    global: function( fn, _this, args, name, force) {
        if (!global[name] || force) {
            global[name] = fn.apply(_this, args);
        }
        return global[name];
    },

    path(from, toArray, name, range, useRoad, cachePath) {
        console.log("cache path from", from, "name", name);
        //console.log("path from", from, "to length", toArray.length, "name", name, "useRoad", useRoad, "redo", redo);
        //console.log("toArray",JSON.stringify(toArray));
        if (toArray.length === 0) {
            //console.log("path toArray.length === 0 toArray", JSON.stringify(toArray));
            return undefined;
        }
        if (!name) {
            name = toArray[0].id;
        }
        if (!range) {
            range = 1
        }
        //let flag;
        //if (cacheResult) {
        //    flag = Game.flags[from.id];
        //    //console.log("path stored in", toArray[0].room.name)
        //    if (!flag.memory[toArray[0].room.name]) {
        //        flag.memory[toArray[0].room.name] ={};
        //    }
        //    if (!flag.memory[toArray[0].room.name][name]) {
        //        flag.memory[toArray[0].room.name][name] ={};
        //    }
        //}
        //const tag = useRoad ? "road" : "noroad";
        //if (cacheResult && !redo && flag.memory[toArray[0].room.name][name][tag]) {
        //    const cachedPath =  flag.memory[toArray[0].room.name][name][tag];
        //    return {
        //        path: this.deserialisePath(cachedPath.path),
        //        ops: cachedPath.ops,
        //        cost: cachedPath.cost,
        //        incomplete: cachedPath.incomplete,
        //    }
        //}

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
        if (cachePath) {
            return {
                path: this.serialisePath(pfPath.path),
                ops: pfPath.ops,
                cost: pfPath.cost,
                incomplete: pfPath.incomplete,
            }
        }
        return {
            path: pfPath.path,
            ops: pfPath.ops,
            cost: pfPath.cost,
            incomplete: pfPath.incomplete,
        }
    },

    distance(from, toArray, name, range, useRoad, redo, cacheResult) {
        const p = this.path(from, toArray, "distance" + name, range, useRoad, redo, cacheResult);
        if (!p) {
            //console.log("cache distance from", from.id, "toArraylength", toArray.length, "name", name,
            //    "range", range, "userRoad", useRoad, "redo", redo, "cacheR", cacheResult)
            //console.log("cache distance p", JSON.stringify(p))
            return
        }
        if (!p.incomplete) {
            return p.cost
        }
     },

    distanceSourceSpawn: function(source, spawnRoom, useRoad, redo) {
        const spawns = spawnRoom.find(FIND_MY_SPAWNS);
        return this.distance(source, spawns, "distanceSourceSpawn spawn11", 1, useRoad, redo);
    },

    distanceSourceController: function (source, room, useRoad, redo) {
        return this.distance(source, [room.controller], "distanceSourceController controller", 1, useRoad, redo);
    },

    distanceUpgraderSpawn: function (fromRoom, spawnRoom, useRoad, redo) {
        const spawns = spawnRoom.find(FIND_MY_SPAWNS);
        return this.distance(fromRoom.controller, spawns, "distanceUpgraderSpawn spawns", 1, useRoad, redo);
    },

    sPos: function (pos) {
        return this.sPoint(pos);
    },

    dPos: function (str, roomName) {
        const point = this.dPoint(str);
        return new RoomPosition(point.x, point.y, roomName)
    },

    sPoint: function (point) {
        return String.fromCharCode(point.x + 50 * point.y);
    },

    dPoint: function(str) {
        const code = str.charCodeAt(0);
        return {"x": code % 50, "y": Math.floor(code / 50)};
    },

    dRoomPos: function(str, roomName) {
        const code = str.charCodeAt(0);
        return new RoomPosition(code % 50, Math.floor(code / 50), roomName)
    },


    serialisePath: function (path) {
        const sPath = [];
        for ( let i in path) {
            sPath.push(path[i].x + 50 * path[i].y);
        }
        return String.fromCharCode(...sPath);
    },

    deserialiseRoArrayN: function(uString, roomName, N) {
        const path = [];
        let n=0;
        for (let i in uString) {
            const code = uString.charCodeAt(i);
            path.push(new RoomPosition(code % 50, Math.floor(code / 50), roomName));
            n++;
            if (n >= N) {
                return path;
            }
        }
        return path;
    },

    deserialiseRoArray: function(uString, roomName) {
        const path = [];
        for (let i in uString) {
            const code = uString.charCodeAt(i);
            path.push(new RoomPosition(code % 50, Math.floor(code / 50), roomName));
        }
        return path;
    },

    deserialisePath: function (uString) {
        const path = [];
        for (let i in uString) {
            const code = uString.charCodeAt(i);
            path.push({"x": code % 50, "y": Math.floor(code / 50)});
        }
        return path;
    },

    deserialiseRoPath: function (uString, startRoom) {
        const path = [];
        let lastX, lastY;
        let rSplit = gf.splitRoomName(startRoom);
        for (let i in uString) {
            const code = uString.charCodeAt(i);
            const x = code % 50;
            const y = Math.floor(code / 50);
            if (lastX !== undefined && lastY !== undefined) {
                if (lastX > x+1) {
                    rSplit.x += rSplit.EW === "W" ? -1 : 1;
                } else if (lastX < x-1) {
                    rSplit.x += rSplit.EW === "W" ? 1 : -1;
                } else if (lastY > y+1) {
                    rSplit.y += rSplit.NS === "N" ? -1 : 1;
                } else if (lastY < y-1) {
                    rSplit.y += rSplit.NS === "N" ? 1 : -1;
                }
                if (rSplit.x < 0) {
                    rSplit.EW = rSplit.EW === "W" ? "E" : "W";
                }
                if (rSplit.y < 0) {
                    rSplit.NS = rSplit.NS === "N" ? "S" : "N";
                }
            }
            path.push(new RoomPosition(x, y, gf.roomNameFromSplit(rSplit)));
            //path.push({x:x, y:y, roomName:gf.roomNameFromSplit(rSplit)});
            lastX = x;
            lastY = y;
        }
        return path;
    },

    deserialiseRnPath: function (uString, startRoom) {
        const path = [];
        let lastX, lastY;
        let rSplit = gf.splitRoomName(startRoom);
        for (let i in uString) {
            const code = uString.charCodeAt(i);
            const x = code % 50;
            const y = Math.floor(code / 50);
            if (lastX !== undefined && lastY !== undefined) {
                if (lastX > x+1) {
                    rSplit.x += rSplit.EW === "W" ? -1 : 1;
                } else if (lastX < x-1) {
                    rSplit.x += rSplit.EW === "W" ? 1 : -1;
                } else if (lastY > y+1) {
                    rSplit.y += rSplit.NS === "N" ? -1 : 1;
                } else if (lastY < y-1) {
                    rSplit.y += rSplit.NS === "N" ? 1 : -1;
                }
                if (rSplit.x < 0) {
                    rSplit.EW = rSplit.EW === "W" ? "E" : "W";
                }
                if (rSplit.y < 0) {
                    rSplit.NS = rSplit.NS === "N" ? "S" : "N";
                }
            }
            //path.push(new RoomPosition(x, y, gf.roomNameFromSplit(rSplit)));
            path.push({x:x, y:y, roomName:gf.roomNameFromSplit(rSplit)});
            lastX = x;
            lastY = y;
        }
        return path;
    },

};

profiler.registerObject(cache, 'cache');

module.exports = cache;