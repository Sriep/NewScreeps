/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */

const gc = require("gc");
const policy = require("policy");
const PolicyBase = require("policy_base");

class PolicyBuildExtractors extends PolicyBase {
    constructor (id, data)  {
        super(id, data);
        this.type = gc.POLICY_BUILD_EXTRACTORS;
    }

    initilise() {
        super.initilise();
        this.m.finished = false;
        return true;
    };

    enact() {
        //console.log("POLICY_BUILD_EXTRACTORS this", JSON.stringify(this));
        const colonies = policy.getGouvernerPolicy(this.home).colonies;
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

}



module.exports = PolicyBuildExtractors;







































