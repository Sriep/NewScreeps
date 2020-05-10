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
    //console.log("POLICY_GOVERN enact")
    //console.log("policy govern this.m",JSON.stringify(this.m), "room", Game.rooms[this.roomName]);
    //console.log("policy govern, this.roomName", this.roomName);
    if (!Memory.records["rcl "+this.m.rcl] ) {
        Memory.records["rcl "+ Game.rooms[this.roomName].controller.level.toString()] = {};
    }
    if (Game.rooms[this.roomName].controller.level !== this.m.rcl) {
        this.m.rcl = Game.rooms[this.roomName].controller.level;
        this.m.agendaIndex = -1;
        //Memory.records["rcl "+this.m.rcl] = {};
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
    //console.log("pg govern agendaItem",lastAgendaItem, "this.m.agendaIndex",this.m.agendaIndex,"this.id", this.id,"rcl", this.m.rcl );
    if (this.m.agendaIndex === -1 || agenda.items()[lastAgendaItem].check(room, lastAgendaItem, this.id)) {
        //console.log("pg govern check return TRUE for agendaIndex", this.m.agendaIndex, "agendaItem",lastAgendaItem );
        if (this.m.agendaIndex !== -1) {
            Memory.records["rcl " + this.m.rcl][lastAgendaItem + " checked"] = Game.time;
        }
        //if (lastAgendaItem === gc.POLICY_BUILD_EXTENSIONS) {
        //    console.log("pg govern POLICY_BUILD_EXTENSIONS",lastAgendaItem ,"check return TRUE changing to FALSE delaying",this.m.agenda[this.m.rcl][this.m.agendaIndex+1]);
        //    //console.log("force running POLICY_BUILD_EXTENSIONS")
        //    //agenda.items()[gc.POLICY_BUILD_EXTENSIONS].enact(room, gc.POLICY_BUILD_EXTENSIONS, this.id);
        //    return
        //}
        const nextAgendaItem = this.m.agenda[this.m.rcl][this.m.agendaIndex+1];
        //console.log("pg govern now agendaIndex", this.m.agendaIndex+1," about to encat",nextAgendaItem);
        agenda.items()[nextAgendaItem].enact(room, nextAgendaItem, this.id);

        this.m.agendaIndex++;
        Memory.records["rcl "+this.m.rcl][nextAgendaItem + " run"] = Game.time;
        //console.log("pg added policy, polices", JSON.stringify(Memory.policies));
        //console.log("pg agendaIndex", agendaIndex)
        return;
        //return this.govern(room);
    }
    //console.log("pg govern check return FALSE");
};

Policy.prototype.draftReplacment = function() {
    //console.log("pg calling draftReplacment");
    return this
};

module.exports = Policy;
































