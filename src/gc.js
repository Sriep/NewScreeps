/**
 * @fileOverview screeps
 * Created by piers on 24/04/2020
 * @author Piers Shepperson
 */
const gc = {

    // Races
    RACE_WORKER: "worker",
    RACE_HARVESTER: "harvester",
    RACE_PORTER: "porter",

    // Room policies
    POLICY_PEACE: "peace",
    POLICY_DEFENCE: "defence",
    POLICY_RESCUE: "rescue",
    POLICY_BUILD: "build",
    POLICY_NEUTRAL_ROOM: "neutral_room",
    POLICY_BUILD_SPAWN: "build_spawn",

    // flags
    FLAG_SOURCE: "source",
    FLAG_MINERAL: "mineral",
    FLAG_CONTROLLER: STRUCTURE_CONTROLLER,
    FLAG_KEEPERS_LAIR: "keeperlair",
    FLAG_LINK: STRUCTURE_LINK,
    FLAG_PORTAL: STRUCTURE_PORTAL,
    FLAG_LAB: STRUCTURE_LAB,
    FLAG_TERMINAL: STRUCTURE_TERMINAL,
    FLAG_TOWER: STRUCTURE_TOWER,
    FLAG_WALL: "wall",

    // states
    // states common
    STATE_EMPTY_IDLE: "empty_idle",
    STATE_MOVE_TARGET: "move_target",
    STATE_MOVE_BETWEEN: "move_between",
    STATE_MOVE_POS: "move_pos",
    // states harvester
    STATE_HARVESTER_IDLE: "harvester_idle",
    STATE_HARVESTER_BUILD: "harvester_build",
    STATE_HARVESTER_REPAIR: "harvester_repair",
    STATE_HARVESTER_FULL: "harvester_full",
    STATE_HARVESTER_TRANSFER: "harvester_transfer",
    STATE_HARVEST: "harvest",
    // states worker
    STATE_WORKER_UPGRADE: "upgrade",
    STATE_REPAIR: "repair",
    STATE_PORTER: "porter",
    STATE_FULL_IDLE: "full_idle",
    STATE_BUILD: "build",
    STATE_WORKER_HARVEST: "worker_harvest",
    STATE_TRANSFER: "transfer",
    // states porter
    STATE_PORTER_IDLE: "porter_idle",
    STATE_PORTER_PICKUP: "pickup",
    STATE_PORTER_FULL_IDLE: "porter_full_idle",
    STATE_PORTER_TRANSFER: "porter_transfer",
    // states upgrader
    STATE_UPGRADE: "upgrade",
    STATE_UPGRADE_EMPTY: "upgrade_empty",
    STATE_UPGRADE_WITHDRAW: "upgrade_withdraw",
    STATE_UPGRADE_REPAIR: "upgrade_withdraw",

    // Economy settings
    RPC_HARVESTERS: [0, 7, 7, 5, 3, 3, 3, 2, 2],
    RPC_PORTER_CARRY_PARTS: [0, 4, 6, 10, 16, 24, 30, 33, 33],

    //flag colours
    FLAG_PERMANENT_COLOUR: COLORS_ALL[COLOR_BLUE],
    FLAG_SOURCE_COLOUR: COLORS_ALL[COLOR_YELLOW],
    FLAG_CONTROLLER_COLOUR: COLORS_ALL[COLOR_PURPLE],
    FLAG_MINERAL_COLOUR: COLORS_ALL[COLOR_GREY],
    FLAG_KEEPERS_LAIR_COLOUR: COLORS_ALL[COLOR_ORANGE],
    FLAG_STRUCTURE_COLOUR: COLORS_ALL[COLOR_BROWN],
    FLAG_LINK_COLOUR: COLORS_ALL[COLOR_CYAN],
    FLAG_HARVEST_KEEPER_COLOUR: COLORS_ALL[COLOR_RED],
    FLAG_PORTAL_COLOUR: COLORS_ALL[COLOR_BLUE],
    FLAG_TERMINAL_COLOUR: COLORS_ALL[COLOR_PURPLE],
    FLAG_LAB_COLOUR: COLORS_ALL[COLOR_GREY],
    FLAG_CONTAINER_COLOUR: COLORS_ALL[COLOR_BROWN],
    FLAG_IGNORE_COLOR: COLORS_ALL[COLOR_RED],

    //Ranges
    RANGE_HARVEST: 1,
    RANGE_BUILD: 3,
    RANGE_REPAIR: 3,
    RANGE_UPGRADE: 3,
    RANGE_TRANSFER: 1,
    RANGE_ATTACK: 1,
    RANGE_RANGED_ATTACK: 3,
    RANGE_HEAL: 3,
    RANGE_REACTION: 2,

    // Sizes
    LINKING_BUILDER_SIZE: 5,
    REPAIRER_BUILDER_SIZE: 5,
    LINKING_MINER_SIZE: 5,
    BUILDER_SLOW_MAX_SIZE: 16,
    BUILDER_FAST_MAX_SIZE: 12,
    PORTER_SLOW_MAX_SIZE: 32,
    PORTER_FAST_MAX_SIZE: 25,
    SWORDSMAN_NEUTRAL_PATROL_SIZE: 5,

    // Building by RCL
    BUILD_ROAD_SOURCE_SPAWN: 2,
    BUILD_ROAD_SOURCE_CONTROLLER: 2,
    BUILD_ROAD_SOURCE_EXTENSIONS: 2,
    BUILD_ROAD_SOURCE_SOURCE: 2,
    BUILD_ROAD_SPAWN_CONTROLLER: 2,

    // Rates
    FLAG_UPDATE_RATE: 5000000,
    BUILD_CHECK_RATE: 10000,

    // Thresholds
    TOWER_REFILL_THRESHOLD: 0.8,
    EMERGENCY_DOWNGRADING_THRESHOLD: 1500,
    STRUCTURE_REPAIR_THRESHOLD: 0.5,


    // Game constants
    NOTIFY_INTERVAL: 10,
    DEBUG: true,

    TICK_NUMBER: "tick number",

    DELTA_MOVES: [[{x:0, y:0}], this.ONE_MOVE, this.TWO_MOVES, this.THREE_MOVES],
    AAAA: this.ONE_MOVE,
    THREE_MOVES: [
        {x:3, y:3}, {x:3,y:2}, {x:3, y:1}, {x:3,y:0}, {x:3, y:-1}, {x:3, y:-2}, {x:3,y:-3},
        {x:2, y:3}, {x:2,y:2}, {x:2, y:1}, {x:2,y:0}, {x:2, y:-1}, {x:2, y:-2}, {x:2,y:-3},
        {x:1, y:3}, {x:1,y:2}, {x:1, y:1}, {x:1,y:0}, {x:1, y:-1}, {x:1, y:-2}, {x:1,y:-3},
        {x:0, y:3}, {x:0,y:2}, {x:0, y:1}, {x:0,y:0}, {x:0, y:-1}, {x:0, y:-2}, {x:0,y:-3},
        {x:-1, y:3}, {x:-1,y:2}, {x:-1, y:1}, {x:-1,y:0}, {x:-1, y:-1}, {x:-1, y:-2}, {x:-1,y:-3},
        {x:-2, y:3}, {x:-2,y:2}, {x:-2, y:1}, {x:-2,y:0}, {x:-2, y:-1}, {x:-2, y:-2}, {x:-2,y:-3},
        {x:-3, y:3}, {x:-3,y:2}, {x:-3, y:1}, {x:-3,y:0}, {x:-3, y:-1}, {x:-3, y:-2}, {x:-3,y:-3},
    ],

    TWO_MOVES: [
        {x :2, y:2}, {x:2,y:1}, {x :2, y:0}, {x:2,y:-1}, {x :2, y:-2},
        {x :1, y:2}, {x:1,y:1}, {x :1, y:0}, {x:1,y:-1}, {x :1, y:-2},
        {x :0, y:2}, {x:0,y:1}, {x :0, y:0}, {x:0,y:-1}, {x :0, y:-2},
        {x :-1, y:2}, {x:-1,y:1}, {x :-1, y:0}, {x:-1,y:-1}, {x :-1, y:-2},
        {x :-2, y:2}, {x:-2,y:1}, {x :-2, y:0}, {x:-2,y:-1}, {x :-2, y:-2},
    ],

    ONE_MOVE: [
        {x:1, y:1}, {x:1, y:0}, {x:1, y:-1},
        {x:0, y:1}, {x:0, y:0}, {x:0, y:-1},
        {x:-1, y:1}, {x:-1, y:0}, {x:-1, y:-1},
    ],

    END : "end"
};

module.exports = gc;










































