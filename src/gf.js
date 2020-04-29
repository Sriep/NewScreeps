/**
 * @fileOverview screeps
 * Created by piers on 26/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");

const gf = {
    fatalError: function (msg) {
        console.log("Fatal error!",msg);
        console.log(Error().stack)
        if (gc.DEBUG)
            throw(msg);
    },

    roomPosFromPos(pos) {
        return new RoomPosition(pos.x, pos.y, pos.roomName)
    },

    needsRepair : function (s) {
        return s.hits < s.hitsMax * gc.STRUCTURE_REPAIR_THRESHOLD
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
            if (gf.isEnterable(pos, creepsAreObsticals)) joinPos.push(pos);
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
                        return false;
                    break;
                case LOOK_STRUCTURES:
                    if (OBSTACLE_OBJECT_TYPES.includes(atPos[i].structure.structureType))
                        return false;
                    break;
                case LOOK_CREEPS:
                case LOOK_POWER_CREEPS:
                    return !!creepsAreObsticals;
                case LOOK_SOURCES:
                case LOOK_MINERALS:
                case LOOK_NUKES:
                    return false
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

}

module.exports = gf;