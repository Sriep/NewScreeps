/**
 * @fileOverview screeps
 * Created by piers on 26/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const gf = require("gf");
const economy = require("economy");

const state = {
    enact : function(creep) {
        if (!creep.memory.policyId)
            return gf.fatalError("error! creep with no policy " + JSON.stringify(creep));
        if (!creep.memory.state)
            return gf.fatalError("error! creep with no state " + JSON.stringify(creep));

        //console.log(JSON.stringify(creep.memory));
        requireString = "state_" + creep.memory.state;
        //console.log("require string", requireString);
        const stateConstructor = require(requireString)
        const creepState = new stateConstructor(creep)
        //console.log("creepState", JSON.stringify(creepState));
        creepState.enact()
    },

    findTargetSource: function(room) {
        let sources = room.find(FIND_SOURCES);
        if (sources.length === 0)
            return undefined;
        // todo also sort by tick to regenerate if both empty.
        sources = sources.sort( function (a,b)  { return b.energy - a.energy; } );
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

    findResourceToMove: function(creep) {
        //const containers = creep.room.findClosestByRange(FIND_STRUCTURES, {
        //    filter: { structureType: STRUCTURE_CONTAINER }
        //});
        var containers = creep.room.find(FIND_STRUCTURES, {
            filter: function(s) {
                return s.structureType === STRUCTURE_CONTAINER
                    && s.store.getUsedCapacity() > 0
            }
        });
        sources = sources.sort( function (a,b)  { return b.energy - a.energy; } );
        if (containers.length >0) {
            sources = sources.sort( function (a,b)  {
                return b.store.getUsedCapacity()  - a.store.getUsedCapacity();
            });
            console.log("sorted containers", JSON.stringify(sources));
            for ( let s in sources) {
                const flags = sources[s].pos.lookFor(LOOK_FLAGS)
                if (flags > 0) {
                    flagId = flags[0].id
                    if (Memory.flags.flagId.usage === "collection") {
                        return sources[s];
                    }
                }
            }
        }
    },

    switchToMoveTarget(creep, targetId, range, nextState) {
        creep.memory.targetId = targetId;
        creep.memory.state = gc.STATE_MOVE_TARGET;
        creep.memory.moveRange = range;
        creep.memory.next_state = nextState;
        creep.say("go " + nextState)
        return state.enact(creep);
    },

    switchToMovePos(creep, targetPos, range, nextState) {
        creep.memory.targetPos = targetPos;
        creep.memory.state = gc.STATE_MOVE_POS;
        creep.memory.moveRange = range;
        creep.memory.next_state = nextState;
        creep.say("go " + nextState)
        return state.enact(creep);
    },

    switchState: function (creep, newState, targetId) {
        creep.memory.state = newState;
        if (targetId) {
            creep.memory.targetId = targetId;
        }
        creep.say(this.creepSay[newState]);
        if (!this.creepSay[newState]) {
            console.log("state", newState, "gives say", this.creepSay[newState]);
            console.log("creepSay", JSON.stringify(this.creepSay))
        }
        return state.enact(creep);
    },

    switchToHarvest: function (creep) {
        return this.switchState(creep, gc.STATE_HARVEST, creep.memory.targetId);
    },

    switchToHarvesterIdle: function (creep) {
        return this.switchState(creep, gc.STATE_HARVESTER_IDLE, creep.memory.targetId);
    },

    switchToFullIdle: function (creep) {
        return this.switchState(creep, gc.STATE_FULL_IDLE);
    },

    switchToEmptyIdle: function (creep) {
        return this.switchState(creep, gc.STATE_EMPTY_IDLE);
    },

    switchTo: function(creep, newState) {
        delete creep.memory.next_state;
        delete creep.memory.moveRange;
        return this.switchState(creep, newState, creep.memory.targetId);
    },

    creepSay: {
        STATE_EMPTY_IDLE: "empty ?",
        STATE_MOVE_PATH: "move",
        STATE_HARVEST: "harvest",
        STATE_FULL_IDLE: "full ?",
        STATE_BUILD: "build",
        STATE_PORTER: "take",
        STATE_UPGRADE: "upgrade",
        STATE_WORKER_UPGRADE: "upgrade",
        STATE_REPAIR: "repair",
        STATE_HARVESTER_IDLE: "full",
        STATE_HARVESTER_BUILD: "build",
    },

    spaceForHarvest: function (creep) {
        return creep.store.getFreeCapacity(RESOURCE_ENERGY) > race.workParts(this.creep)*HARVEST_POWER;
    },

    findContainerAt : function (pos) {
        const stuffAt = pos.look()
        for (let i in stuffAt) {
            if (stuffAt[i].type === LOOK_STRUCTURES
                && stuffAt[i].structure.type === STRUCTURE_CONTAINER) {
                return stuffAt[i];
            }
        }
        return undefined;
    },

    findContainerConstructionNear : function (creep, range) {
        if (!range) range = 0;
        const sites = _.filter(creep.room.lookForAt(
            LOOK_CONSTRUCTION_SITES, pos.y+range, pos.x-range, pos.y-range, pos.x+range, true),
            function(c) {
                return c.structureType === STRUCTURE_CONTAINER;
            }
        )
        if (sites.length > 0) {
            return sites[0];
        }
        return undefined;
    },

}

module.exports = state;

































