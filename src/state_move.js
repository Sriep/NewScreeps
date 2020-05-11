/**
 * @fileOverview screeps
 * Created by piers on 11/05/2020
 * @author Piers Shepperson
 */
const gf = require("gf");

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
                    creep(name,"memory",JSON.stringify(m));
                    gf.fatalError("moving creep with no _move")
                }
                if (!m._move.path) {
                    creep(name,"memory",JSON.stringify(m));
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

        const probDest = _.filter( destinatons, cNames => cNames > 1 ); {

        }
    }

 };