/**
 * @fileOverview screeps
 * Created by piers on 25/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const agenda = require("agenda");
const policy = require("policy");

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
    this.m.colonies = [{ "name" : this.roomName }];
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
        Memory.agenda.push("rcl "+Game.rooms[this.roomName].controller.level.toString() + " " + Game.time.toString())
    }
    this.govern();
};

Policy.prototype.govern = function () {
    const room = Game.rooms[this.roomName];
    if (this.m.agendaIndex >= this.m.agenda[this.m.rcl].length) {
        return;
    }
    const lastAgendaItem = this.m.agenda[this.m.rcl][this.m.agendaIndex === -1 ? 0 : this.m.agendaIndex];
    console.log("govern lastAgendaItem", lastAgendaItem);
    if (this.m.agendaIndex === -1 || agenda.items()[lastAgendaItem].check(room, lastAgendaItem, this.id)) {
        if (this.m.agendaIndex !== -1) {
            Memory.agenda.push(lastAgendaItem + " checked " + Game.time.toString())
        }
        const nextAgendaItem = this.m.agenda[this.m.rcl][this.m.agendaIndex+1];
        console.log("govern check PASSED next", nextAgendaItem);
        agenda.items()[nextAgendaItem].enact(room, nextAgendaItem, this.id);

        this.m.agendaIndex++;
        Memory.records["rcl "+this.m.rcl][nextAgendaItem + " run"] = Game.time;
        return;
    }
    Memory.agenda.push(lastAgendaItem + " enacted " + Game.time.toString())
 };

Policy.prototype.getColonies = function() {
    return [...this.m.colonies];
};

Policy.prototype.budget = function() {
    let budget = policy.getRoomEconomyPolicy(this.roomName).budget();
    console.log("POLICY_GOVERN getRoomEconomyPolicy parts", budget.parts);
    console.log("this.m.colonies",JSON.stringify(this.m.colonies), "this.rooName", this.roomName);

    this.m.colonies[0]["parts"] = 500-budget.parts;
    for (let colony of this.m.colonies) {
        console.log("colony", JSON.stringify(colony), "this.roomName");
        if (colony.name !== this.roomName) {
            console.log("budget.parts",budget.parts,"colony.parts",colony.parts);
            budget.parts -= colony.parts;
            console.log("budget.parts",budget.parts,"colony.parts",colony.parts)
        }
    }
    this.m.parts = budget.parts;
    console.log("POLICY_GOVERN parts", this.m.parts, "budget rtv", JSON.stringify(budget));
    return budget
};

Policy.prototype.addColony = function(roomName, profit, parts) {
    console.log("POLICY_GOVERN addColony profit", profit, "parts",parts, "this.m.colonies", JSON.stringify(this.m.colonies));
    //const localParts = policy.getRoomEconomyPolicy(this.roomName).budget().parts;
    //this.m.parts = this.m.parts - this.m.colonies[0].parts + localParts;
    //this.m.colonies[0].parts = localParts;

    if (profit < gc.COLONY_PROFIT_MARGIN) {
        console.log("POLICY_GOVERN addColony failed profit",profit,"martgin",gc.COLONY_PROFIT_MARGIN);
        return false;
    }
    for (let colony of this.m.colonies) {
        if (colony.name === roomName) {
            console.log("POLICY_GOVERN addColony already added");
            return false;
        }
    }

    this.m.colonies.push({"name" : roomName, "profit" : profit, "parts": parts, "profitpart" : profit/parts });
    this.m.colonies = this.m.colonies.sort( function (a,b)  {
        return b.profit/b.parts - a.profit/a.parts;
    });
    console.log("POLICY_GOVERN addColony this.m.colonies now", JSON.stringify(this.m.colonies));

    if ((this.m.parts + parts + gc.COLONY_PARTS_MARGIN > this.partsSurppliedLT())) {
        console.log("POLICY_GOVERN addColony failed parts", this.m.parts, "parts", parts,"this.partsSurppliedLT()",this.partsSurppliedLT());
        let parts = 0;
        let index = 0;
        for ( ; index < this.m.colonies ; index++ ) {
            if (parts + colony.parts + gc.COLONY_PARTS_MARGIN > this.partsSurppliedLT()) {
                break;
            }
            parts += colony.parts;
        }
        this.m.parts = parts;
        const colonyLength = this.m.colonies.length;
        for ( ; index < colonyLength ; index++ ) {
            this.m.colonies.pop() //todo need to do sometihng with rtv?
        }
        console.log("addColony new this.m.colonies", JSON.stringify(this.m.colonies));
        return true; // todo maybe
    }

    this.m.parts += parts;
    console.log("POLICY_GOVERN addColony success parts", this.m.parts,"colonies", JSON.stringify(thie.m.colonies));
    return true;
};

Policy.prototype.partsSurppliedLT = function() {
    const spawns = Game.rooms[this.RoomName].find(FIND_MY_SPAWNS).length;
    return spawns * CREEP_LIFE_TIME / 3;
};

Policy.prototype.draftReplacment = function() {
    return this
};

module.exports = Policy;
































