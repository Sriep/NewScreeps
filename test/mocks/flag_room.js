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
            let paths = {
                ControllerSpawn: { cost: 1.1*distance},
                ControllerSpawnRoad: { cost: distance},
            };
            paths["SourceSpawn"] = {};
            paths["SourceSpawnRoad"] = {};
            paths["SourceController"] = {};
            paths["SourceControllerRoad"] = {};
            for (let id  = 1 ; id <= sourceCount ; id++ ) {
                local.sources[id] = {
                    energyCapacity: sourceCapacity[sourceCount],
                };
                paths["SourceSpawn"][id] = {cost: 1.1 * distance};
                paths["SourceSpawnRoad"][id] = {cost: distance};
                paths["SourceController"][id] = {cost: 1.1 * distance};
                paths["SourceControllerRoad"][id] = {cost: distance};
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


