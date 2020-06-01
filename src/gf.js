/**
 * @fileOverview screeps
 * Created by piers on 26/04/2020
 * @author Piers Shepperson
 */
const C = require("./Constants");
const gc = require("./gc");

const gf = {
    fatalError: function (msg) {
        console.log("Fatal error: ",msg);
        console.log(Error().stack);
        if (gc.DEBUG)
            {
                throw(msg);
            }
    },

    roomPosFromPos: function(pos, roomName) {
        if (roomName) {
            return new RoomPosition(pos.x, pos.y, roomName)
        } else {
            return new RoomPosition(pos.x, pos.y, pos.roomName)
        }
    },

    pointEqual: function(p1, p2) {
        return p1.x === p2.x && p1.y === p2.y;
    },

    splitRoomName: function(roomName) {
        //console.log(roomName);
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

    resource : function (color, secondaryColor) {
        return Object.keys(gc.LAB_COLOURS).find(key =>
            gc.LAB_COLOURS[key] === { color : color, secondaryColor: secondaryColor }
        );
    },

    reagents: function(resourceId) {
        for ( let i in C.REACTIONS) {
            for ( let j in C.REACTIONS[i] ) {
                if (C.REACTIONS[i][j] === resourceId) {
                    return [ i, j ];
                }
            }
        }
        return [];
    },

    reagentMap : function (root, storage) {
        const map = [];
        for (let reagent of gf.reagents(root)) {
            if (gc.ATOMIC_RESOURCES.includes(reagent) || reagent in storage) {
                map.push(reagent)
            } else {
                map.push(this.reagentMap(reagent, storage))
            }
        }
        return map;
    },

    mapReagentsToLabs : function (leftMap, labsInRange, labsLeft, rightStack, labMap, leafLabs) {
        if (labsInRange.length === 0 || labsLeft.length === 0) {
            return { ok:false }
        }
        if (leftMap.length === 1) {
            const leafLabsOk = leafLabs.filter(v => labsInRange.includes(v));
            for ( let lab of leafLabsOk) {
                let ok = true;
                let mapping = [];
                while (rightStack.length > 0 || !ok) {
                    const left = rightStack.pop();
                    const right = this.mapReagentsToLabs(
                        left.map,
                        left.labsInRange.filter(v => labsLeft.includes(v) && v !== lab),
                        labsLeft.filter(v => v !== lab),
                        rightStack,
                        labMap,
                        leafLabs
                    );
                    ok = right.ok;
                    if (ok) {
                        mapping = mapping.concat(right.mapping);
                    }
                }
                if (ok) {
                    mapping[lab] = leftMap[0];
                    return { "ok": true, "mapping": mapping }
                }
            }
        } if (leftMap.length === 2) {
            for ( let i = labsInRange.length-1 ; i >= 0 ; i-- ) {
                rightStack.push({
                    map: leftMap[1],
                    labsInRange: labMap(labsInRange[i]),
                });
                const left = this.mapReagentsToLabs(
                    leftMap[0],
                    labMap(labsInRange[i]).filter(v => labsLeft.includes(v)),
                    labsLeft.filter(v => v !== labsInRange[i]),
                    rightStack,
                    labMap,
                );
                if (left.ok) {
                    return left;
                }
            }
        } else {
            console.log("leftMap", JSON.stringify(leftMap));
            gf.fatalError("something wrong in mapReagentsToLabs")
        }

    },

    expandReagentArray : function (reagents, storage) {
        //console.log("expandReagentArray reagents",JSON.stringify(reagents)
        //    ,"storage",JSON.stringify(storage))
        //console.log("!storage[ZK]", "ZK" in storage, storage["ZK"])
        let temp = [...reagents];
        let atoms = [];
        for (let reagent of reagents) {
            if (!gc.ATOMIC_RESOURCES.includes(reagent) && !(reagent in storage)) {
                temp = gf.reagents(reagent).concat(temp)
            } else {
                atoms.push(reagent)
            }
        }
        //console.log("atoms",JSON.stringify(atoms), "temp",JSON.stringify(temp));
        return [...new Set(atoms.concat(temp))];
    },

    assesProducts : function(totals, numLabs) {
        let products = gf.findProducts(totals);
        let productCount = Object.keys(products).length;
        if (numLabs < 5 || productCount === 0) {
            return products
        }

        products = gf.findProducts(totals, products);
        const productCount2 = Object.keys(products).length;
        if (numLabs < 7 || productCount === productCount2) {
            return products
        }

        products = gf.findProducts(totals, products);
        const productCount3 = Object.keys(products).length;
        if (numLabs <= 9 || productCount2 === productCount3) {
            return products
        }

        products = gf.findProducts(totals, products);
        return products
    },

    findProducts: function(totals, products) {
        if (products && Object.keys(products).length > 0) {
            for (let reagent1 in products) {
                if (C.REACTIONS[reagent1]) {
                    for (let reagent2 in totals) {
                        if (C.REACTIONS[reagent1][reagent2]) {
                            products[C.REACTIONS[reagent1][reagent2]] = [
                                reagent1, reagent2
                            ]
                        }
                    }
                    for (let reagent2 in products) {
                        if (C.REACTIONS[reagent1][reagent2]) {
                            products[C.REACTIONS[reagent1][reagent2]] = [
                                reagent1, reagent2
                            ]
                        }
                    }
                }
            }
        } else {
            products = {};
            for (let reagent1 in totals) {
                if (C.REACTIONS[reagent1]) {
                    for (let reagent2 in totals) {
                        if (C.REACTIONS[reagent1][reagent2]) {
                            products[C.REACTIONS[reagent1][reagent2]] = [
                                reagent1, reagent2
                            ]
                        }
                    }
                }
            }
        }
        return products;
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
    }

};

module.exports = gf;