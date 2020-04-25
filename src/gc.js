/**
 * @fileOverview screeps
 * Created by piers on 24/04/2020
 * @author Piers Shepperson
 */
const gc = {

    //Roles
    ROLE_HARVESTER: "harvester",
    ROLE_UPGRADER: "upgrader",
    ROLE_BUILDER: "builder",
    ROLE_REPAIRER: "repairer",
    ROLE_LINKER: "linker",
    ROLE_CLAIMER: "claimer",
    ROLE_NEUTRAL_BUILDER: "neutral.builder",
    ROLE_NEUTRAL_HARVESTER: "neutral.harvester",
    ROLE_UNASSIGNED: "unassigned",
    ROLE_SPAWN_BUILDER: "spawn.builder",
    ROLE_MINER: "miner",
    ROLE_TRAVELLER: "traveller",
    ROLE_ENERGY_PORTER: "energy.porter",
    ROLE_LINKER_SOURCE: "linker.source",
    ROLE_LINKER_MINER_STORAGE:  "linker.miner.storage",
    ROLE_STORAGE_REPAIRER: "storage.repairer",
    ROLE_FLEXI_STORAGE_PORTER: "flexi.storage.porter",
    ROLE_PATROL_ROOM: "patrol.room",
    ROLE_GIFT: "gift",
    ROLE_NEUTRAL_PORTER: "neutral.porter",
    ROLE_SCOUT: "scout",
    ROLE_WALL_BUILDER: "wall.builder",
    ROLE_SUPPRESS_KEEPERS: "suppress.keepers",
    ROLE_DISMANTLE_ROOM: "dismantle.room",
    ROLE_ATTACK_ROOM: "attack.room",
    ROLE_MOVE_RESOURCE: "move.resource",
    ROLE_FOLLOW: "follow",
    ROLE_BOOST_AND_SWITCH: "boost.and.switch",

    // economies
    ECONOMY_PEACE: "peace",

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
    FLAG_WALL_COLOUR: COLORS_ALL[COLOR_BROWN],
    FLAG_IGNORE_COLOR: COLORS_ALL[COLOR_RED],

    // Rates
    FLAG_UPDATE_RATE: 5000000,

    // Game constants
    NOTIFY_INTERVAL: 10,
    DEBUG: true,

    TICK_NUMBER: "tick number",

    END : "end"
};

module.exports = gc;










































