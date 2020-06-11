/**
 * @fileOverview screeps
 * Created by piers on 04/05/2020
 * @author Piers Shepperson
 */
const gc = require("./gc");
const gf = require("./gf");
const StateCreep = require("./state_creep");

class StateScoutIdle  extends StateCreep {
    constructor(creep) {
        super(creep);
    }

    enact() {
        //console.log("STATE_SCOUT_IDLE");
        if (!this.direction) {
            this.direction = TOP;
        }
        if (this.direction > 8) {
            this.direction = this.direction % 8;
        }
        //console.log(this.creep.name,"STATE_SCOUT_IDLE nextroom1", this.nextRoom, "dir", this.direction);
        if (this.nextRoom) {
            if (this.nextRoom === this.creep.room.name) {
                //const myFlag = Game.flags[this.creep.name];
                //myFlag.setPosition(Game.rooms[this.creep.room.name].controller.pos);

                const exits = Game.map.describeExits( this.nextRoom);
                //console.log("exits", JSON.stringify(exits));
                const returnDir = (this.direction + 4) % 8;
                let nextNextRoom;
                for (let i = (returnDir + 2) % 8; i % 8 !== returnDir; i += 2) {
                    const flagI = Game.flags[exits[i]];
                    //console.log(i,"flagI",flagI,"memory",JSON.stringify(flagI))
                    if (flagI && flagI.memory.explored) {
                        continue;
                    }
                    nextNextRoom = exits[i];
                    break;
                }
                if (!nextNextRoom) {
                    nextNextRoom = exits[(returnDir + 2) % 8];
                }
                this.nextRoom = nextNextRoom;
                //console.log(this.creep.name,"STATE_SCOUT_IDLE nrnextroom",this.nextRoom)
            } else {
                if (!gf.validateRoomName(this.nextRoom)) {
                    //console.log(this.creep.name,"STATE_SCOUT_IDLE !validateRoomName", this.nextRoom);
                    delete this.nextRoom;
                    //return;
                }
            }
        } else {
            const roomPos = gf.splitRoomName(this.creep.room.name);
            //console.log(this.creep.name,"STATE_SCOUT_IDLE roomname",this.creep.room.name,"split",JSON.stringify(roomPos),"directaion",this.direction);
            let delta = gf.roomDirectionToDelta(this.direction, roomPos.EW, roomPos.NS);
            //console.log(this.creep.name,"STATE_SCOUT_IDLE before roomPos", JSON.stringify(roomPos), "delta", JSON.stringify(delta));
            if (roomPos.x*1 + delta.x < 0) {
                delta.x = -1*delta.x
            }
            if (roomPos.y*1 + delta.y < 0) {
                delta.y = -1*delta.y
            }
            //console.log(this.creep.name,"STATE_SCOUT_IDLE after roomPos", JSON.stringify(roomPos), "delta", JSON.stringify(delta));
            this.nextRoom = gf.roomNameFromSplit({
                EW: roomPos.EW,
                x: roomPos.x*1 + delta.x,
                NS: roomPos.NS,
                y: roomPos.y*1 + delta.y,
            });
            //console.log("STATE_SCOUT_IDLE else this.nextRoom", this.nextRoom)
            const myFlag = Game.flags[this.creep.name];
            //console.log("myFlag pos", JSON.stringify(myFlag));
            if (myFlag) {
                if (myFlag.pos.roomName === this.creep.room.name) {
                    //console.log(this.creep.name,"STATE_SCOUT_IDLE move flag this.nextRoom", this.nextRoom)
                    if (!gf.validateRoomName(this.nextRoom)) {
                        //console.log(this.creep.name,"STATE_SCOUT_IDLE deleting next room", this.nextRoom)
                        delete this.nextRoom;
                        this.direction = this.direction + 2% 8;
                        return;
                    }
                    const newPosition =  new RoomPosition(25, 25, this.nextRoom);
                    myFlag.setPosition(newPosition);
                    //console.log(this.creep.name,"STATE_SCOUT_IDLE move flag", JSON.stringify(myFlag.pos));
                } else {
                    const myFlag = Game.flags[this.creep.name];
                    //console.log("STATE_SCOUT_IDLE about to move this.nextRoom", this.nextRoom)
                    //const newPosition =  new RoomPosition(25, 25, this.nextRoom);
                    //console.log(this.creep.name,"STATE_SCOUT_IDLE about to move to flag flag", JSON.stringify(myFlag.pos), "id", myFlag.id);
                    return this.switchToMoveFlag(
                        myFlag,
                        4,
                        gc.STATE_SCOUT_IDLE,
                    );
                }
            } else {
                const newPosition =  new RoomPosition(25, 25, this.creep.room.name);
                newPosition.createFlag(this.creep.name);
            }
        }
    }
}

//StateScoutIdle.prototype = Object.create(state);
//StateScoutIdle.prototype.constructor = StateScoutIdle;



module.exports = StateScoutIdle;



















