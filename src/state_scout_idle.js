/**
 * @fileOverview screeps
 * Created by piers on 04/05/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const gf = require("gf");
const flag = require("flag");
const state = require("state");

function State (creep) {
    this.type = gc.STATE_SCOUT_IDLE;
    this.creep = creep;
    //console.log("constructor STATE_SCOUT_IDLE memory", JSON.stringify(this.creep.memory));
    this.m = this.creep.memory;
    //console.log("constructor STATE_SCOUT_IDLE m", JSON.stringify(this.m));
}

State.prototype.enact = function () {
    //const nextRoom = this.m.nextRoom;
    //console.log("STATE_SCOUT_IDLE enact this.m.nextRoom", this.m.nextRoom)
    let dir = this.m.direction;
    if (!dir) {
        dir = TOP;
    }
    //console.log("STATE_SCOUT_IDLE nextroom1", nextRoom, "creep room",this.creep.room.name );
    if (this.m.nextRoom) {
        if (this.m.nextRoom === this.creep.room.name) {
            const exits = Game.map.describeExits( this.m.nextRoom);
            const returnDir = (dir + 4) % 8;
            let nextNextRoom;
            for (let i = (returnDir + 2) % 8; i % 8 !== returnDir; i += 2) {
                const flagI = Game.flags[exits[i]];
                if (flagI && flagI.memory.explored) {
                    continue;
                }
                nextNextRoom = exits[i];
                break;
            }
            if (!nextNextRoom) {
                nextNextRoom = (returnDir + 2) % 8;
            }
            this.m.nextRoom = nextNextRoom
            //console.log("STATE_SCOUT_IDLE nrnextroom",this.m.nextRoom)
        } else {
            if (!gf.validateRoomName(this.m.nextRoom)) {
                delete this.m.nextRoom
                return;
            }
        }
    } else {
        const roomPos = gf.splitRoomName(this.creep.room.name);
        let delta = gf.roomDirectionToDelta(dir, roomPos.EW, roomPos.NS);
        console.log("STATE_SCOUT_IDLE before roomPos", JSON.stringify(roomPos), "delta", JSON.stringify(delta));
        if (roomPos.x*1 + delta.x < 0) {
            delta.x = -1*delta.x
        }
        if (roomPos.y*1 + delta.y < 0) {
            delta.y = -1*delta.y
        }
        console.log("STATE_SCOUT_IDLE after roomPos", JSON.stringify(roomPos), "delta", JSON.stringify(delta));
        this.m.nextRoom = gf.roomNameFromSplit({
            EW: roomPos.EW,
            x: roomPos.x*1 + delta.x,
            NS: roomPos.NS,
            y: roomPos.y*1 + delta.y,
        });
        console.log("STATE_SCOUT_IDLE else this.m.nextRoom", this.m.nextRoom)
    }
    myFlag = Game.flags[this.creep.name];
    //console.log("myFlag pos", JSON.stringify(myFlag));
    if (myFlag) {
        if (myFlag.pos.roomName === this.creep.room.name) {
            console.log("STATE_SCOUT_IDLE move flag this.m.nextRoom", this.m.nextRoom)
            if (!gf.validateRoomName(this.m.nextRoom)) {
                delete this.m.nextRoom;
                this.m.dir = this.m.direction + 2% 8;
                return;
            }
            const newPosition =  new RoomPosition(25, 25, this.m.nextRoom);
            myFlag.setPosition(newPosition);
            //console.log("STATE_SCOUT_IDLE move flag", JSON.stringify(myFlag.pos));
        } else {
            const myFlag = Game.flags[this.creep.name];
            //console.log("STATE_SCOUT_IDLE about to move this.m.nextRoom", this.m.nextRoom)
            const newPosition =  new RoomPosition(25, 25, this.m.nextRoom);
            //console.log("STATE_SCOUT_IDLE about to move to flag flag", JSON.stringify(myFlag.pos), "id", myFlag.id);
            state.switchToMoveFlag(
                this.creep,
                myFlag,
                4,
                gc.STATE_SCOUT_IDLE,
            );
        }
    } else {
        const newPosition =  new RoomPosition(25, 25, this.creep.room.name);
        result = newPosition.createFlag(this.creep.name);
    }
};

module.exports = State;



















