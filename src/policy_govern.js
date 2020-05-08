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
    //console.log("policy govern", JSON.stringify(this));
}

Policy.prototype.initilise = function () {
    if (!this.m) {
        this.m = {}
    }
    this.m.rcl = Game.rooms[this.roomName].controller.level;
    this.m.agendaIndex = -1;
    this.m.childTypes = [];
    this.m.agenda = agenda.peace;
    //console.log("policy govern this.m",JSON.stringify(this));
    return true;
};

Policy.prototype.enact = function () {
    console.log("POLICY_GOVERN enact")
    //console.log("policy govern this.m",JSON.stringify(this.m), "room", Game.rooms[this.roomName]);
    //console.log("policy govern, this.roomName", this.roomName);
    if (Game.rooms[this.roomName].controller.level !== this.m.rcl) {
        this.m.rcl = Game.rooms[this.roomName].controller.level;
        this.m.agendaIndex = -1;
    }
    this.govern();
};

Policy.prototype.govern = function () {

    const room = Game.rooms[this.roomName];
    if (this.m.agendaIndex >= this.m.agenda[this.m.rcl].length) {
        return;
    }
    let agendaItem = this.m.agenda[this.m.rcl][this.m.agendaIndex === -1 ? 0 : this.m.agendaIndex];
    console.log("pg govern agendaItme",agendaItem, "this.m.agendaIndex",this.m.agendaIndex,"this.id", this.id );
    if (this.m.agendaIndex === -1 || agenda.items()[agendaItem].check(room, agendaItem, this.id)) {
        this.m.agendaIndex++;
        console.log("pg govern check succeeded about to enact agendaIndex", this.m.agendaIndex);
        agenda.items()[agendaItem].enact(room, agendaItem, this.id);
        console.log("pg added policy, polices", JSON.stringify(Memory.policies));
        return this.govern(room);
    }
    console.log("pg govern check failed");
};

Policy.prototype.draftReplacment = function() {
    console.log("pg calling draftReplacment");
    return this
};

module.exports = Policy;
































