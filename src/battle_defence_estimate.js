/**
 * Created by Piers on 04/08/2016.
 */
/**
 * @fileOverview Screeps module. Abstract base object for battles.
 * @author Piers Shepperson
 */
"use strict";
const BattleSimCreep = require("battle.sim.creep");
const battleQuickEstimates = require("battle.quick.estimate");
const gc = require("gc");

const Battle_defence_estimate = {

    quickDefence: function ( attackCreeps, defenceCreeps, towers ) {
        if (!attackCreeps) {
            return undefined;
        }
        console.log("quickDefence attackCreeps",attackCreeps," defenceCreeps", defenceCreeps,"towers",towers);

        const posAttackers = this.weightedCentroid(attackCreeps);
        const posDefenders = this.weightedCentroid(defenceCreeps);
        //console.log("quickDefence posAttackers",posAttackers,"posDefenders",posDefenders);
        const attackers = this.convert(attackCreeps, posAttackers);
        const defenders = this.convert(defenceCreeps, posAttackers);
        const simTowers = this.convertTowers(towers, posAttackers);
        let range;
        if (posDefenders){
                range = posDefenders.getRangeTo(posAttackers);
        }
        else {
                range = 0;
        }
        //console.log("before attackTowers attackers",JSON.stringify(attackers) ,"defenders",JSON.stringify(defenders));
        const result = this.attackTowers(attackers, defenders, range, simTowers);
        //console.log("after attackTowers attackers",JSON.stringify(attackers) ,"defenders",JSON.stringify(defenders));
        if (result.attackers.length > 0 && result.defenders.length > 0) {
            const rtv = battleQuickEstimates.quickCombat(
                result.attackers,
                result.defenders,
                result.turns
            );
            //console.log("battleQuickEstimates.quickCombat rtv",JSON.stringify(rtv));
            result.attackers = rtv.enemies;
            result.defenders = rtv.friends;
            result.turns += rtv.turns;
        }

      //  console.log("quickDefence result", JSON.stringify(result));
        return result;
    },

    attackTowers: function ( attackers, defenders, range, towers ) {
        //console.log("attackTowers", attackers, defenders, range, towers);
        let turns = 0;
        while (attackers.length > 0
                && towers.length > 0
                && turns < gc.MAX_SIM_DEFENCE_LENGTH) {
           // console.log("start while");
            let damagedAttackers, damagedDefender;
            const attackersPos = new RoomPosition(
                towers[0].attackersPath[0].x,
                towers[0].attackersPath[0].y,
                towers[0].pos.roomName
            );
            //console.log("before applyRangedDamageAttackers");
            damagedAttackers = this.applyRangedDamageAttackers(
                attackers, defenders, range, towers, attackersPos);
            //console.log("before applyRangedDamageDefenders");
            damagedDefender = this.applyRangedDamageDefenders(
                attackers, defenders, range, towers, attackersPos);
            //console.log("before applyDamageAttackers");
            if (range <= 1) {
                damagedAttackers = this.applyDamageAttackers(defenders, damagedAttackers);
                if (damagedDefender.length > 0) {
                        damagedDefender = this.applyDamageDefenders(attackers, damagedDefender, towers);
                }
            }
            console.log("before remove dead");
            battleQuickEstimates.removeDead(damagedAttackers);
            battleQuickEstimates.removeDead(damagedDefender);
            //console.log("after remove dead");
            if (0 >= towers[0].hits) {
                towers.shift();
                towers = this.reconfigureTowers(towers, attackersPos);
            } else {
                if ( towers[0].attackersPath.length > 1) {
                        towers[0].attackersPath.shift();
                }
            }
            //console.log("after renficureTowers");
            attackers = damagedAttackers;
            defenders = damagedDefender;
            if (range > 1) {
                range--;
            }
            turns++
        }
       // console.log("after while");
        //console.log("end of attack towers attackers.length ",attackers.length ,"towers.length "
        //    ,towers.length ,"turns",turns);
        return { "attackers" : attackers, "defenders" : defenders , "towers" : towers, "turns" : turns };
    },

    applyRangedDamageAttackers: function (attackers, defenders, range, towers, attackersPos) {
   //     console.log("applyRangedDamageAttackers start", JSON.stringify(attackers))
        const damagedAttackers = battleQuickEstimates.applyRangedDamage(defenders, attackers, range);
    //    console.log("towers", towers);
        for ( let i = 0 ; i < towers.length ; i ++ ) {
          //  console.log("applyRangedDamageAttackers tower",i,"before", JSON.stringify(damagedAttackers));
            const towerRange = attackersPos.getRangeTo(towers[i].pos);
            battleQuickEstimates.damageWeakest(damagedAttackers, this.towerDamage(towerRange));
      //      console.log("applyRangedDamageAttackers tower",i,"after", JSON.stringify(damagedAttackers));
        }
      //  console.log("applyRangedDamageAttackers finish");
        return damagedAttackers;
    },

    applyRangedDamageDefenders: function (attackers, defenders, range, towers, attackersPos) {
        const towerRange = attackersPos.getRangeTo(towers[0].pos);
        if (towerRange > 3) {
                return battleQuickEstimates.applyRangedDamage(attackers, defenders, range);
        }
        for (let i = 0 ; i < attackers.length ; i++ ){
            towers[0].hits -= attackers[i].rangedParts*RANGED_ATTACK_POWER;
        }
        if (1 <= towerRange) {
            return battleQuickEstimates.applyRangedDamage(attackers, defenders, range);
        } else {
            return defenders;
        }
    },

    applyDamageAttackers: function (defenders, damagedAttackers) {
        return battleQuickEstimates.applyDamage(defenders, damagedAttackers);
    },

    applyDamageDefenders: function (attackers, damagedDefender, towers) {
        for (var i = 0 ; i < attackers.length ; i++ ){
            console.log("applyDamageDefenders",attackers.length,i);
            if ( towers[0].hits > 0 ) {
                towers[0].hits -= attackers[i].attackParts * ATTACK_POWER;
            }
            else {
                battleQuickEstimates.damageWeakest(damagedDefender, attackers[i].attackParts*ATTACK_POWER);
            }
        }
        console.log("applyDamageDefenders finished");
    },

    convert: function (creeps) {
        const formattedCreeps = [];
        for ( let i = 0 ; i < creeps.length  ; i++ ) {
            const sim = new BattleSimCreep(creeps[i]);
            formattedCreeps.push( sim );
        }
        formattedCreeps.sort( function (a,b) { return a.parts - b.parts; });
        return formattedCreeps;
    },

    convertTowers: function (towers, posAttackers) {
        //console.log("covertTowers posAttackers", posAttackers);
        const simTowers = [];
        for ( let i = 0 ; i < towers.length ; i++) {
            const simTower = {
                "hits" : towers[i].hits,
                "pos" : towers[i].pos,
                "attackersPath" : posAttackers.findPathTo(towers[i])
            };
            simTowers.push(simTower);
        }
        simTowers.sort( function(t1,t2) { return t1.distance - t2.distance; });
        return simTowers;
    },

    reconfigureTowers: function (towers, posAttackers) {
        for ( let i = 0 ; i < towers.length ; i++ ){
            towers[i].attackersPath = posAttackers.findPathTo(towers[i].pos)
        }
        towers.sort( function(t1,t2) { return t1.distance - t2.distance; });
        return towers;
    },

    quickDefenceInternal: function(attackers, defenders, towers) {

    },

    weightedCentroid: function(creeps) {
        if (!creeps || !creeps.length) {
            return undefined;
        }
        let x=0, y=0, parts = 0;
        for ( var i = 0 ; i < creeps.length ; i++ ) {
            var thisParts = creeps[i].getActiveBodyparts(ATTACK);
            thisParts += creeps[i].getActiveBodyparts(RANGED_ATTACK);
            x += creeps[i].pos.x * thisParts;
            y += creeps[i].pos.y * thisParts;
            parts += thisParts;
        }
        //console.log("weightedCentroid x",x,"y",y,"parts",parts,"roomName",creeps[0].pos.roomName);
        //console.log("weightedCentroid x/parts", x/parts,"y/poarts", y/parts, "pos",weightedCentroid);

        return new RoomPosition(
            Math.floor(x / parts),
            Math.floor(y / parts),
            creeps[0].pos.roomName
        );
    },

    towerDamage: function (range) {
        if ( range <= TOWER_OPTIMAL_RANGE ) {
            return TOWER_POWER_ATTACK;
        }
        if ( range >= TOWER_FALLOFF_RANGE) {
            return TOWER_POWER_ATTACK * (1 - TOWER_FALLOFF);
        }
        var fraction = (range - TOWER_OPTIMAL_RANGE) / (TOWER_FALLOFF_RANGE - TOWER_OPTIMAL_RANGE);
        var  reduction = fraction * TOWER_FALLOFF;
        return TOWER_POWER_ATTACK * (1 - reduction);
    },

};

module.exports = Battle_defence_estimate;































