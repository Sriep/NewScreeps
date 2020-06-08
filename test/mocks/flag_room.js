/**
 * @fileOverview screeps
 * Created by piers on 07/06/2020
 * @author Piers Shepperson
 */
const C = require("../../src/Constants");
const FlagRoom = require("../../src/flag_room");

const flagRooms = {
    createMock0123:  function() {
        const RoomType = FlagRoom.prototype.RoomType;
        const distance = 50;
        let flagRooms = [];
        const sourceCapacity = [0,C.SOURCE_ENERGY_NEUTRAL_CAPACITY,C.SOURCE_ENERGY_NEUTRAL_CAPACITY,C.SOURCE_ENERGY_KEEPER_CAPACITY];
        const roomType = [RoomType.None, RoomType.Neutral, RoomType.Neutral, RoomType.SourceKeeper];
        //FlagRoom.prototype.PathTo = {
        //    "Spawn" : "Spawn",
        //    "SpawnRoad" : "SpawnRoad",
        //    "Controller" : "Controller",
        //    "ControllerRoad" : "ControllerRoad",
        //};
        for ( let sourceCount = 0; sourceCount <= 3 ; sourceCount++ ) {
            const fRoom = new FlagRoom();
            fRoom.name = sourceCount.toString() + " source";
            let local = {
                flagged: false,
                mapped: false,
                roomType: roomType[sourceCount],
                sources: {},
                controller: {
                    id: 10,
                },
            };
            let paths = {};
            paths[local.controller.id] = {};
            paths[local.controller.id][fRoom.PathTo.Spawn] = { cost: 1.1*distance};
            paths[local.controller.id][fRoom.PathTo.SpawnRoad] = { cost: distance};
            for (let id  = 1 ; id <= sourceCount ; id++ ) {
                local.sources[id] = {
                    energyCapacity: sourceCapacity[sourceCount],
                };
                paths[id] = {};
                paths[id][fRoom.PathTo.Spawn] = {cost: 1.1 * distance};
                paths[id][fRoom.PathTo.SpawnRoad] = {cost: distance};
                paths[id][fRoom.PathTo.Controller] = {cost: 1.1 * distance};
                paths[id][fRoom.PathTo.ControllerRoad] = {cost: distance};
            }
            fRoom.m.local = JSON.stringify(local);
            fRoom.m.paths = {};
            fRoom.m.paths["spawnRoom"] = JSON.stringify(paths);
            flagRooms.push(fRoom);
        }
        return flagRooms;
    }
};

module.exports = flagRooms;


