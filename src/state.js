/**
 * @fileOverview screeps
 * Created by piers on 26/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
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
        //console.log("require string", requireString)
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
    },

    switchToMovePath(creep, targetId, range, nextState) {
        creep.memory.targetId = targetId;
        creep.memory.state = gc.STATE_MOVE_PATH;
        creep.memory.moveRange = range;
        creep.memory.next_state = nextState;
        creep.say("go " + nextState)
        return state.enact(creep);
    },

    switchToFullIdel: function (creep) {
        creep.memory.state = gc.STATE_FULL_IDEL;
        delete creep.targetId;
        creep.say("full");
        return state.enact(creep);
    },

    switchToEmptyIdel: function (creep) {
        creep.memory.state = gc.STATE_EMPTY_IDLE;
        creep.targetId = undefined;
        creep.say("empty");
        return state.enact(creep);
    },

    switchTo: function(creep, newState) {
        creep.memory.state = newState;
        creep.say("arrived");
        delete creep.memory.next_state;
        delete creep.memory.moveRange;
        return state.enact(creep);
    },

    switchToContoler: function(creep) {

    }
}

module.exports = state;