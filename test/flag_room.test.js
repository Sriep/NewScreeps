/**
 * @fileOverview screeps
 * Created by piers on 01/06/2020
 * @author Piers Shepperson
 */

const assert = require('assert');
const C = require("../src/Constants");
//const gf = require("../src/gf");
const FlagRoom = require("../src/flag_room");

describe("flag_room", function() {
    let flagRooms = [];
    const distance = 50;

    before(function() {
        for ( let sourceCount = 0; sourceCount <= 3 ; sourceCount++ ) {
            const ec = sourceCount > 2 ? C.SOURCE_ENERGY_KEEPER_CAPACITY  : C.SOURCE_ENERGY_NEUTRAL_CAPACITY;
            const fRoom = new FlagRoom();
            fRoom.name = sourceCount.toString() + " source";
            fRoom.m.linkInfo = {};
            let linkInfoW7N7 = {
                sources: [] ,
                controller: {
                    id: 10,
                    pathSpawn: { cost: 1.1*distance},
                    pathSpawnRoad: { cost: distance},
                },
            };
            for (let source  = 1 ; source <= sourceCount ; source++ ) {
                linkInfoW7N7.sources.push({
                    id: source,
                    energyCapacity: ec,
                    pathSpawn: {cost: 1.1 * distance},
                    pathSpawnRoad: {cost: distance},
                    pathController: {cost: 1.1 * distance},
                    pathControllerRoad: {cost: distance},
                });
            }
            fRoom.m.linkInfo["spawnRoom"] = JSON.stringify(linkInfoW7N7);
            flagRooms.push(fRoom)
        }
    });

    describe("value", function() {
        it("should value a room", function() {
            for (let i = 0 ; i < flagRooms.length ; i++) {
                const value1 = flagRooms[i].value("spawnRoom");
                const value2 = flagRooms[i].value("spawnRoom", false, false, 5000);
                //console.log(i, "no roads",JSON.stringify(value1,"no roads","\t"), );
                //console.log(i, "no roads",value1.netEnergy, value1.profitParts, "no roads 24h",value2.netEnergy, value2.profitParts);
                //console.log(i, "no roads",JSON.stringify(value1,"no roads","\t"), );
                //console.log(i, "no roads 24h",value2.netEnergy, value2.profitParts);
                //console.log(i, "no roads",JSON.stringify(value2,"","\t"), );
                if ( i === 0 ) {
                    assert(value1.profitParts === 0);
                    continue
                }
                assert(value1.profitParts > 261 && 288 > value1.profitParts);
                assert(value2.profitParts >16 && 121 > value2.profitParts);

                const value3 = flagRooms[i].value("spawnRoom", true, false);
                assert(value3.profitParts > 295 && 326 > value3.profitParts);
                const value3a = flagRooms[i].value("spawnRoom", true, false,5000);
                assert(value3a.profitParts > 21 && 135 > value3a.profitParts);

                //console.log(i, "roads",value3.netEnergy, value3.profitParts, "roads 24h",value3a.netEnergy, value3a.profitParts);
                //console.log(i, "roads",JSON.stringify(value3, "","\t"));
                if (i < 3) {
                    const value4 = flagRooms[i].value("spawnRoom", false, true);
                    const value4a = flagRooms[i].value("spawnRoom", false, true, 5000);
                    const value5 = flagRooms[i].value("spawnRoom", true, true);
                    const value5a = flagRooms[i].value("spawnRoom", true, true, 5000);

                    //console.log(i, "no roads reserved",JSON.stringify(value4, "","\t"));
                    //console.log(i, "no roads reserved",value4.netEnergy, value4.profitParts, "no roads reserved 24h",value4a.netEnergy, value4a.profitParts);
                    //console.log(i, "roads reserved",JSON.stringify(value5, "","\t"));
                    //console.log(i, "roads reserved",value5.netEnergy, value5.profitParts, "roads reserved 24h",value5a.netEnergy, value5a.profitParts);
                }
            }
        });
    });
});