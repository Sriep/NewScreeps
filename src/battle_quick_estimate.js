/**
 * @fileOverview Screeps module. Abstract base object for battles.
 * @author Piers Shepperson
 */
const C = require("./Constants");
const race = require("./race");
const gc = require("./gc");

const Battle_quick_estimate = {

     //body [{ boost: RESOURCE_UTRIUM_ACID, type: C.ATTACK, hits : 100}]
    quickCombat: function(friends, enemies, maxTurns, log) {
        let range = gc.RANGE_RANGED_ATTACK;
        maxTurns = maxTurns ? maxTurns : gc.MAX_SIM_BATTLE_LENGTH;
        let turn = 0;
        enemies = this.cleanupCombatants(enemies);
        friends = this.cleanupCombatants(friends);
        while (friends.length > 0 && enemies.length > 0 && turn < maxTurns) {
            let friendsPower, enemyPower;
            if (range > 1) {
                friendsPower = this.getRangedPower(friends, range);
                enemyPower = this.getRangedPower(enemies, range);
            } else {
                friendsPower = this.getMeleePower(friends);
                enemyPower = this.getMeleePower(enemies);
            }
            this.resolveDamage(enemies, friendsPower);
            this.resolveDamage(friends, enemyPower);
            if (log) {
                console.log("turn:",turn,"friends hits left:", this.hitsAll(friends),
                    "enemies hits left:", this.hitsAll(enemies))
            }
            enemies = this.cleanupCombatants(enemies);
            friends = this.cleanupCombatants(friends);
            turn++;
            range = range > 1 ? range-1 : range;
        }
        if (log) {
            console.log("turn:",turn,"friends hits left:", this.hitsAll(friends),
                "enemies hits left:", this.hitsAll(enemies))
        }
        return {turns: turn, friends: friends, enemies: enemies};
    },

    getRangedPower: function(attackers, range) {
        if (!attackers) {
            return {damage:0, heal:0};
        }
        let totalDamage = 0;
        let totalHeal = 0;
        for (let attacker of attackers) {
            const damage = this.rangedDamage(attacker, range);
            const healing = this.healingPower(attacker, range);
            totalDamage += damage;
            totalHeal += healing;
        }
        return {damage: totalDamage, heal: totalHeal}
    },

    getMeleePower: function(attackers) {
        if (!attackers) {
            return {damage:0, heal:0};
        }
        let totalDamage = 0;
        let totalHeal = 0;
        for (let attacker of attackers) {
            const damage = this.meleeDamage(attacker);
            const healing = this.healingPower(attacker, 0);
            if (damage > healing) {
                totalDamage += damage;
            } else {
                totalHeal += healing;
            }
        }
        return {damage: totalDamage, heal: totalHeal}
    },

    rangedAttackDamage : [C.RANGED_ATTACK_POWER, C.RANGED_ATTACK_POWER, 4, 1, 0], //10

    healDamage : [ // 12 and 4
        C.HEAL_POWER,
        C.HEAL_POWER,
        C.RANGED_HEAL_POWER,
        C.RANGED_HEAL_POWER,
        C.RANGED_HEAL_POWER,
    ],

    healingPower: function(healer, range) {
        let healing = 0;
        for ( let part of healer.filter(p => {
            return p.type === C.HEAL && p.hits > 0
        })) {
            switch (part.boost) {
                case C.RESOURCE_LEMERGIUM_OXIDE:
                    healing += this.healDamage[range]*2;
                    break;
                case C.RESOURCE_LEMERGIUM_ALKALIDE:
                    healing += this.healDamage[range]*3;
                    break;
                case C.RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE:
                    healing += this.healDamage[range]*4;
                    break;
                case undefined:
                    healing += this.healDamage[range];
                    break;

            }
        }
        return healing;
    },

    meleeDamage : function(attacker) {
        let damage = 0;
        for ( let part of attacker.filter(p => {
            return p.type === C.ATTACK && p.hits > 0
        })) {
            switch (part.boost) {
                case C.RESOURCE_UTRIUM_HYDRIDE:
                    damage += C.ATTACK_POWER*2;
                    break;
                case C.RESOURCE_UTRIUM_ACID:
                    damage += C.ATTACK_POWER*3;
                    break;
                case C.RESOURCE_CATALYZED_UTRIUM_ACID:
                    damage += C.ATTACK_POWER*4;
                    break;
                case undefined:
                    damage += C.ATTACK_POWER;
                    break;

            }
        }
        return damage;
    },

    rangedDamage : function(attacker, range) {
        let damage = 0;
        for ( let part of attacker.filter(p => {
            return p.type === C.RANGED_ATTACK && p.hits > 0
        })) {
            switch (part.boost) {
                case C.RESOURCE_KEANIUM_OXIDE:
                    damage += this.rangedAttackDamage[range]*2;
                    break;
                case C.RESOURCE_KEANIUM_ALKALIDE:
                    damage += this.rangedAttackDamage[range]*3;
                    break;
                case C.RESOURCE_CATALYZED_KEANIUM_ALKALIDE:
                    damage += this.rangedAttackDamage[range]*4;
                    break;
                case undefined:
                    damage += this.rangedAttackDamage[range];
                    break;

            }
        }
        return damage;
    },

    resolveDamage : function(defenders, damage) {
        for (let i = defenders.length-1 ; (i>=0 && damage.heal>0) ; i--) {
            for ( let part of defenders[i].filter(p => { p.hits <= 100 })) {
                const healing = Math.min(damage.heal, 100-part.hits);
                part.hits += healing;
                damage.heal -= healing;
                if (damage.heal <= 0) {
                    break;
                }
            }
        }
        for (let defender of defenders) {
            for (let part of defender.filter(p => { return p.hits > 0})) {
                const partDamage = Math.min(damage.damage, part.hits);
                part.hits -= partDamage;
                damage.damage -= partDamage;
                if ( damage.damage <= 0) {
                    break;
                }
            }
        }
        return damage;
    },

    cleanupCombatants : function(combatants, target) {
        let remainingInfo = [];
        for (let combatant of combatants) {
            //let hits = 0;
            let healHits = 0;
            let attackHits = 0;
            let toughHits = 0;
            let lastLotOtherParts = 0;
            for (let part of combatant) {
                switch (part.type) {
                    case C.HEAL:
                        healHits += part.hits;
                        toughHits += lastLotOtherParts;
                        break;
                    case C.ATTACK:
                    case C.RANGED_ATTACK:
                        attackHits += part.hits;
                        toughHits += lastLotOtherParts;
                        lastLotOtherParts = 0;
                        break;
                    case C.TOUGH:
                        switch(part.boost) {
                            case undefined:
                                lastLotOtherParts += part.hits;
                                break;
                            case RESOURCE_GHODIUM_OXIDE:
                                lastLotOtherParts += part.hits/0.7;
                                break;
                            case RESOURCE_GHODIUM_ALKALIDE:
                                lastLotOtherParts += part.hits/0.5;
                                break;
                            case RESOURCE_CATALYZED_GHODIUM_ALKALIDE:
                                lastLotOtherParts += part.hits/0.3;
                                break;
                        }
                        break;
                    default:
                        lastLotOtherParts += part.hits;
                }
            }

            const attackPower = (attackHits/100)*C.ATTACK_POWER;
            const healPower = (healHits/100)*C.HEAL_POWER;
            toughHits += attackPower > healPower ? attackHits : healHits;
            if (healHits + attackHits > 0) {
                remainingInfo.push({
                    combatant:combatant,
                    toughHits:toughHits,
                })
            }
        }
        remainingInfo.sort((c1, c2) =>
            c1.toughHits - c2.toughHits
        );
        const newCombatants = [];
        for (let info of remainingInfo) {
            newCombatants.push(info.combatant)
        }
        return newCombatants
    },

    hitsAll : function(combatants) {
        let hits = 0;
        for (let combatant of combatants) {
            hits += this.hitsCombatant(combatant)
        }
        return hits;
    },

    hitsCombatant : function (combatant) {
        let hits = 0;
        for (let part of combatant) {
            hits += part.hits
        }
        return hits;
    }
};

module.exports = Battle_quick_estimate;































