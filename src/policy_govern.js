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
    if (this.m && this.m.agendaName) {
        this.agenda = agenda.agendas[this.m.agendaName];
    }
}

PolicyGovern.prototype.initilise = function () {
    if (!this.m) {
        this.m = {}
    }
    this.m.rcl = Game.rooms[this.roomName].controller.level;
    this.m.agendaIndex = -1;
    this.m.childTypes = [];
    this.m.colonies = [{ "name" : this.roomName }];
    this.m.agendaName = gc.AGENDA_DEFAULT;
    this.m[gc.ACTIVITY_MINE_COLONIES] = false;
    this.m.parts = 0;
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
    this.m.agendaIndex = agenda.enact(this.id, this.agenda, this.m.rcl, this.m.agendaIndex)
};

PolicyGovern.prototype.govern = function () {
    //console.log("govern this.m.rcl",this.m.rcl,"rcl",Game.rooms[this.roomName].controller.level)
    if (this.m.agendaIndex >= this.agenda[this.m.rcl].length) {
        return;
    }
    const lastAgendaItem = this.agenda[this.m.rcl][this.m.agendaIndex === -1 ? 0 : this.m.agendaIndex];
    console.log("govern lastAgendaItem", JSON.stringify(lastAgendaItem));
    if (this.m.agendaIndex === -1 || agenda.items()[lastAgendaItem.activity].check(
        lastAgendaItem.activity,
        this.id
    )) {
        if (this.m.agendaIndex !== -1) {
            Memory.records.agenda.push(lastAgendaItem + " checked " + Game.time.toString());
            console.log("POLICY_GOVERN check PASSED for", JSON.stringify(lastAgendaItem))
        }
        const nextAgendaItem = this.agenda[this.m.rcl][this.m.agendaIndex+1];
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
    const economicPolicy = policy.getRoomEconomyPolicy(this.roomName);
    //console.log("refreshRoomInfo economicPolicy", JSON.stringify(economicPolicy));
    if (economicPolicy) {
        const budget =  economicPolicy.localBudget();
        //console.log("refreshRoomInfo budget", JSON.stringify(budget));
        if (budget) {
            this.m.colonies[0] = budget;
        }
    }
    this.sortColonies();
};

PolicyGovern.prototype.checkPaybackByNextUpgrade = function(value) {
    const room = Game.rooms[this.roomName];
    const energyLeft = room.controller.progressTotal - room.controller.progress;
    const ltToNextLevel = energyLeft / (2*SOURCE_ENERGY_CAPACITY*gc.SORCE_REGEN_LT);
    const ltToPayOff = value.startUpCost / value.netEnergy;
    return ltToPayOff < ltToNextLevel;
};

PolicyGovern.prototype.requestAddColony = function(fRoom) {
    //console.log("POLICY_GOVERN requestAddColony ", fRoom.name,"fRoom", JSON.stringify(fRoom));
    if (!this.m[gc.ACTIVITY_MINE_COLONIES] || this.roomName === fRoom.name) {
        console.log("this.m[gc.ACTIVITY_MINE_COLONIES]",this.m[gc.ACTIVITY_MINE_COLONIES]);
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
        //console.log("POLICY_GOVERN this.checkPaybackByNextUpgrade(value)]",this.checkPaybackByNextUpgrade(value),
        //    "value.profitParts",value.profitParts,"gc.COLONY_PROFIT_PART_MARGIN",gc.COLONY_PROFIT_PART_MARGIN)
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
    //console.log("POLICY_GOVERN requestAddColony success m.colonies", JSON.stringify(m.colonies));
    return {
        added: true,
        useRoads: !!this.m[gc.ACTIVITY_COLONY_ROADS],
        reserve: !!this.m[gc.ACTIVITY_RESERVED_COLONIES],
        flexiH: !!this.m[gc.ACTIVITY_FLEXI_HARVESTERS],
    };
};

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
































