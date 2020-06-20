/**
 * @fileOverview screeps
 * Created by piers on 11/05/2020
 * @author Piers Shepperson
 */
const gf = require("gf");
const C = require("./Constants");
const CreepMemory = require("creep_memory");
const race = require("race");

class moveCreeps {
    constructor() {
        this._moved = {};
        this._moveIntents  = [];
        this._moves = [];
        this._costMatrix = {}
    }

    get moveIntents() {
        return this._moveIntents
    }

    get moved() {
        return this._moved
    }

    get moves() {
        return this._moves
    }

    get costMatrix() {
        return this._costMatrix
    }

    getCostMatrices(roomName) {
        if (roomName in this.costMatrix) {
            return this.costMatrix[roomName]
        }
        let costs = new PathFinder.CostMatrix;
        Game.rooms[roomName].find(FIND_CONSTRUCTION_SITES).forEach(function (site) {
            if (site.structureType === STRUCTURE_ROAD) {
                costs.set(site.pos.x, site.pos.y, 1);
            } else if (site.structureType !== STRUCTURE_CONTAINER
                && (site.structureType !== STRUCTURE_RAMPART || !site.my)) {
                costs.set(site.pos.x, site.pos.y, 0xff);
            }
        });
        room.find(FIND_CREEPS).forEach(function (creep) {
            costs.set(creep.pos.x, creep.pos.y, 0xff);
        });
        this.costMatrix[roomName] = costs;
        return this.costMatrix[roomName]
    }

    move(creep, direction) {
        const delta = gc.DELTA_DIRECTION[direction];
        this.registerIntent(creep, new RoomPosition(
            creep.pos.x + delta.x,
            creep.pos.y + delta.y,
            creep.pos.roomName
        ))
    }

    moveByPath(creep, path) {
        this.registerIntent(creep, path[1])
    }

    moveToPos(creep, targetPos, ops) {
        const path = PathFinder.search(creep.pos, pos, {
            roomCallback: this.getCostMatrices,
            plainCost: 2,
            swampCost: 10,
        });

        this.registerIntent(creep)
    }

    moveToTarget(creep, target, ops) {
        this.registerIntent(creep)
    }

    registerIntent(creep, targetPos) {
        this.moveIntents.push({
            name: creep.name,
            current: creep.pos,
            target: targetPos,
            type: this.moveType(creep)
        })
    }

    moveCreeps() {
        this.moveIntents.sort((c1, c2) =>
            this.priorities.indexOf(c1.type) -  this.priorities.indexOf(c2.type)
        );
        for (let move of this.moveIntents) {
            this.setCreepMove(move)
        }
    }

    setCreepMove(move) {
        if (!(cache.sPos(move.target) in this.moved)) {
            this.moved[cache.sPos(move.target)] = [move];
            return
        }
        if (this.moved[cache.sPos(move.target)][0].move.type === move.type) {
            return this.moved[cache.sPos(move.target)].push(move);
        }
        if (move.type.startsWith("static")) {
            const pushMove = this.moved[cache.sPos(move.targetPos)][0];
            return this.forceMove(move, "target",pushMove)
        }
        if (!(cache.sPos(move.current) in this.moved)) {
            this.moved[cache.sPos(move.current)] = [move];
            return
        }
        if (this.moved[cache.sPos(move.current)][0].type === move.type) {
            return this.moved[cache.sPos(move.current)].push(move);
        }
        const pushMove = this.moved[cache.sPos(move.current)][0];
        return this.forceMove(move, "current", pushMove)
    }

    forceMove(move, posType, pushMove) {
        const terrain = new Room.Terrain(creep.room.name);
        for (let delta of gc.ONE_MOVE) {
            const movePos = {
                x: move[posType].x+delta.x,
                y: move[posType].y+delta.y,
                roomName: move[posType].roomName
            };
            if (terrain.get(movePos.x, movePos.y) !== C.TERRAIN_MASK_WALL) {
                if ((cache.sPoint(movePos) in this.moved)) {
                    this.moved[cache.sPoint(movePos)] = [move]
                    return;
                }
            }
        }
        this.moved[cache.sPoint(pushMove.current)].push(move);
    }

    moveType(creep) {
        const m = CreepMemory.M(creep);
        const creepRace = race.getRace(creep);
        const fo = policy.getPolicyByType(gc.POLICY_FOREIGN_OFFICE);
        const insurgents = fo ? fo.insurgencies[creep.room] : [];

        if (insurgents && insurgents.length > 0 && !race.isCivilian(creep)) {
            return this.T.MOVE_COMBAT
        }
        if (m.state === gc.STATE_MOVE_PATH) {
            return this.T.MOVE_PATH
        }
        if (m.state.startsWith("move_")) {
            return this.T.MOVE
        }
        if (m.state === gc.STATE_PATROL) {
            return this.T.IDLE;
        }
        if (m.state === race.getRace(creep) + "_idle") {
            return this.T.IDLE;
        }
        return this.T.STATIC;
    }

    get T() {
        return Object.freeze({
            MOVE_DISPLACEMENT: "displacement",
            MOVE_COMBAT: "move combat",
            MOVE_PATH: "move path",
            STATIC_HARVEST: "static harvest",
            RETURN: "move return",
            STATIC: "static",
            MOVE: "move",
            IDLE: "idle",
        })
    }

    get priorities() {
        return [
            this.T.MOVE_COMBAT,
            this.T.MOVE_PATH,
            this.T.STATIC_HARVEST,
            this.T.MOVE,
            this.T.STATIC,
            this.T.IDLE,
        ]
    }

 }

module.exports = move;



























