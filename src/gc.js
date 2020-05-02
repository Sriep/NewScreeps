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
    //STATE_EMPTY_IDLE: "empty_idle",
    //STATE_MOVE_TARGET: "move_target",
    STATE_MOVE_BETWEEN: "move_between",
    STATE_MOVE_POS: "move_pos",
    // states worker
    STATE_WORKER_IDLE: "worker_idle",
    STATE_WORKER_UPGRADE: "worker_upgrade",
    STATE_WORKER_REPAIR: "worker_repair",
    STATE_WORKER_FULL_IDLE: "worker_full_idle",
    STATE_WORKER_BUILD: "worker_build",
    STATE_WORKER_HARVEST: "worker_harvest",
    STATE_WORKER_TRANSFER: "worker_transfer",
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
    STATE_HARVESTER_FULL: "harvester_full",
    STATE_HARVESTER_TRANSFER: "harvester_transfer",
    STATE_HARVESTER_HARVEST: "harvester_harvest",
    // states upgrader
    STATE_UPGRADER_UPGRADE: "upgrader_upgrade",
    STATE_UPGRADER_WITHDRAW: "upgrader_withdraw",

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

    // Economy
    // Building by RCL
    BUILD_ORDER_RCL: [
        [ "economy_worker", "finished" ],
        [ "economy_worker", "finished" ],
        [
            "economy_specialist",
            "build_source_containers",
            "build_extensions",
            "build_road_source_extension",
            "build_road_source_spawn",
            "build_road_source_source",
            "build_controller_containers",
            "build_road_source_controller",
            "build_road_spawn_controller",
            "finished"
        ],
        [ "economy_specialist", "finished" ],
        [ "economy_specialist", "finished" ],
        [ "economy_specialist", "finished" ],
        [ "economy_specialist", "finished" ],
        [ "economy_specialist", "finished" ],
        [ "economy_specialist", "finished" ],
    ],
    // Economy
    ECONOMY_WORKER: "economy_worker",
    ECONOMY_SPECIALIST: "economy_specialist",
    //builds
    BUILD_EXTENSIONS: "build_extensions",
    BUILD_ROAD_SOURCE_SPAWN: "build_road_source_spawn",
    BUILD_ROAD_SOURCE_CONTROLLER: "build_road_source_controller",
    BUILD_ROAD_SOURCE_EXTENSIONS: "build_road_source_extension",
    BUILD_ROAD_SOURCE_SOURCE: "build_road_source_source",
    BUILD_ROAD_SPAWN_CONTROLLER: "build_road_spawn_controller",
    BUILD_SOURCE_CONTAINERS: "build_source_containers",
    BUILD_CONTROLLER_CONTAINERS: "build_controller_containers",

    BUILDS_FINISHED: "finished",

    MAX_HARVESTER_ROUTE_LENGTH: 300,

    // Rates
    FLAG_UPDATE_RATE: 5000000,
    BUILD_QUEUE_CHECK_RATE: 50,

    // Thresholds
    TOWER_REFILL_THRESHOLD: 0.8,
    EMERGENCY_DOWNGRADING_THRESHOLD: 1500,
    STRUCTURE_REPAIR_THRESHOLD: 0.5,
    CONTAINER_REPAIR_THRESHOLD: 0.5,


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

    END : "end"
};

module.exports = gc;










































