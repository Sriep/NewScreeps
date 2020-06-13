/**
 * @fileOverview screeps
 * Created by piers on 26/04/2020
 * @author Piers Shepperson
 */
//const C = require("./Constants");
const gc = require("./gc");

const gf = {
    fatalError: function (...messages) {
        console.log("Fatal error: ", messages);
        console.log(Error().stack);
        if (gc.DEBUG) {
                throw(messages);
        }
    },

    assert: function (a, ...msg) {
        if (!a && gc.DEBUG) {
            console.log("assert failed");
            console.log("assert failed: ", JSON.stringify(a));
            this.fatalError(msg)
        }
    },
    assertEq: function (a, b, ...msg) {
        if (a !== b && gc.DEBUG) {
            console.log("assert failed");
            console.log("assert failed: ", JSON.stringify(a), " !=== ", JSON.stringify(b));
            this.fatalError( msg)
        }
    },
    assertNeq: function (a, b, ...msg) {
        if (a === b && gc.DEBUG) {
            console.log("assert failed");
            console.log("assert failed: ", JSON.stringify(a), " === ", JSON.stringify(b));
            this.fatalError( msg)
        }
    },
    assertGt: function (a, b, ...msg) {
        if (a <= b && gc.DEBUG) {
            console.log("assert failed");
            console.log("assert failed: ", JSON.stringify(a), " < ", JSON.stringify(b));
            this.fatalError( msg)
        }
    },
    assertLt: function (a, b, ...msg) {
        if (a >= b && gc.DEBUG) {
            console.log("assert failed");
            console.log("assert failed: ", JSON.stringify(a), " > ", JSON.stringify(b));
            this.fatalError(msg)
        }
    },

    roomPosFromPos: function(pos, roomName) {
        if (roomName) {
            return new RoomPosition(pos.x, pos.y, roomName)
        } else {
            return new RoomPosition(pos.x, pos.y, pos.roomName)
        }
    },

    isEmpty : function(obj) {
        for (let x in obj) {
            if (obj.hasOwnProperty(x)) {
                return false;
            }
        }
        return true;
    },

    pointEqual: function(p1, p2) {
        return p1.x === p2.x && p1.y === p2.y;
    },

    splitRoomName: function(roomName) {
        //console.log(home);
        const nsew = roomName.split(/[0123456789]/).filter(n=>n);
        const xy = roomName.split(/[NSEW]/).filter(n=>n);
        return { EW: nsew[0], NS: nsew[1], x: xy[0]*1, y: xy[1]*1};
    },

    validateRoomName : function(roomName) {
        if (typeof roomName !== "string") {
            return false;
        }
        if (roomName === "sim") {
            return true;
        }
        const splitName = this.splitRoomName(roomName);
        return (splitName.EW === "E" || splitName.EW === "W")
                && (splitName.NS === "N" || splitName.NS === "S")
                && (0 <= splitName.x && splitName.x <= 999)
                && (0 <= splitName.y && splitName.y <= 999)
                && roomName.length >= 4 && roomName.length <= 8;
    },

    roomNameFromSplit: function(room) {
        //console.log("gf roomNameFromSplit", JSON.stringify(room));
        return room.EW + room.x.toString() + room.NS + room.y.toString();
    },

    exitDirection: function(from, to) {
        const fSplit = this.splitRoomName(from);
        const tSplit = this.splitRoomName(to);
        if (fSplit.EW === tSplit.EW && fSplit.NS === tSplit.NS) {
            if (fSplit.x === tSplit.x) {
                if (fSplit.y > tSplit.y) {
                    return C.FIND_EXIT_BOTTOM
                } else {
                    return C.FIND_EXIT_TOP
                }
            } else {
                if (fSplit.x > tSplit.x) {
                    return C.FIND_EXIT_RIGHT
                } else {
                    return C.FIND_EXIT_LEFT
                }
            }
        }
    },

    roomDirectionToDelta: function(direction, EW, NS) {
        const delta = this.directionToDelta(direction);
        if (EW === "E") {
            delta.x = delta.x*-1;
        }
        if (NS === "S") {
            delta.y = delta.y*-1;
        }
        return delta;
    },

    directionToDelta : function (direction) {
        switch(direction) {
            case TOP: return {x:0,y:-1};
            case TOP_RIGHT: return {x:1,y:-1};
            case RIGHT: return {x:1,y:0};
            case BOTTOM_RIGHT: return {x:1, y:1};
            case BOTTOM: return {x:0,y:1};
            case BOTTOM_LEFT: return {x:-1,y:1};
            case LEFT: return {x:-1,y:0};
            case TOP_LEFT: return{x:-1,y:-1};
            default:
                this.gf.fatalError("unknown direction" + direction.toString());
        }
    },

    needsRepair : function (s) {
        return s.hits < s.hitsMax * gc.STRUCTURE_REPAIR_THRESHOLD
    },

    myControlledRoom : function (room) {
        return !!room.controller && room.controller.my && room.controller.level > 1;
    },

    joinPointsBetween: function (pos1, pos2, creepsAreObsticals) {
        const deltaX = pos1.x - pos2.x;
        const deltaY = pos1.y - pos2.y;
        const offsets = gc.ADJACENCIES[deltaX][deltaY];
        const joinPos = [];
        for (let i = 0 ; i < offsets.length ; i++ ) {
            const pos = new RoomPosition( pos2.x + offsets[i].dx,
                pos2.y + offsets[i].dy,
                pos2.roomName );
            if (gf.isEnterable(pos, creepsAreObsticals)) {
                joinPos.push(pos);
            }
        }
        return joinPos;
    },

    isEnterable: function (pos, creepsAreObsticals) {
        const atPos = pos.look();
        const SWAMP = "swamp";
        const PLAIN = "plain";
        for ( let i = 0 ; i < atPos.length ; i++ )
        {
            switch (atPos[i].type) {
                case LOOK_TERRAIN:
                    if (atPos[i].terrain !== PLAIN && atPos[i].terrain !== SWAMP)
                        {
                            return false;
                        }
                    break;
                case LOOK_STRUCTURES:
                    if (OBSTACLE_OBJECT_TYPES.includes(atPos[i].structure.structureType))
                        {
                            return false;
                        }
                    break;
                case LOOK_CREEPS:
                case LOOK_POWER_CREEPS:
                    return !!creepsAreObsticals;
                case LOOK_SOURCES:
                case LOOK_MINERALS:
                case LOOK_NUKES:
                    return false;
                case LOOK_RUINS:
                case LOOK_DEPOSITS:
                case LOOK_ENERGY:
                case LOOK_RESOURCES:
                case LOOK_TOMBSTONES:
                case LOOK_FLAGS:
                case LOOK_CONSTRUCTION_SITES:
                default:
                    return true;
            }
        }
        return true;
    },

    posPlusDeltaArray(pos, deltas) {
        const rtv = [];
        for (let delta of deltas) {
            rtv.push({"x" : pos.x + delta.x, "y": pos.y + delta.y})
        }
        return rtv;
    },

    loadFromFlag(obj) {
        const objFlag = Game.flags[obj.id];
        if (objFlag) {
            return objFlag.color === gc.FLAG_CLEAR_OBJ.color
                && objFlag.secondaryColor === gc.FLAG_CLEAR_OBJ.secondaryColor
        }
        return false;
    }

};

module.exports = gf;