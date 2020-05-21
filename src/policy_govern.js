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
    //console.log("this.m.colonies", JSON.stringify(this.m.colonies));
    this.m.agenda = agenda.peace;
    this.m[gc.ACTIVITY_FOREIGN_MINING] = false;
    this.m.parts = 0;
    return true;
};

Policy.prototype.enact = function () {
    console.log("POLICY_GOVERN enact foreign mining", this.m[gc.ACTIVITY_FOREIGN_MINING],"colonies", JSON.stringify(this.m.colonies));
    if (!Memory.records["rcl "+this.m.rcl] ) {
        Memory.records["rcl "+ Game.rooms[this.roomName].controller.level.toString()] = {};
    }
    if (Game.rooms[this.roomName].controller.level !== this.m.rcl) {
        this.m.rcl = Game.rooms[this.roomName].controller.level;
        this.m.agendaIndex = -1;
        Memory.records.agenda.push("rcl "+Game.rooms[this.roomName].controller.level.toString() + " " + Game.time.toString())
    }
    this.govern();
};

Policy.prototype.govern = function () {
    if (this.m.agendaIndex >= this.m.agenda[this.m.rcl].length) {
        return;
    }
    const lastAgendaItem = this.m.agenda[this.m.rcl][this.m.agendaIndex === -1 ? 0 : this.m.agendaIndex];
    console.log("govern lastAgendaItem", lastAgendaItem);
    if (this.m.agendaIndex === -1 || agenda.items()[lastAgendaItem].check(lastAgendaItem, this.id)) {
        if (this.m.agendaIndex !== -1) {
            //Memory.agenda.push(lastAgendaItem + " checked " + Game.time.toString())
        }
        const nextAgendaItem = this.m.agenda[this.m.rcl][this.m.agendaIndex+1];
        console.log("govern check PASSED next", nextAgendaItem);
        agenda.items()[nextAgendaItem].enact(nextAgendaItem, this.id);

        this.m.agendaIndex++;
        Memory.records.agenda.push(nextAgendaItem + " run " +  Game.time);
        //return;
    }
    //Memory.agenda.push(lastAgendaItem + " enacted " + Game.time.toString())
 };

Policy.prototype.getColonies = function() {
    return [...this.m.colonies]
};

Policy.prototype.budget = function() {
    let localBudget = policy.getRoomEconomyPolicy(this.roomName).localBudget();
    //console.log("POLICY_GOVERN getRoomEconomyPolicy parts", JSON.stringify(localBudget));
    //console.log("this.m.colonies",JSON.stringify(this.m.colonies), "this.rooName", this.roomName);

    this.m.colonies[0]["parts"] = localBudget.parts;
    this.m.colonies[0]["profit"] = localBudget.profit;
    this.m.colonies[0]["profitpart"] = localBudget.profitpart;
    const result = {
        "profit" : 0,
        "parts" : 0,
        "spawnPartsLT" : localBudget["spawnPartsL"],
    };
    for (let colony of this.m.colonies) {
       result["profit"] += colony.profit;
       result["parts"] += colony.parts;
    }
    this.m.parts = result.parts;
    //result[gc.ACTIVITY_FOREIGN_MINING] = this.m[gc.ACTIVITY_FOREIGN_MINING];
    //console.log("POLICY_GOVERN parts", this.m.parts, "budget this.m.colonies", JSON.stringify(this.m.colonies));
    return result
};

Policy.prototype.updateColonyInfo = function() {
    this.m.parts = 0;
    let localBudget = policy.getRoomEconomyPolicy(this.roomName).localBudget();
    this.m.colonies[0]["name"] = this.roomName;
    this.m.colonies[0]["parts"] = localBudget.parts;
    this.m.colonies[0]["profit"] = localBudget.profit;
    this.m.colonies[0]["profitpart"] = localBudget.profitpart;
    for (let colony of this.m.colonies) {
        this.m.parts += this.m.colonies[0]["parts"];
    }
};

Policy.prototype.checkPaybackBeforeNextUpgrade = function(profit, startUpCost) {
    const room = Game.rooms[this.roomName];
    const energyLeft = room.controller.progressTotal - room.controller.progress;
    const ltToNextLevel = energyLeft / (2*SOURCE_ENERGY_CAPACITY*gc.SORCE_REGEN_LT); // todo something better
    //console.log("checkPayback energyLeft",energyLeft,"ec",(2*SOURCE_ENERGY_CAPACITY*gc.SORCE_REGEN_LT));
    const ltToPayOff = startUpCost / profit;
    //console.log("checkPayback startUpCost",startUpCost,"profit",profit)
    console.log("POLICY_GOVERN checkPayback ltToPayOff",ltToPayOff,"ltToNextLevel",ltToNextLevel);
    return ltToPayOff < ltToNextLevel;
};

Policy.prototype.addColony = function(roomName, profit, parts, startUpCost) {
    console.log("POLICY_GOVERN addColony", roomName, "profit", profit, "parts",parts, "startUpCost", startUpCost);
    if (!this.m[gc.ACTIVITY_NEUTRAL_COLONIES]) {
        console.log("POLICY_GOVERN addColony failed !this.m[gc.ACTIVITY_NEUTRAL_COLONIES]");
        return false;
    }
    if (profit/parts < gc.COLONY_PROFIT_PART_MARGIN) {
        console.log("POLICY_GOVERN addColony failed profit",profit,"martgin",gc.COLONY_PROFIT_MARGIN);
        return false;
    }
    if (!this.checkPaybackBeforeNextUpgrade(profit, startUpCost)) {
        console.log("POLICY_GOVERN addColony failed checkPaybackBeforeNextUpgrade");
        return false;
    }
    for (let colony of this.m.colonies) {
        if (colony.name === roomName) {
            console.log("POLICY_GOVERN addColony failed already added");
            return false;
        }
    }

    this.updateColonyInfo();

    let tempColonies = [...this.m.colonies];
    let tempParts = this.m.parts;
    //console.log("POLICY_GOVERN tempParts", tempParts, "parts", parts, "margin",
    //    gc.COLONY_PARTS_MARGIN, " partsSurppliedLT", this.partsSurppliedLT());

    const newColonyProfitParts = profit/parts;
    while (tempParts + parts + gc.REPLACEMENT_COLONY_PARTS_MARGIN > this.partsSurppliedLT()) {
        //console.log("POLICY_GOVERN addColony in while loop", JSON.stringify(tempColonies));
        if (newColonyProfitParts <= tempColonies[tempColonies.length-1].profitpart) {
            return false;
        }
        tempParts -= tempColonies[tempColonies.length-1].parts;
        this.removeColony(tempColonies.pop());
    }
    tempColonies.push({"name" : roomName, "profit" : profit, "parts": parts, "profitpart" : profit/parts });
    tempColonies = tempColonies.sort( function (a,b)  {
        return b.profitpart - a.profitpart;
    });
    this.m.parts = tempParts;
    console.log("POLICY_GOVERN after sort tempparts", tempParts,"temp colonies", JSON.stringify(tempColonies));
    this.m.colonies = tempColonies;
    console.log("POLICY_GOVERN addColony success parts", this.m.parts,"colonies", JSON.stringify(this.m.colonies));
    return true;
};

Policy.prototype.removeColony = function(colony) {
    delete Game.flags[colony.name].memory.spawnRoom;
};

Policy.prototype.partsSurppliedLT = function() {
    const spawns = Game.rooms[this.roomName].find(FIND_MY_SPAWNS).length;
    return spawns * CREEP_LIFE_TIME / 3;
};

Policy.prototype.draftReplacment = function() {
    return this
};

module.exports = Policy;
































