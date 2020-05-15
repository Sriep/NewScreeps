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
    this.m.colonies = [this.roomName];
    console.log("this.m.colonies", JSON.stringify(this.m.colonies));
    this.m.agenda = agenda.peace;
    this.m.parts = 0;
    return true;
};

Policy.prototype.enact = function () {
    console.log("POLICY_GOVERN enact colonies", JSON.stringify(this.m.colonies));
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
    //console.log("govern lastAgendaItem", lastAgendaItem)
    if (this.m.agendaIndex === -1 || agenda.items()[lastAgendaItem].check(room, lastAgendaItem, this.id)) {
        if (this.m.agendaIndex !== -1) {
            Memory.records["rcl " + this.m.rcl][lastAgendaItem + " checked"] = Game.time;
        }
        const nextAgendaItem = this.m.agenda[this.m.rcl][this.m.agendaIndex+1];
        // console.log("govern check PASSED next", nextAgendaItem);
        agenda.items()[nextAgendaItem].enact(room, nextAgendaItem, this.id);

        this.m.agendaIndex++;
        Memory.records["rcl "+this.m.rcl][nextAgendaItem + " run"] = Game.time;
        //return;
    }
    ///console.log("govern check FAILED")
 };

Policy.prototype.getColonies = function() {
    const colonies = [];
    for (let i in this.m.colonies) {
        colonies.push(this.m.colonies[i].name)
    }
    return [this.roomName]
    //return colonies;
};

Policy.prototype.budget = function() {
    let budget = policy.getRoomEconomyPolicy(this.roomName).budget();
    for (let colony of colonies) {
        if (colony !== this.roomName) {
            budget.parts += colony.parts;
        }
    }
    this.m.parts = budget.parts;
    return budget
};

Policy.prototype.addColony = function(roomName, profit, parts) {
    if ((this.m.parts + parts + gc.COLONY_PARTS_MARGIN > this.partsSurppliedLT())) {
        return false;
    }
    if (profit < gc.COLONY_PROFIT_MARGIN) {
        return false;
    }

    this.m.colonies.push({"name" : roomName, "profit" : profit, "parts": parts });
    this.m.colonies = this.m.colonies.sort( function (a,b)  {
        return b.profit - a.profit;
    });
    this.m.parts += parts;
};

Policy.prototype.partsSurppliedLT = function() {
    const spawns = Game.rooms[this.RoomName].find(FIND_MY_SPAWNS).length;
    return spawns * CREEP_LIFE_TIME / 3;
};

Policy.prototype.draftReplacment = function() {
    return this
};

module.exports = Policy;
































