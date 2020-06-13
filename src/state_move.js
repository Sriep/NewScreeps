/**
 * @fileOverview screeps
 * Created by piers on 11/05/2020
 * @author Piers Shepperson
 */
const gf = require("gf");
const C = require("./Constants");

// todo implement central moving
const move = {

    movingCreeps: [],

    addCreep : function(creep) {
        this.movingCreeps.push(creep.name)
    },

    posToString : function(pos) {
        let str = pos.x > 10 ? pos.x.toString() : "0" + pos.x.toString();
        str += pos.y > 10 ? pos.y.toString() : "0" + pos.y.toString();
        return str + pos.roomName;
    },

    moveCreeps : function() {
        const destinatons = {};
        for (let name in Game.creeps) {
            const m = Game.creeps[name].memory;
            let targetPos;
            if (this.movingCreeps.includes(name)) {
                if (!m._move) {
                    //creep(name,"memory",JSON.stringify(m));
                    gf.fatalError("moving creep with no _move")
                }
                if (!m._move.path) {
                    this.creep(name,"memory",JSON.stringify(m));
                    gf.fatalError("moving creep with no _move.path")
                }
                targetPos = m._move.path.substr(0,4) + m_move.room;
            } else {
                targetPos = posToString(Game.creeps[name].pos)
            }
            if (!destinatons[targetPos]) {
                destinatons[targetPos] = []
            }
            destinatons[targetPos].push(name);
        }

    },

    pathBlocked : function(pos) {
        //const pos = cache.dPos(this.m.path.substring(1,1), this.creep.pos.home)
        for (let item of pos.look()) {
            if (item.type === "structure"
                && item.structure.structureType !== C.STRUCTURE_ROAD
                && item.structure.structureType !== C.STRUCTURE_CONTAINER
                && (item.structure.structureType !== C.STRUCTURE_RAMPART && item.structure.my)) {
                //console.log("pathBlocked", true);
                return true;
            }
        }
    },


 };

module.exports = move;