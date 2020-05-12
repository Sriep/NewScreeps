/**
 * @fileOverview screeps
 * Created by piers on 25/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const agenda = require("agenda");

function Policy  (id, data) {
    this.id = id;
    this.type = gc.POLICY_GOVERN;
    this.roomName = data.roomName;
    this.m = data.m;
}

Policy.prototype.initilise = function () {
    if (!this.m) {
        this.m = {}
    }
    this.m.rcl = Game.rooms[this.roomName].controller.level;
    this.m.agendaIndex = -1;
    this.m.childTypes = [];
    this.m.colonies = [];
    this.m.agenda = agenda.peace;
    return true;
};

Policy.prototype.enact = function () {
   if (!Memory.records["rcl "+this.m.rcl] ) {
        Memory.records["rcl "+ Game.rooms[this.roomName].controller.level.toString()] = {};
    }
    if (Game.rooms[this.roomName].controller.level !== this.m.rcl) {
        this.m.rcl = Game.rooms[this.roomName].controller.level;
        this.m.agendaIndex = -1;
        Memory.records["rcl "+Game.rooms[this.roomName].controller.level.toString()]["entered"] = Game.time;
    }
    this.govern();
};

Policy.prototype.govern = function () {
    const room = Game.rooms[this.roomName];
    if (this.m.agendaIndex >= this.m.agenda[this.m.rcl].length) {
        return;
    }
    const lastAgendaItem = this.m.agenda[this.m.rcl][this.m.agendaIndex === -1 ? 0 : this.m.agendaIndex];
     if (this.m.agendaIndex === -1 || agenda.items()[lastAgendaItem].check(room, lastAgendaItem, this.id)) {
         if (this.m.agendaIndex !== -1) {
            Memory.records["rcl " + this.m.rcl][lastAgendaItem + " checked"] = Game.time;
        }
        const nextAgendaItem = this.m.agenda[this.m.rcl][this.m.agendaIndex+1];
         agenda.items()[nextAgendaItem].enact(room, nextAgendaItem, this.id);

        this.m.agendaIndex++;
        Memory.records["rcl "+this.m.rcl][nextAgendaItem + " run"] = Game.time;
     }
 };

Policy.prototype.addColony = function(roomName) {
    this.m.colonies.push({"name" : roomName, "profit" : profit });
    this.m.colonies = this.m.colonies.sort( function (a,b)  {
        return b.profit - a.profit;
    });
};

Policy.prototype.draftReplacment = function() {
    return this
};

module.exports = Policy;
































