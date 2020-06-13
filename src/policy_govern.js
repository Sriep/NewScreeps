/**
 * @fileOverview screeps
 * Created by piers on 25/04/2020
 * @author Piers Shepperson
 */
const gc = require("./gc");
const agenda = require("./agenda");
const policy = require("./policy");
const gf = require("./gf");
const flag = require("./flag");
const FlagRoom = require("./flag_room");
const PolicyBase = require("policy_base");

class PolicyGovern extends PolicyBase {
    constructor (id, data) {
        //console.log(id,"PolicyGovern constructor data", JSON.stringify(data))
        super(id, data);
        //this.home = data.home;
        this.type = gc.POLICY_GOVERN;
    }

    initilise() {
        super.initilise();
        //console.log("PolicyGovern initilise","this",JSON.stringify(this));
        //this.m.home = home;
        this.m.rcl = Game.rooms[this.home].controller.level;
        this.m.agendaIndex = -1;
        this.m.childTypes = [];
        this.m.colonies = [{ "name" : this.home }];
        this.m.agendaName = gc.AGENDA_DEFAULT;
        this.m[gc.ACTIVITY_MINE_COLONIES] = false;
        this.m.parts = 0;
        return true;
    };

    get rcl() {
        return this.m.rcl
    }

    get agendaIndex() {
        return this.m.agendaIndex
    }

    get colonies() {
        console.log("get colonies")
        return JSON.parse(JSON.stringify(this.m.colonies))
    }

    get agendaName() {
        return this.m.agendaName
    }

    get agenda() {
        return agenda.agendas[this.m.agendaName];
    }

    get parts() {
        return this.m.parts
    }

    enact() {
        //console.log("POLICY_GOVERN enact this colonies", JSON.stringify(this.m.colonies));
        //console.log("POLICY_GOVERN enact this", JSON.stringify(this),"super", super.this);
        //console.log("PolicyGovern this.m", JSON.stringify(this.m));
        if (!Memory.records["rcl "+this.m.rcl] ) {
            //Memory.records["rcl "+ Game.rooms[this.home].controller.level.toString()] = {};
        }
        if (Game.rooms[this.home].controller.level !== this.m.rcl) {
            this.m.rcl = Game.rooms[this.home].controller.level;
            this.m.agendaIndex = -1;
            //Memory.records.agenda.push("rcl "+Game.rooms[this.home].controller.level.toString() + " " + Game.time.toString())
        }
        this.govern();
        this.refreshRoomInfo();
    };



    governNew() {
        this.m.agendaIndex = agenda.enact(this.id, this.agenda, this.m.rcl, this.m.agendaIndex)
    };

    govern() {
        //console.log("govern this.m.rcl",this.m.rcl,"rcl",Game.rooms[this.home].controller.level)
        if (this.m.agendaIndex >= this.agenda[this.m.rcl].length) {
            return;
        }
        const lastAgendaItem = this.agenda[this.m.rcl][this.m.agendaIndex === -1 ? 0 : this.m.agendaIndex];
        //console.log("govern lastAgendaItem", JSON.stringify(lastAgendaItem));
        if (this.m.agendaIndex === -1 || agenda.items()[lastAgendaItem.activity].check(
            lastAgendaItem.activity,
            this.id
        )) {
            if (this.m.agendaIndex !== -1) {
                Memory.records.agenda.push(lastAgendaItem + " checked " + Game.time.toString());
                //console.log("POLICY_GOVERN check PASSED for", JSON.stringify(lastAgendaItem))
            }
            const nextAgendaItem = this.agenda[this.m.rcl][this.m.agendaIndex+1];
            //console.log("POLICY_GOVERN next item", JSON.stringify(nextAgendaItem));
            agenda.items()[nextAgendaItem.activity].enact(
                nextAgendaItem.activity,
                this.id,
                nextAgendaItem.params
            );
            //console.log("POLICY_GOVERN enacted agemda item", JSON.stringify(nextAgendaItem));
            this.m.agendaIndex++;
            return;
        }
        //console.log("POLICY_GOVERN check failed", JSON.stringify(lastAgendaItem))
    };

