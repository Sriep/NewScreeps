/**
 * @fileOverview screeps
 * Created by piers on 25/04/2020
 * @author Piers Shepperson
 */
const gc = require("./gc");
const agenda = require("./agenda");
const policy = require("./policy");
const gf = require("./gf");

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
    //console.log("initilise this.m.colonies1", JSON.stringify(this.m.colonies));
    this.m.agenda = agenda.default_1;
    this.m[gc.ACTIVITY_MINE_COLONIES] = false;
    this.m.parts = 0;
    //console.log("initilise this.m.colonies2", JSON.stringify(this.m.colonies));
    return true;
};

PolicyGovern.prototype.enact = function () {
    //console.log("POLICY_GOVERN enact this colonies", JSON.stringify(this.m.colonies));
    //console.log("POLICY_GOVERN enact this.m", JSON.stringify(this.m));
    if (!Memory.records["rcl "+this.m.rcl] ) {
        //Memory.records["rcl "+ Game.rooms[this.roomName].controller.level.toString()] = {};
    }
    if (Game.rooms[this.roomName].controller.level !== this.m.rcl) {
        this.m.rcl = Game.rooms[this.roomName].controller.level;
        this.m.agendaIndex = -1;
        //Memory.records.agenda.push("rcl "+Game.rooms[this.roomName].controller.level.toString() + " " + Game.time.toString())
    }
    this.govern();
    this.refreshRoomInfo();
};

PolicyGovern.prototype.governNew = function () {
    this.m.agendaIndex = agenda.enact(this.id, this.m.agenda, this.m.rcl, this.m.agendaIndex)
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
    return JSON.parse(JSON.stringify(this.m.colonies))
};

PolicyGovern.prototype.countParts = function() {
    this.m.parts = 0;
    for (let colony of this.m.colonies) {
        this.m.parts += colony["parts"];
    }
    return this.m.parts;
};

PolicyGovern.prototype.minColonyProfitParts = function() {
    return this.m.colonies[this.m.colonies.length-1].profitpart;
};

PolicyGovern.prototype.minFreeColonyParts = function() {
    return Math.max(0, this.partsSurppliedLT() - this.m.parts - gc.COLONY_PARTS_MARGIN);
};

PolicyGovern.prototype.sortColonies = function()  {
    let temp = this.m.colonies.shift();
    this.m.colonies = this.m.colonies.sort( function (a,b)  {
        return b.profitpart - a.profitpart;
    });
    this.m.colonies.unshift(temp);
    this.countParts();
};

PolicyGovern.prototype.refreshRoomInfo = function() {
    //console.log("refreshRoomInfo this.m.colonies",this.m.colonies);
    const economicPolicy = policy.getRoomEconomyPolicy(this.roomName);
    if (economicPolicy) {
        if (economicPolicy.localBudget) {
            this.m.colonies[0] = economicPolicy.localBudget();
        }
    }
    this.sortColonies();
};
/*
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
*/
PolicyGovern.prototype.checkPaybackByNextUpgrade = function(value) {
    const room = Game.rooms[this.roomName];
    const energyLeft = room.controller.progressTotal - room.controller.progress;
    const ltToNextLevel = energyLeft / (2*SOURCE_ENERGY_CAPACITY*gc.SORCE_REGEN_LT);
    const ltToPayOff = value.startUpCost / value.netEnergy;
    return ltToPayOff < ltToNextLevel;
};

