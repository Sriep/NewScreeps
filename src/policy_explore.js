/**
 * @fileOverview screeps
 * Created by piers on 03/05/2020
 * @author Piers Shepperson
 */
//const budget = require("budget");
const race = require("race");
const gf = require("gf");
const gc = require("gc");
const flag = require("flag");
const policy = require("policy");
const FlagRoom = require("flag_room");

class PolicyExplore  {
    constructor (id, data) {
        this.id = id;
        this.type = gc.POLICY_EXPLORE;
        this.parentId = data.parentId;
        this.home = data.home;
        this.m = data;
    }

    initilise() {
        if (!this.m) {
            this.m = {}
        }
        this.home = Memory.policies[this.parentId].roomName;
        this.m.direction = TOP;
        return true;
    };

    enact() {
        if (!this.m.direction) {
            this.m.direction = TOP;
        }
        const creeps = policy.getCreeps(this.id, gc.RACE_SCOUT);
        //console.log("POLICY_EXPLORE creeps", creeps.length,"m",JSON.stringify(this.m));
        if (creeps.length < gc.EXPLORE_CREEPS) {
            const orders = flag.getSpawnQueue(this.home).orders(this.id);
            if (creeps.length + orders.length < gc.EXPLORE_CREEPS) {
                //console.log("POLICY_EXPLORE sending new explorer currently",creeps.length,"plus",orders.length,"explorers out there" );
                this.sendExplorers(gc.EXPLORE_CREEPS - creeps.length -  orders.length)
            }
        }
        //console.log("enact explore policy", creeps.length, "creeps exploring this", JSON.stringify(this));
        for (let i in creeps) {
            //this.exploreRoom(creeps[i].room.name);
            const fRoom = new FlagRoom(creeps[i].room.name);
            gf.assert(fRoom.m.flagged);
            if (!fRoom.m.mapped) {
                //console.log("POLICY_EXPLORE map room", creeps[i].room.name);
                fRoom.mapRoom();
                const colonialOffice = policy.getPolicyByType(gc.POLICY_COLONIAL_OFFICE);
                if (colonialOffice) {
                    colonialOffice.checkRoom(creeps[i].room.name);
                }
            }
        }
    };

    sendExplorers(shortfall) {
        //console.log("sendExplorers shortfall", shortfall,"this.m.direction",this.m.direction);
        for (let i = 0; i < shortfall; i++) {
            const data = {
                "body": race.body(gc.RACE_SCOUT, BODYPART_COST[MOVE]),
                "opts": {"memory": {
                        "home" : this.roomName,
                        "direction" : this.m.direction,
                    }},
                "name": gc.RACE_SCOUT + "_50",
            };
            //console.log("sendExplorers data",JSON.stringify(data));
            flag.getSpawnQueue(this.home).addSpawn(
                data,
                gc.SPAWN_PRIORITY_MISC,
                this.id,
                gc.STATE_SCOUT_IDLE,
            );
            this.m.direction = (this.m.direction+2) % 8;
        }
    };

    draftReplacment() {
        return Game.map.describeExits(this.home) ? this : false;
    };
}

odule.exports = PolicyExplore;





































