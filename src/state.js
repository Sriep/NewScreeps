/**
 * @fileOverview screeps
 * Created by piers on 26/04/2020
 * @author Piers Shepperson
 */

const economy = require("economy");

const state = {
    enact : function(creep) {
        //console.log("move creep", creep.name," |memory| ", JSON.stringify(creep.memory));
        if (!creep.memory.policyId)
            console.log("error! creep with no policy", JSON.stringify(creep));
            //throw("creep with no policy" + JSON.stringify(creep))
        if (!creep.memory.state)
            console.log("error! creep with no state", JSON.stringify(creep))
            //throw("creep with no state" + JSON.stringify(creep))
        //console.log("enact creep name| ", creep.name, " |state| ", creep.memory.state)

        requireString = "state_" + creep.memory.state;
        console.log("require string", requireString)
        const stateConstructor = require(requireString)
        //const stateConstructor = require("state_" + creep.memory.state)
        const creepState = new stateConstructor(creep)
        //console.log("creepState", JSON.stringify(creepState))
        creepState.enact()
        //console.log("finished moving ", creep.name)
    },

    findTargetSource: function(room) {
        let sources = room.find(FIND_SOURCES);
        if (sources.length === 0)
            return undefined;
        //if (sources.lenght === 1)
        //    return sources[0];
        //console.log("sources unordered", sources[0].energy, sources[1].energy)
        sources = sources.sort( function (a,b)  { return b.energy - a.energy; } );
        //console.log("sources ordered", sources[0].energy, sources[1].energy)
        for (let i = 0; i < sources.length; i++)  {
            const sourceCreeps = _.filter(Game.creeps, function (c) {
                return c.memory.targetId === sources[i].id;
            });
            if (sourceCreeps.length === 0)
                return sources[i];
            if (sourceCreeps.length < economy.countAccessPoints(sources[i].pos))
                    return sources[i];
        }
        return undefined;
    }
}

module.exports = state;