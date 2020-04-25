/**
 * @fileOverview screeps
 * Created by piers on 24/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");

const role = {
    Type: {
        HARVESTER: gc.ROLE_HARVESTER,
        UPGRADER: gc.ROLE_UPGRADER,
        BUILDER: gc.ROLE_BUILDER,
        REPAIRER: gc.ROLE_REPAIRER,
        LINKER: gc.ROLE_LINKER,
        CLAIMER: gc.ROLE_CLAIMER,
        NEUTRAL_BUILDER: gc.ROLE_NEUTRAL_BUILDER,
        UNASSIGNED: gc.ROLE_UNASSIGNED,
        SPAWN_BUILDER: gc.ROLE_SPAWN_BUILDER,
        MINER: gc.ROLE_MINER,
        TRAVELLER: gc.ROLE_TRAVELLER,
        ENERGY_PORTER: gc.ROLE_ENERGY_PORTER,
        ROLE_FLEXI_STORAGE_PORTER: gc.ROLE_FLEXI_STORAGE_PORTER
    },

    enact : function(creep) {
        console.log("role enact creep", creep);
    }
}

module.exports = role;