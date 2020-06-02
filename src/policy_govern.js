/**
 * @fileOverview screeps
 * Created by piers on 25/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const agenda = require("agenda");
const policy = require("policy");

function PolicyGovern  (id, data) {
    this.id = id;
    this.type = gc.POLICY_GOVERN;
    this.roomName = data.roomName;
    this.m = data.m;
}

PolicyGovern.prototype.initilise = function () {
    if (!this.m) {
        this.m = {}
    }
    this.m.rcl = Game.rooms[this.roomName].controller.level;
    this.m.agendaIndex = -1;
    this.m.childTypes = [];
    this.m.colonies = [{ "name" : this.roomName }];

    this.m.agenda = agenda.default_1;
    this.m[gc.ACTIVITY_NEUTRAL_COLONIES] = false;
    this.m.parts = 0;
    console.log("this.m.colonies", JSON.stringify(this.m.colonies),"this",JSON.stringify(this));
    return true;
};

PolicyGovern.prototype.enact = function () {
    //console.log("POLICY_GOVERN enact this colonies", JSON.stringify(this.m.colonies));
    if (!Memory.records["rcl "+this.m.rcl] ) {
        //Memory.records["rcl "+ Game.rooms[this.roomName].controller.level.toString()] = {};
    }
    if (Game.rooms[this.roomName].controller.level !== this.m.rcl) {
        this.m.rcl = Game.rooms[this.roomName].controller.level;
        this.m.agendaIndex = -1;
        //Memory.records.agenda.push("rcl "+Game.rooms[this.roomName].controller.level.toString() + " " + Game.time.toString())
    }
    this.govern();
};

PolicyGovern.prototype.govern = function () {
    //console.log("govern this.m.rcl",this.m.rcl,"rcl",Game.rooms[this.roomName].controller.level)
    if (this.m.agendaIndex >= this.m.agenda[this.m.rcl].length) {
        return;
    }
    const lastAgendaItem = this.m.agenda[this.m.rcl][this.m.agendaIndex === -1 ? 0 : this.m.agendaIndex];
    console.log("govern lastAgendaItem", JSON.stringify(lastAgendaItem));
    if (this.m.agendaIndex === -1 || agenda.items()[lastAgendaItem.activity].check(
        lastAgendaItem.activity,
        this.id
    )) {
        if (this.m.agendaIndex !== -1) {
            Memory.records.agenda.push(lastAgendaItem + " checked " + Game.time.toString());
            console.log("POLICY_GOVERN check PASSED for", JSON.stringify(lastAgendaItem))
        }
        const nextAgendaItem = this.m.agenda[this.m.rcl][this.m.agendaIndex+1];
        console.log("POLICY_GOVERN next item", JSON.stringify(nextAgendaItem));
        agenda.items()[nextAgendaItem.activity].enact(
            nextAgendaItem.activity,
            this.id,
            nextAgendaItem.params
        );
        console.log("POLICY_GOVERN enacted agemda item", JSON.stringify(nextAgendaItem));
        this.m.agendaIndex++;
        return;
    }
    console.log("POLICY_GOVERN check failed", JSON.stringify(lastAgendaItem))
 };

PolicyGovern.prototype.getColonies = function() {
    return [...this.m.colonies]
};
/*
PolicyGovern.prototype.budget = function() {
    let localBudget = policy.getRoomEconomyPolicy(this.roomName).localBudget();
    //console.log("POLICY_GOVERN getRoomEconomyPolicy parts", JSON.stringify(localBudget));
    console.log("this.m.colonies",JSON.stringify(this.m.colonies), "this.rooName", this.roomName);

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
*/
/*
PolicyGovern.prototype.updateColonyInfo = function() {
    this.m.parts = 0;
    let localBudget = policy.getRoomEconomyPolicy(this.roomName).localBudget();
    this.m.colonies[0]["name"] = this.roomName;
    this.m.colonies[0]["parts"] = localBudget.parts;
    this.m.colonies[0]["profit"] = localBudget.profit;
    this.m.colonies[0]["profitpart"] = localBudget.profitpart;
    for (let colony of this.m.colonies) {
        this.m.parts += colony["parts"];
    }
    return
};
*/
PolicyGovern.prototype.checkPaybackBeforeNextUpgrade = function(profit, startUpCost) {
    const room = Game.rooms[this.roomName];
    const energyLeft = room.controller.progressTotal - room.controller.progress;
    const ltToNextLevel = energyLeft / (2*SOURCE_ENERGY_CAPACITY*gc.SORCE_REGEN_LT); // todo something better
    //console.log("checkPayback energyLeft",energyLeft,"ec",(2*SOURCE_ENERGY_CAPACITY*gc.SORCE_REGEN_LT));
    const ltToPayOff = startUpCost / profit;
    //console.log("checkPayback startUpCost",startUpCost,"profit",profit)
    //console.log("POLICY_GOVERN checkPayback ltToPayOff",ltToPayOff,"ltToNextLevel",ltToNextLevel);
    return ltToPayOff < ltToNextLevel;
};

PolicyGovern.prototype.addColony = function(roomName, profit, parts, startUpCost) {
    if (roomName === this.roomName) {
        console.log("addColony roomName", roomName,"profit", profit,"parts",parts, "startup", startUpCost);
        gf.fatalError("cannot be a colony of itself");
        return false
    }

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

    let tempColonies = JSON.parse(JSON.stringify(this.m.colonies.slice(1)));
    let tempParts = this.m.parts;

    const newColonyProfitParts = profit/parts;
    while (this.m.parts + parts + gc.REPLACEMENT_COLONY_PARTS_MARGIN > this.partsSurppliedLT()) {
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
    //this.m.parts = tempParts;
    console.log("POLICY_GOVERN after sort temp parts", tempParts,"temp colonies", JSON.stringify(tempColonies));
    this.m.colonies = [];
    this.m.colonies.push(policy.getRoomEconomyPolicy(this.roomName).localBudget());
    this.m.colonies = this.m.colonies.concat(tempColonies);
    for (let colony of this.m.colonies) {
        this.m.parts += colony["parts"];
    }
    console.log("POLICY_GOVERN addColony success parts", this.m.parts,"colonies", JSON.stringify(this.m.colonies));
    return true;
};

PolicyGovern.prototype.removeColony = function(colony) {
    delete Game.flags[colony.name].memory.spawnRoom;
};

PolicyGovern.prototype.partsSurppliedLT = function() {
    const spawns = Game.rooms[this.roomName].find(FIND_MY_SPAWNS).length;
    return spawns * CREEP_LIFE_TIME / 3;
};

PolicyGovern.prototype.draftReplacment = function() {
    return this
};

module.exports = PolicyGovern;
