PolicyGovern.prototype.requestAddColony = function(fRoom) {
    if (!this.m[gc.ACTIVITY_MINE_COLONIES] || this.roomName === fRoom.name) {
        return {added: false}
    }
    const value = fRoom.value(
        this.roomName,
        this.m[gc.ACTIVITY_COLONY_ROADS],
        this.m[gc.ACTIVITY_RESERVED_COLONIES],
        this.m[gc.ACTIVITY_FLEXI_HARVESTERS] ? Game.rooms[this.roomName].energyCapacityAvailable : false
    );
    if (value.profitParts < gc.COLONY_PROFIT_PART_MARGIN
        || !this.checkPaybackByNextUpgrade(value)) {
        return {added: false}
    }

    let coloniesDropped = 0;
    let partsDropped = 0;
    while (this.m.parts - partsDropped + value.netParts > this.partsSurppliedLT() - gc.COLONY_PARTS_MARGIN) {
        const lowestProfitParts = this.m.colonies[this.m.colonies.length-coloniesDropped-1].profitpart;
        if (value.profitParts <= lowestProfitParts + gc.REPLACEMENT_COLONY_PROFITPARTS) {
            //console.log("POLICY_GOVERN addColony failed at spawn room part limit");
            return {added: false};
        }
        partsDropped += this.m.colonies[this.m.colonies.length-coloniesDropped-1].parts;
        gf.assertGt(partsDropped, 0, "Invalid parts for colony");
        coloniesDropped++
    }
    for (let i = 0 ; i < coloniesDropped ; i++) {
        this.removeColony(this.m.colonies.pop());
    }
    this.m.colonies.push({
        "name" : fRoom.name,
        "profit" : value.netEnergy,
        "parts": value.netParts,
        "profitpart" : value.profitParts
    });
    this.sortColonies();
    return {
        added: true,
        useRoads: !!this.m[gc.ACTIVITY_COLONY_ROADS],
        reserve: !!this.m[gc.ACTIVITY_RESERVED_COLONIES],
        flexiH: !!this.m[gc.ACTIVITY_FLEXI_HARVESTERS],
    };
};
/*
PolicyGovern.prototype.addColony = function(roomName, profit, parts, startUpCost) {
    //console.log("POLICY_GOVERN addColony roomName",roomName,"profit", profit, "parts", parts, "startup", startUpCost);
    if (roomName === this.roomName) {
        //console.log("addColony roomName", roomName, "cannot be a colony of itself");
        gf.fatalError("cannot be a colony of itself");
        return false
    }
    if (!this.m[gc.ACTIVITY_NEUTRAL_COLONIES]) {
        //console.log("POLICY_GOVERN addColony failed !this.m[gc.ACTIVITY_NEUTRAL_COLONIES]");
        return false;
    }
    if (profit/parts < gc.COLONY_PROFIT_PART_MARGIN) {
        //console.log("POLICY_GOVERN addColony failed profit", profit, "parts", parts, "p/p", profit / parts, "margin", gc.COLONY_PROFIT_MARGIN);
        return false;
    }
    for (let colony of this.m.colonies) {
        if (colony.name === roomName) {
            //console.log("POLICY_GOVERN addColony failed already added");
            return false;
        }
    }
    if (!this.checkPaybackBeforeNextUpgrade(profit, startUpCost)) {
        //console.log("POLICY_GOVERN addColony failed checkPaybackBeforeNextUpgrade");
        return false;
    }

    const newColonyProfitParts = profit/parts;
    let coloniesDropped = 0;
    let partsDropped = 0;
    while (this.m.parts - partsDropped + parts + gc.COLONY_PARTS_MARGIN > this.partsSurppliedLT()) {
        if (newColonyProfitParts <= this.m.colonies[this.m.colonies.length-coloniesDropped-1].profitpart
                                    +gc.REPLACEMENT_COLONY_PROFITPARTS) {
            console.log("POLICY_GOVERN addColony failed at spawn room part limit");
            return false;
        }
        partsDropped += this.m.colonies[this.m.colonies.length-coloniesDropped-1].parts;
        gf.assertGt(partsDropped, 0, "Invalid parts for colony");
        coloniesDropped++
    }
    gf.assertNeq(coloniesDropped, this.m.colonies.length,"new colony displacing the home room!");

    for (let i = 0 ; i < coloniesDropped ; i++) {
        this.removeColony(this.m.colonies.pop());
    }
    this.m.colonies.push({"name" : roomName, "profit" : profit, "parts": parts, "profitpart" : profit/parts });

    //this.m.colonies = this.m.colonies.sort( function (a,b)  { // todo flaky
    //    return b.profitpart - a.profitpart;
    //});
    //this.countParts();
    this.refreshColoniesInfo();
    //console.log("POLICY_GOVERN addColony success parts", this.m.parts,"colonies", JSON.stringify(this.m.colonies));
    return true;
};
*/
PolicyGovern.prototype.removeColony = function(colony) {
    //console.log("POLICY_GOVERN removeColony as spawnRoom", colony.name);
    gf.assertEq(Game.flags[colony.name].memory.spawnRoom, this.roomName,
        "Invalid spawn room setting", JSON.stringify(Game.flags[colony.name].memory));
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
































