/**
 * @fileOverview screeps
 * Created by piers on 05/06/2020
 * @author Piers Shepperson
 */
const C = require("./Constants");
const gf = require("gf");
const gc = require("gc");
const policy = require("policy");
const StateCreep = require("./state_creep");

class StateDefensiveRetreat extends StateCreep {
    constructor(creep) {
        super(creep);
    }

    enact() {
        const foreignOffice = policy.getPolicyByType(gc.POLICY_FOREIGN_OFFICE);
        const insurgents = foreignOffice.insurgents[this.creep.room.name];
        let direction;
        if (insurgents) {
            for (let insurgent of insurgents) {
                if (this.creep.pos.inRangeTo(insurgent, gc.RANGE_RETREAT_RANGE)) {
                    direction = this.creep.pos.getDirectionTo(insurgent);
                    break;
                }
            }
        }
        if (!direction) {
            return this.switchBack()
        }

        let moveDirection, bestTerrain;
        const roomTerrain = new Room.Terrain(this.creep.room.name);
        for ( let i = 0 ; i < gc.OPPOSITE_DIRECTION[direction].length ; i++ ) {
            const x = this.creep.pos.x + gc.DELTA_DIRECTION[gc.OPPOSITE_DIRECTION[direction][i]].x;
            const y = this.creep.pos.y + gc.DELTA_DIRECTION[gc.OPPOSITE_DIRECTION[direction][i]].y;
            const terrain = roomTerrain.get(x,y);
            if (C.TERRAIN_MASK_WALL !==  terrain
                && (!bestTerrain || C.TERRAIN_MASK_SWAMP !== terrain)) {
                moveDirection = gc.OPPOSITE_DIRECTION[direction][i];
                bestTerrain = terrain;
            }
        }
        if (!moveDirection) {
            for ( var k = 0 ; k < gc.SIDEWAYS_DIRECTION[direction].length ; k++ ) {
                const x = this.creep.pos.x + gc.DELTA_DIRECTION[gc.SIDEWAYS_DIRECTION[direction][k]].x;
                const y = this.creep.pos.y + gc.DELTA_DIRECTION[gc.SIDEWAYS_DIRECTION[direction][k]].y;
                const terrain = roomTerrain.get(x,y);
                if (C.TERRAIN_MASK_WALL !==  terrain
                    && (!bestTerrain || C.TERRAIN_MASK_SWAMP !== terrain)) {
                    moveDirection = gc.OPPOSITE_DIRECTION[direction][k];
                    bestTerrain = terrain;
                }
            }
        }
        if(!moveDirection) {
            this.creep.say("help");
            return;
        }

        const result = this.creep.move(moveDirection);
        switch (result) {
            case OK:                        // The operation has been scheduled successfully.
                break;
            case  ERR_NOT_OWNER:            // You are not the owner of this spawn.
                return gf.fatalError("ERR_NOT_OWNER");
            case ERR_BUSY:                  // The creep is still being spawned.
                //console.log("moveTo returns  ERR_BUSY error) // thinks means spawning
                return ERR_BUSY;
            case ERR_NOT_IN_RANGE:     // The specified path doesn't match the creep's location.
                return gf.fatalError("ERR_NOT_IN_RANGE");
            case ERR_INVALID_ARGS:          // path is not a valid path array.
            //return gf.fatalError("ERR_INVALID_ARGS");
            case ERR_TIRED:        // The fatigue indicator of the creep is non-zero.
                return ERR_TIRED;
            case ERR_NO_BODYPART:        // There are no MOVE body parts in this creep’s body.
                return gf.fatalError("ERR_NO_BODYPART");
            default:
                console.log(this.creep.name, "targetSTATE_MOVE_POS", JSON.stringify(this.targetPos));
                console.log("creep memory", JSON.stringify(this.memory));
                return gf.fatalError("moveByPath unrecognised return|", result,"|");
        }
    };

}



module.exports = StateDefensiveRetreat;