/**
 * @fileOverview screeps
 * Created by piers on 24/04/2020
 * @author Piers Shepperson
 */
const C = require("./Constants");

const pgc = {
    // builds
    // storage structures
    BUILD_EXTENSIONS: "build_extensions",
    BUILD_SOURCE_CONTAINERS: "build_source_containers",
    BUILD_CONTROLLER_CONTAINERS: "build_controller_containers",
    BUILD_TOWERL: "build_tower",
    // roads
    BUILD_ROAD_SOURCE_SPAWN: "build_road_source_spawn",
    BUILD_ROAD_SOURCE_CONTROLLER: "build_road_source_controller",
    BUILD_ROAD_SOURCE_EXTENSIONS: "build_road_source_extension",
    BUILD_ROAD_SOURCE_SOURCE: "build_road_source_source",
    BUILD_ROAD_SPAWN_CONTROLLER: "build_road_spawn_controller",
    BUILD_ROAD_SOURCE_TOWERS: "build_road_source_towers",
    // Msc
    ACTIVITY_FINISHED: "finished",
    ACTIVITY_FOREIGN_MINING: "foreign_mining",
    ACTIVITY_DISALLOWED: "disallowed",
    // policies
    POLICY_GOVERN: "govern",
    POLICY_EXPLORE: "explore",
    POLICY_RCL1: "rcl1",
    POLICY_WORKERS: "workers",
    POLICY_HARVESTERS: "harvesters",
    POLICY_PORTERS: "porters",
    POLICY_BUILD_EXTENSIONS: "build_extensions",
    POLICY_BUILD_ROADS: "build_roads",
    POLICY_BUILD_SOURCE_CONTAINERS: "build_source_containers",
    POLICY_BUILD_CONTROLLER_CONTAINERS: "build_controller_containers",
    POLICY_BUILD_TOWER: "build_tower",
    POLICY_FOREIGN_MINING: "foreign_mining",
    POLICY_MINE_ROOM: "mine_room",
    POLICY_UPGRADER_IDLE: "upgrader_idle",
    POLICY_BUILD_STORAGE: "build_storage",
    POLICY_BUILD_LINKS: "build_links",
    POLICY_COLONIAL_OFFICE: "colonial_office",

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

    ZERO_MOVES: [{x:0, y:0}],
};

