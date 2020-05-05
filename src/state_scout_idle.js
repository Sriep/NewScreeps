/**
 * @fileOverview screeps
 * Created by piers on 04/05/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
//const flag = require("flag");
const state = require("state");

function State (creep) {
    this.type = gc.STATE_SCOUT_IDLE;
    this.creep = creep
}

State.prototype.enact = function () {
    let nextRoom = this.creep.memory.nextRoom;
    let dir = this.creep.memory.direction;
    if (!nextRoom) {
        currentRoom = this.creep.room.name;
        roomPos = gf.splitRoomName(currentRoom);
        delta = gf.roomDirectionToDelta(dir, roomPos.EW, roomPos.NS);
        nextRoom = gf.roomNameFromSplit({
            EW : roomPos.EW,
            x: room.Pos.x+delta.x,
            NS :roomPos.NS,
            y: room.Pos.y+delta.y,
        })
        this.creep.memory.nextRoom = nextRoom;
    } else {
        if (nextRoom === this.creep.room.name) {
            const exits = Game.map.describeExits(nextRoom);
            const  returnDir = (dir + 4) % 8;
            for ( let i = (returnDir+2)%8 ; i%8 !== returnDir ; i+=2) {
                const flagI = Game.flags[exit[i]];
                if (flagI && flagI.memory.explored) {
                    continue;
                }
                nextRoom = exits[i];
                break;
            }
            if (nextRoom === this.creep.room.name) {
                nextRoom = (returnDir+2)%8;
            }
        }
    }
    // next room should now be an adjacent room
    let flag = Game.flags[nextRoom];
    if (!flag) {
        flag = flag.flagRoom(nextRoom)
    }
    state.switchToMoveTarget(
        this.creep,
        flag,
        3,
        gc.STATE_SCOUT_IDLE,
    );
}

module.exports = State;


















