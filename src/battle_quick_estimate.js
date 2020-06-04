/**
 * @fileOverview Screeps module. Abstract base object for battles.
 * @author Piers Shepperson
 */
const C = require("./Constants");
const race = require("./race");
const gc = require("./gc");

const Battle_quick_estimate = {

    quickCombat: function ( enemyCreeps, friendlyCreeps, maxTurns ) {
        console.log("quickCombat start",JSON.stringify(enemyCreeps), JSON.stringify(friendlyCreeps));
        const enemies = this.convert(enemyCreeps);
        const friends = this.convert(friendlyCreeps);
        console.log("quickCombat converts",enemies,friends);
        return this.quickCombatInternal(enemies, friends, maxTurns);
    },

    quickCombatBodies: function( enemyBodies, friendlyBodies) {
        const enemies = this.convertBodies(enemyBodies);
        const friends = this.convertBodies(friendlyBodies);
       // console.log("quickCombatBodies, enemies", enemies,"and firends",friends);
        return this.quickCombatInternal(enemies, friends);
    },

    quickCombatInternal: function(enemies, friends, maxTurns) {
        let range = 3;
        let turns = maxTurns ? maxTurns : 0;
        //console.log("quickCombatInternal",JSON.stringify(enemies),"friends", JSON.stringify(friends));
        while (enemies.length > 0 && friends.length > 0
                && turns < gc.MAX_SIM_BATTLE_LENGTH ) {
            //console.log("quickCombatInternal while start enemies", enemies,"friends", friends);
            let damagedEnemies, damagedFriends;
            damagedFriends = this.applyRangedDamage(enemies, friends, range);
            damagedEnemies = this.applyRangedDamage(friends, enemies, range);
            this.removeDead(damagedFriends);
            this.removeDead(damagedEnemies);
            //console.log("afrter ranged damagedEnemies",damagedEnemies,"damagedFriends",damagedFriends);
            if (range <= 1) {
                damagedFriends = this.applyDamage(enemies, damagedFriends);
                damagedEnemies = this.applyDamage(friends, damagedEnemies);
            }
            //console.log("after attack damagedEnemies",damagedEnemies,"damagedFriends",damagedFriends);
            this.removeDead(damagedFriends);
            this.removeDead(damagedEnemies);

            enemies = damagedEnemies;
            friends = damagedFriends;
            if (range > 1) {
                range--;
            }
            turns++
            //console.log("after quickCombatInternal while end enemies", JSON.stringify(enemies));
            //console.log("after quickCombatInternal while end friends", JSON.stringify(friends));
        }
        return { "friends" : friends, "enemies" : enemies , "turns" : turns };
    },

    removeDead: function(injured) {
        if (!injured) {
            return injured;
        }
        for ( let i = 0 ; i < injured.length ; i++ ) {
            if ( injured[i].parts <= 0)
                {
                    injured.splice(i);
                }
        }
    },

    convert: function (creeps) {
        const formattedCreeps = [];
        //console.log("convert",JSON.stringify(creeps));
        for ( let i = 0 ; i < creeps.length  ; i++ ) {
            const numParts = creeps[i].hits/100;
            const attackParts = race.partsFromBody2(creeps[i].body, C.ATTACK);
            const rangedParts = race.partsFromBody2(creeps[i].body, C.RANGED_ATTACK);
            formattedCreeps.push({
                parts : numParts,
                attackParts : attackParts,
                rangedParts : rangedParts
            });
        }
        formattedCreeps.sort( function (a,b) { return a.parts - b.parts; });
        //console.log("convert formattedCreeps",formattedCreeps);
        return formattedCreeps;
    },

    convertBodies: function (bodies) {
        const formattedCreeps = [];
     //   console.log("convert bodies bodies",JSON.stringify(bodies));
        for ( let i = 0 ; i < bodies.length ; i++ ) {
            const numParts = bodies[i].length;
            const attackParts = race.partsFromBody2(bodies[i], C.ATTACK);
            const rangedParts = race.partsFromBody2(bodies[i], C.RANGED_ATTACK);
            formattedCreeps.push( {  parts : numParts, attackParts : attackParts, rangedParts : rangedParts} );
         //   console.log(i,"convertBodies",numParts,"attackParts",attackParts,"RangedParts",rangedParts);
        }
        formattedCreeps.sort( function (a,b) { return a.parts - b.parts; });
        return formattedCreeps;
    },

    applyDamage: function (attackers, defenders) {
        //console.log("applyDamage start");
        const damagedDefenders = JSON.parse(JSON.stringify(defenders));
        for (let i = 0 ; i < attackers.length ; i++ ){
            this.damageWeakest(damagedDefenders, attackers[i].attackParts*C.ATTACK_POWER);
        }
      //  console.log("applyDamage end");
        return damagedDefenders;
    },

    applyRangedDamage: function(attackers, defenders, range) {
        if (!attackers) {
            return defenders;
        }

        const damagedDefenders = JSON.parse(JSON.stringify(defenders));
       // console.log("applyRangedDamage", attackers);
        if (3 === range) {
            for (let i = 0 ; i < attackers.length ; i++ ){
                this.damageWeakest(damagedDefenders, attackers[i].rangedParts*C.RANGED_ATTACK_POWER);
            }
        } else if (2 === range) {
            for ( let i = 0 ; i < attackers.length ; i++ ){
                this.damageWeakest(damagedDefenders, attackers[i].rangedParts*C.RANGED_ATTACK_POWER);
            }
        } else if (1 <= range) {
            for ( let i = 0 ; i < attackers.length ; i++ ){
                this.damageAll(damagedDefenders, attackers[i].rangedParts*C.RANGED_ATTACK_POWER);
            }
        }
        return damagedDefenders;
    },

    damageWeakest: function(defenders, damage) {
        //console.log("damageWeakest before damage", damage,"defenders", JSON.stringify(defenders));
        for ( let i = 0 ; i < defenders.length ; i++ ) {
            if (damage < defenders[i].hits) {
                if (0 === i) {
                    this.damageCreep(defenders[0], damage);
                } else {
                    this.damageCreep(defenders[i-1], damage);
                }
                return;
            }
        }
        this.damageCreep(defenders[defenders.length - 1], damage);
       // console.log("damageWeakest after damage", damage,"defenders", JSON.stringify(defenders));
    },

    damageAll: function (defenders, damage) {
        for ( let i = 0 ; i < defenders.length ; i++ ) {
            this.damageCreep(defenders[i], damage);
        }
    },

    damageCreep: function (creepInfo, damage) {
       // console.log("before damageCreep  creepinfo", JSON.stringify(creepInfo), "damage",damage);
        creepInfo.parts = creepInfo.parts - damage / 100;
        let damagedAttackParts = Math.floor( creepInfo.attackParts + creepInfo.rangedParts -  creepInfo.parts );
        if (damagedAttackParts > 0){
            if (creepInfo.attackParts <= Math.floor(damagedAttackParts/2) ) {
                damagedAttackParts -= creepInfo.attackParts;
                creepInfo.attackParts = 0;
            } else {
                creepInfo.attackParts -= Math.floor(damagedAttackParts/2);
                damagedAttackParts -= Math.floor(damagedAttackParts/2);
            }

            creepInfo.rangedParts -= Math.floor(damagedAttackParts);
            if (creepInfo.rangedParts < 0) {
                creepInfo.rangedParts = 0;
            }
        }
        //console.log("after damageCreep  creepinfo", JSON.stringify(creepInfo));
        return creepInfo;
    }



};

module.exports = Battle_quick_estimate;