const gc = {

    // Races
    RACE_WORKER: "worker",
    RACE_HARVESTER: "harvester",
    RACE_UPGRADER: "upgrader",
    RACE_PORTER: "porter",
    RACE_SCOUT: "scout",
    RACE_RESERVER: "reserver",

    MIN_HARVESTER_EC: 300,
    MAX_HARVESTER_EC: 800,
    HARVESTER_BODY: {
        0 : [],
        300 : [C.WORK, C.WORK, C.CARRY, C.MOVE],
        350 : [C.WORK, C.WORK, C.CARRY, C.MOVE, C.MOVE],
        400 : [C.WORK, C.WORK, C.CARRY, C.MOVE, C.MOVE],
        450 : [C.WORK, C.WORK, C.WORK, C.CARRY, C.MOVE, C.MOVE],
        500 : [C.WORK, C.WORK, C.WORK, C.CARRY, C.MOVE, C.MOVE, C.MOVE],
        550 : [C.WORK, C.WORK, C.WORK, C.WORK, C.CARRY, C.MOVE, C.MOVE],
        600 : [C.WORK, C.WORK, C.WORK, C.WORK, C.CARRY, C.MOVE, C.MOVE, C.MOVE],
        650 : [C.WORK, C.WORK, C.WORK, C.WORK, C.WORK, C.CARRY, C.MOVE, C.MOVE],
        700 : [C.WORK, C.WORK, C.WORK, C.WORK, C.WORK, C.CARRY, C.MOVE, C.MOVE, C.MOVE],
        750 : [C.WORK, C.WORK, C.WORK, C.WORK, C.WORK, C.CARRY, C.MOVE, C.MOVE, C.MOVE, C.MOVE],
        800 : [C.WORK, C.WORK, C.WORK, C.WORK, C.WORK, C.CARRY, C.MOVE, C.MOVE, C.MOVE, C.MOVE, C.MOVE],
    },
    HARVESTER_BODY_COUNTS: {
        0 : {"work": 0, "carry": 0, "move" : 0},
        300 : {"work": 2, "carry": 1, "move" : 1},
        350 : {"work": 2, "carry": 1, "move" : 2},
        400 : {"work": 2, "carry": 1, "move" : 2},
        450 : {"work": 3, "carry": 1, "move" : 2},
        500 : {"work": 3, "carry": 1, "move" : 3},
        550 : {"work": 4, "carry": 1, "move" : 2},
        600 : {"work": 4, "carry": 1, "move" : 3},
        650 : {"work": 5, "carry": 1, "move" : 2},
        700 : {"work": 5, "carry": 1, "move" : 3},
        750 : {"work": 5, "carry": 1, "move" : 4},
        800 : {"work": 5, "carry": 1, "move" : 5},
    },
    MAX_EC_2WORK_HARVESTER: 400,
    MAX_EC_3WORK_HARVESTER: 500,
    MAX_EC_4WORK_HARVESTER: 600,
    ASSIGN_HARVESTER_BUFFER: 33,

    // flags
    FLAG_SOURCE: "source",
    FLAG_MINERAL: "mineral",
    FLAG_CONTROLLER: "controller",
    FLAG_KEEPERS_LAIR: "keeperlair",
    FLAG_LINK: "link",
    FLAG_PORTAL: "portal",
    FLAG_LAB: "lab",
    FLAG_TERMINAL: "terminal",
    FLAG_TOWER: "tower",
    FLAG_WALL: "wall",

    // states
    // states common
    STATE_MOVE_POS: "move_pos",
    STATE_MOVE_TARGET: "move_target",
    // states worker
    STATE_WORKER_IDLE: "worker_idle",
    STATE_WORKER_UPGRADE: "worker_upgrade",
    STATE_WORKER_REPAIR: "worker_repair",
    STATE_WORKER_FULL_IDLE: "worker_full_idle",
    STATE_WORKER_BUILD: "worker_build",
    STATE_WORKER_HARVEST: "worker_harvest",
    STATE_WORKER_TRANSFER: "worker_transfer",
    STATE_WORKER_WITHDRAW: "worker_withdraw",
    STATE_WORKER_PICKUP: "worker_pickup",
    STATE_WORKER_RECEIVE: "worker_receive",
    // states porter
    STATE_PORTER_IDLE:  "porter_idle",
    STATE_PORTER_PICKUP: "porter_pickup",
    STATE_PORTER_FULL_IDLE: "porter_full_idle",
    STATE_PORTER_TRANSFER: "porter_transfer",
    STATE_PORTER_WITHDRAW: "porter_withdraw",
    STATE_PORTER_RECEIVE: "porter_receive",
    // states harvester
    STATE_HARVESTER_IDLE: "harvester_idle",
    STATE_HARVESTER_BUILD: "harvester_build",
    STATE_HARVESTER_REPAIR: "harvester_repair",
    STATE_HARVESTER_TRANSFER: "harvester_transfer",
    STATE_HARVESTER_HARVEST: "harvester_harvest",
    STATE_HARVESTER_LINK: "harvester_link",
    // states upgrader
    STATE_UPGRADER_UPGRADE: "upgrader_upgrade",
    STATE_UPGRADER_WITHDRAW: "upgrader_withdraw",
    STATE_UPGRADER_IDLE: "upgrader_idle",
    // scout
    STATE_SCOUT_IDLE: "scout_idle",
    // claimer
    STATE_RESERVER_IDLE: "reserver_idle",
    STATE_RESERVER_RESERVE: "reserver_reserve",
    //tower
    STATE_TOWER_IDLE: "tower_idle",
    STATE_TOWER_DEFEND: "tower_defend",

    MAX_STATE_STACK: 5,

    //flag colours
    FLAG_PERMANENT_COLOUR:      C.COLORS_ALL[C.COLOR_BLUE],
    FLAG_SOURCE_COLOUR:         C.COLORS_ALL[C.COLOR_YELLOW],
    FLAG_CONTROLLER_COLOUR:     C.COLORS_ALL[C.COLOR_PURPLE],
    FLAG_MINERAL_COLOUR:        C.COLORS_ALL[C.COLOR_GREY],
    FLAG_KEEPERS_LAIR_COLOUR:   C.COLORS_ALL[C.COLOR_ORANGE],
    FLAG_STRUCTURE_COLOUR:      C.COLORS_ALL[C.COLOR_BROWN],
    FLAG_LINK_COLOUR:           C.COLORS_ALL[C.COLOR_CYAN],
    FLAG_HARVEST_KEEPER_COLOUR: C.COLORS_ALL[C.COLOR_RED],
    FLAG_PORTAL_COLOUR:         C.COLORS_ALL[C.COLOR_BLUE],
    FLAG_TERMINAL_COLOUR:       C.COLORS_ALL[C.COLOR_PURPLE],
    FLAG_LAB_COLOUR:            C.COLORS_ALL[C.COLOR_GREY],
    FLAG_CONTAINER_COLOUR:      C.COLORS_ALL[C.COLOR_BROWN],
    FLAG_IGNORE_COLOUR:         C.COLORS_ALL[C.COLOR_RED],

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

    ECONOMIES: [
        pgc.POLICY_RCL1,
        pgc.POLICY_WORKERS,
        pgc.POLICY_HARVESTERS,
        pgc.POLICY_PORTERS,
    ],
    // roads
    BUILD_ROAD_SOURCE_SPAWN: pgc.BUILD_ROAD_SOURCE_SPAWN,
    BUILD_ROAD_SOURCE_CONTROLLER: pgc.BUILD_ROAD_SOURCE_CONTROLLER,
    BUILD_ROAD_SOURCE_EXTENSIONS: pgc.BUILD_ROAD_SOURCE_EXTENSIONS,
    BUILD_ROAD_SOURCE_SOURCE: pgc.BUILD_ROAD_SOURCE_SOURCE,
    BUILD_ROAD_SPAWN_CONTROLLER: pgc.BUILD_ROAD_SPAWN_CONTROLLER,
    BUILD_ROAD_SOURCE_TOWERS: pgc.BUILD_ROAD_SOURCE_TOWERS,
    // Msc
    ACTIVITY_FINISHED: pgc.ACTIVITY_FINISHED,
    ACTIVITY_NEUTRAL_COLONIES: "neutral_colonies",
    ACTIVITY_RESERVED_COLONIES: "reserved_colonies",
    ACTIVITY_DISALLOWED: pgc.ACTIVITY_DISALLOWED,
    // policies
    POLICY_GOVERN: pgc.POLICY_GOVERN,
    POLICY_EXPLORE: pgc.POLICY_EXPLORE,
    POLICY_RCL1: pgc.POLICY_RCL1,
    POLICY_WORKERS: pgc.POLICY_WORKERS,
    POLICY_HARVESTERS: pgc.POLICY_HARVESTERS,
    POLICY_PORTERS: pgc.POLICY_PORTERS,
    POLICY_BUILD_EXTENSIONS: pgc.POLICY_BUILD_EXTENSIONS,
    POLICY_BUILD_ROADS: pgc.POLICY_BUILD_ROADS,
    POLICY_BUILD_SOURCE_CONTAINERS: pgc.POLICY_BUILD_SOURCE_CONTAINERS,
    POLICY_BUILD_CONTROLLER_CONTAINERS: pgc.POLICY_BUILD_CONTROLLER_CONTAINERS,
    POLICY_BUILD_TOWER: pgc.POLICY_BUILD_TOWER,
    POLICY_FOREIGN_MINING: pgc.POLICY_FOREIGN_MINING,
    POLICY_MINE_ROOM: pgc.POLICY_MINE_ROOM,
    POLICY_BUILD_STORAGE: pgc.POLICY_BUILD_STORAGE,
    POLICY_BUILD_LINKS: pgc.POLICY_BUILD_LINKS,
    POLICY_COLONIAL_OFFICE: "colonial_office",
    POLICY_BUILD_EXTRACTORS: "build_extractors",

    //policy
    EXPLORE_CREEPS: 4,

    // spawn priories
    SPAWN_PRIORITY_CRITICAL: 0,
    SPAWN_PRIORITY_LOCAL: 1,
    SPAWN_PRIORITY_FOREIGN: 2,
    SPAWN_PRIORITY_MISC: 3,
    SPAWN_PRIORITY_NONE: 4,
    // spawnResults
    QUEUE_EMPTY: -100,
    QUEUE_HALTED: -101,
    QUEUE_INVALID_ARGS: -102,
    QUEUE_NOT_FOUND: -103,
    QUEUE_INSUFFICIENT_RCL: -104,
    QUEUE_INSUFFICIENT_PRIORITY: -105,

    MAX_HARVESTER_ROUTE_LENGTH: 300,

    // Rates
    FLAG_UPDATE_RATE: 10,
    BUILD_QUEUE_CHECK_RATE: 1,
    BUILD_CHECK_RATE: 1,
    NEUTRAL_ROOM_CHECK_RATE: 10,
    CALC_ROOM_RESOURCES_RATE: 20,
    FREE_HARVESTER_POST_CACHE_RATE: 10,
    COLONIAL_OFFICE_RATE: 10,

    // Thresholds
    TOWER_REFILL_THRESHOLD: 0.8,
    EMERGENCY_DOWNGRADING_THRESHOLD: 3000,
    STRUCTURE_REPAIR_THRESHOLD: 0.5,
    CONTAINER_REPAIR_THRESHOLD: 0.5,
    TOWER_REPAIR_THRESHOLD: 0.9,

    // Economic factors
    SPAWN_TIME_RESERVE: 50, // 50 complete guess.
    MIN_ENERGY_TO_MINE: 1000, // guess
    COLONY_PROFIT_MARGIN: 500,
    COLONY_PROFIT_PART_MARGIN: 10,
    COLONY_PARTS_MARGIN: 50,
    REPLACEMENT_COLONY_PARTS_MARGIN: 50,
    PORTER_FUDGE_FACTOR: 1.5,

    // ownership
    ROOM_ENEMY: "enemy",
    ROOM_NEUTRAL: "neutral",
    ROOM_NEUTRAL_ROADS: "neutral_roads",
    ROOM_RESERVED: "reserved",
    ROOM_RESERVED_ROADS: "reserved_roads",
    ROOM_OWNED: "owned",
    ROOM_OWNED_ROADS: "owned_roads",

    // Game constants
    NOTIFY_INTERVAL: 10,
    DEBUG: true,

    TICK_NUMBER: "tick number",

    RCL_EC: [0, 300, 550, 800, 1300, 1800, 2300, 5600, 12900],

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

    // For find spots to put a linker. B
    // Between resource node and resource dump
    ADJACENCIES: {
        "2" : {
            "2"  : [ { dx : 1, dy : 1 } ],
            "1"  : [ { dx : 1, dy : 1 } , { dx : 1, dy : 0 } ],
            "0"  : [ { dx : 1, dy : 1 } , { dx : 1, dy : 0 }, { dx : 1 , dy : -1 } ],
            "-1" : [ { dx : 1, dy : 0 } , { dx : 1, dy : -1 } ],
            "-2" : [ { dx : 1, dy : -1 } ]
        },
        "1" : {
            "2"  : [ { dx : 1, dy : 1 } , { dx : 0 , dy : 1 } ],
            "1"  : [ { dx : 0, dy : 1 } , { dx : 1, dy : 1 }, { dx : 1, dy : 0 }, { dx : 0, dy : 0 } ],
            "0"  : [ { dx : 0, dy : 1 } , { dx : 1, dy : 1 }, { dx : 1, dy : 1 }, { dx : 1 , dy : -1 },
                { dx : 0 , dy : -1 }, { dx : 0, dy : 0 } ],
            "-1" : [ { dx : 1, dy : 0 } , { dx : 1, dy : -1 }, { dx : 0, dy : -1 }, { dx : 0, dy : 0 } ],
            "-2" : [ { dx : 1, dy : -1 }, { dx : 0 , dy : -1 } ]
        },
        "0" : {
            "2"  : [ { dx : -1, dy : 1 } , { dx : 0, dy : 1 }, { dx : 1 , dy : 1 } ],
            "1"  : [ { dx : -1, dy : 0 } , { dx : -1, dy : 1 } , { dx : 0, dy : 1 },
                { dx : 1 , dy : 1 }, { dx : 1 , dy : 0 }, { dx : 0, dy : 0 } ],
            "-1" : [ { dx : -1, dy : 0 } , { dx : -1, dy : -1 } , { dx : 0, dy : 1 }, { dx : 1 , dy : -1 },
                { dx : 1 , dy : 0 }, { dx : 0, dy : 0 } ],
            "-2" : [ { dx : -1, dy : -1 } , { dx : 0, dy : -1 }, { dx : 1 , dy : -1 } ]
        },
        "-1" : {
            "2"  : [ { dx : -1, dy : 1 } , { dx : 0 , dy : 1 } ],
            "1"  : [ { dx : -1, dy : 0 } , { dx : -1, dy : 1 }, { dx : 0, dy : 1 } , { dx : 0, dy : 0 }],
            "0"  : [ { dx : 0, dy : 1 } , { dx : -1, dy : 1 }, { dx : -1, dy : 0 }, { dx : -1 , dy : -1 },
                { dx : 0 , dy : -1 } , { dx : 0, dy : 0 }],
            "-1" : [ { dx : -1, dy : 0 }, { dx : -1, dy : -1 } , { dx : 0, dy : -1 }, { dx : 0, dy : 0 } ],
            "-2" : [ { dx : -1, dy : -1 }, { dx : 0 , dy : -1 } ]
        },
        "-2" : {
            "2"  : [ { dx : -1, dy : 1 } ],
            "1"  : [ { dx : -1, dy : 1 } , { dx : -1, dy : 0 } ],
            "0"  : [ { dx : -1, dy : 1 } , { dx : -1, dy : 0 }, { dx : -1 , dy : -1 } ],
            "-1" : [ { dx : -1, dy : 0 } , { dx : -1, dy : -1 } ],
            "-2" : [ { dx : -1, dy : -1 } ]
        }
    },

    //creep body bases
    WMC_COST: 200,
    WWM_COST: 250,
    CMMMM_COST: 800,
    CCM_COST: 75,
    RESERVER_MOVE_CLAIM_RATIO: 4,
    PORTER_WORKER_CARRY_RATIO: 8/3,
    HARVESTER_WORKER_RATIO: 8/5,
    RPC_PORTER_CARRY_PARTS: [0, 4, 6, 10, 16, 24, 30, 33, 33],

    //screeps constants
    SORCE_REGEN_LT: 5,

    END : "end"
};

module.exports = gc;










