    getColonies() {
        console.log("getColonies");
        return JSON.parse(JSON.stringify(this.m.colonies))
    };

    countParts() {
        this.m.parts = 0;
        for (let colony of this.m.colonies) {
            this.m.parts += colony["parts"];
        }
        return this.m.parts;
    };

    minColonyProfitParts() {
        return this.m.colonies[this.m.colonies.length-1].profitpart;
    };

    minFreeColonyParts() {
        return Math.max(0, this.partsSurppliedLT() - this.m.parts - gc.COLONY_PARTS_MARGIN);
    };

    sortColonies()  {
        let temp = this.m.colonies.shift();
        this.m.colonies = this.m.colonies.sort( function (a,b)  {
            return b.profitpart - a.profitpart;
        });
        this.m.colonies.unshift(temp);
        this.countParts();
    };

    refreshRoomInfo() {
        const economicPolicy = policy.getRoomEconomyPolicy(this.home);
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

    checkPaybackByNextUpgrade(value) {
        const room = Game.rooms[this.home];
        const energyLeft = room.controller.progressTotal - room.controller.progress;
        const ltToNextLevel = energyLeft / (2*SOURCE_ENERGY_CAPACITY*gc.SORCE_REGEN_LT);
        const ltToPayOff = value.startUpCost / value.netEnergy;
        return ltToPayOff < ltToNextLevel;
    };

    requestAddColony(fRoom) {
        //console.log("POLICY_GOVERN requestAddColony ", fRoom.name,"fRoom", JSON.stringify(fRoom));
        if (!this.m[gc.ACTIVITY_MINE_COLONIES] || this.home === fRoom.name) {
            console.log("this.m[gc.ACTIVITY_MINE_COLONIES]",this.m[gc.ACTIVITY_MINE_COLONIES]);
            return {added: false}
        }
        const value = fRoom.value(
            this.home,
            this.m[gc.ACTIVITY_COLONY_ROADS],
            this.m[gc.ACTIVITY_RESERVED_COLONIES],
            this.m[gc.ACTIVITY_FLEXI_HARVESTERS] ? Game.rooms[this.home].energyCapacityAvailable : false
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
            this.decolonise(this.m.colonies.length-1);
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

    updateColonies() {
        this.refreshRoomInfo();
        for (let i in this.m.colonies) {
            const fRoom = flag.getRoom(colonies[i].name);
            const roomType = fRoom.roomType();
            switch (roomType) {
                case FlagRoom.RoomType.MyOwned:
                case FlagRoom.RoomType.MyReserved:
                case FlagRoom.RoomType.Neutral:
                case FlagRoom.RoomType.None:
                case FlagRoom.RoomType.Unknown:
                case FlagRoom.RoomType.SourceKeeper:
                    break;
                case FlagRoom.RoomType.UserOwned:
                case FlagRoom.RoomType.UserReserved:
                    this.removeColony(i);
                    break;
                case FlagRoom.RoomType.InvaderReserved:
                    break;
                default:
            }
            if (Game.rooms[colonies[i].name]
                && Game.rooms[colonies[i].name] .find(C.FIND_STRUCTURES, {
                    filter: { structureType: C.STRUCTURE_INVADER_CORE }
                })) {
                this.removeColony(i);
            }
        }
    };

    decolonise(index) {
        //console.log("POLICY_GOVERN removeColony as spawnRoom", colony.name);
        gf.assertEq(Game.flags[colony.name].memory.spawnRoom, this.home,
            "Invalid spawn room setting", JSON.stringify(Game.flags[colony.name].memory));
        this.m.colonies.splice(index, 0);
        policy.getPolicyByType(gc.POLICY_COLONIAL_OFFICE).decolonise(colony.name);
    };

    partsSurppliedLT() {
        const spawns = Game.rooms[this.home].find(FIND_MY_SPAWNS).length;
        return spawns * CREEP_LIFE_TIME / 3;
    };

}

module.exports = PolicyGovern;
































