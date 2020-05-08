/**
 * @fileOverview screeps
 * Created by piers on 07/05/2020
 * @author Piers Shepperson
 */
const agenda = require("agenda");
const flag = require("agenda");

function Governor (roomName) {
    this.home = roomName;
    this.m = flag.getRoomFlag(roomName).memory.spawnQueue;
    if (!this.m) {
        flag.getRoomFlag(roomName).memory.spawnQueue = {}
        this.m = flag.getRoomFlag(roomName).memory.spawnQueue;
        this.initilise();
    }
}

Governor.prototype.initilise = function () {
    this.m.agenda = agenda.peace;
};

Governor.prototype.govern = function () {
    const room = Game.rooms[this.home];
    if (!this.m.rcl || this.m.rcl !== room.controller.level || !this.activityIndex) {
        this.rcl = room.controller.level;
        this.activityIndex = 0;
    } else if (Game.time % gc.BUILD_QUEUE_CHECK_RATE !== 0) {
        return;
    }
    this.startNextPolicy(room);
};

Governor.prototype.startNextPolicy = function (room) {
    const rcl = room.controller.level;
    let policy = this.m.agenda[this.m.rcl][this.m.agendaIndex];
    if (this.m.actionFcs()[activity].check(room, activity, this.id)) {
        if (policy !== gc.AGENDA_FINISHED) {
            this.policyIndex++;
            this.startNextPolicy(room);
        }
    } else {
        this.m.actionFcs()[activity].build(room, activity, this.id);
    }
};

module.exports = Governor;