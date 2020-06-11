/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const policy = require("policy");

// constructor
class PolicyBuildExtractors {
    constructor (id, data)  {
        this.type = gc.POLICY_BUILD_EXTRACTORS;
        this.id = id;
        this.home = data.home;
        this.m = data.m;
        this.parentId = data.parentId;
    }

    initilise() {
        if (!this.m) {
            this.m = {}
        }
        this.m.finished = false;
        //console.log("PolicyBuildExtractors initilise", JSON.stringify(this));
        //console.log("Memory.policies[this.parentId]", JSON.stringify(Memory.policies[this.parentId]))
        this.home = Memory.policies[this.parentId].roomName;
        const room = Game.rooms[this.home];
        return !!room && !!room.controller && room.controller.my;
    };

    enact() {
        //console.log("POLICY_BUILD_EXTRACTORS this", JSON.stringify(this));
        const colonies = policy.getGouvernerPolicy(this.home).getColonies();
        this.m.finished = true;
        for (let colonyInfo of colonies) {
            const colony = Game.rooms[colonyInfo.name];
            if (!colony) {
                this.m.finished = false;
                continue
            }
            const minerals = colony.find(FIND_MINERALS);
            const built = colony.find(FIND_MY_STRUCTURES, {
                filter: { structureType: STRUCTURE_EXTRACTOR }
            });
            if (built.length >= minerals.length) {
                continue;
            }

            const beingBuilt  = colony.find(FIND_MY_CONSTRUCTION_SITES, {
                filter: { structureType: STRUCTURE_EXTRACTOR }
            });
            if (beingBuilt.length + built.length < minerals.length) {
                for (let mineral of minerals) {
                    //console.log("mineral", JSON.stringify(mineral));
                    policy.buildSourceContainer(mineral);
                    mineral.pos.createConstructionSite(STRUCTURE_EXTRACTOR);
                }
            }
        }
    };

    draftReplacment() {
        return this;
        //return this.m.finished ? false : this;
    };
}



module.exports = PolicyBuildExtractors;







































