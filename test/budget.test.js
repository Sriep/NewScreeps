/**
 * @fileOverview screeps
 * Created by piers on 01/06/2020
 * @author Piers Shepperson
 */

const assert = require('assert');
const C = require("../src/Constants");
const budget = require("../src/budget");


describe("budgeting functions", function() {
    describe("overheads", function() {
        it("estimate the terrain dependant overheads of mining a source", function() {
            for (let distance = 0; distance < 500; distance += 50) {
                const noRoads = budget.overheads( 50, false);
                assert.strictEqual(noRoads.startUpCost, 5000, "cost of container");
                assert.strictEqual(noRoads.runningCostRepair, 750, "cost repair container");

                const roads = budget.overheads( distance, true, 0.1*distance);
                assert.strictEqual(roads.startUpCost, 5000+21000*distance/50, "cost of container plus roads");
                assert.strictEqual(roads.runningCostRepair, 750+105*distance/50, "cost repair container plus roads");
            }
        });
    });
    describe("harvesterWsSource", function() {
        it("estimate work parts need to mine source", function() {
            for (let distance = 50 ; distance < 500 ; distance += 50) {
                const neutral = budget.harvesterWsSource(C.SOURCE_ENERGY_NEUTRAL_CAPACITY, distance);
                const reserved = budget.harvesterWsSource(C.SOURCE_ENERGY_CAPACITY, distance);
                const sourceKeeper = budget.harvesterWsSource(C.SOURCE_ENERGY_KEEPER_CAPACITY, distance);
                assert(neutral > 2.5, "2.5 work part to strip a nutral source");
                assert(reserved > 5, "5 work parts to strip a reserved or owned source");
                assert(sourceKeeper > 6.6, "6.6... work parts needed to strip a source keeper's source");
                assert(Math.abs(reserved - 2*neutral) < 0.00001);
                assert(Math.abs(sourceKeeper - (40/15)*neutral) < 0.00001);
            }
        });
    });
    describe("porterCsSource", function() {
        it("estimate porter parts need to mine source", function() {
            for (let distance = 50 ; distance < 500 ; distance += 50) {
                const neutral = budget.porterCsSource(C.SOURCE_ENERGY_NEUTRAL_CAPACITY, distance,distance);
                const reserved = budget.porterCsSource(C.SOURCE_ENERGY_CAPACITY, distance, distance);
                const sourceKeeper = budget.porterCsSource(C.SOURCE_ENERGY_KEEPER_CAPACITY, distance, distance);
                //console.log("neutral",neutral,"reserved",reserved,"sourceKeeper",sourceKeeper)
                assert(neutral > 0.2*distance, "carry parts lower bound");
                assert(reserved > 0.4*distance, "carry parts lower bound");
                assert(sourceKeeper > 0.5*distance, "carry parts lower bound");
                assert(Math.abs(reserved - 2*neutral) < 0.00001);
                assert(Math.abs(sourceKeeper - (40/15)*neutral) < 0.00001);
            }
        });
    });
    describe("upgraderWsRoom", function() {
        it("iteratively estimate upgrade Ws for room", function() {
            for (let depth = 1 ; depth < 20 ; depth ++) {
                const neutral = budget.upgraderWsRoom(C.SOURCE_ENERGY_NEUTRAL_CAPACITY, 20, depth);
                const reserved = budget.upgraderWsRoom(C.SOURCE_ENERGY_CAPACITY, 20, depth);
                const sourceKeeper = budget.upgraderWsRoom(C.SOURCE_ENERGY_KEEPER_CAPACITY, 20, depth);
                //console.log("neutral",neutral,"reserved",reserved,"sourceKeeper",sourceKeeper)
                assert(neutral > 1.6, "work parts lower bound, levels at ~3.0");
                assert(reserved > 3.1, "work parts lower bound, levels at ~6.0");
                assert(sourceKeeper > 4.2, "work parts lower bound, levels at ~8.0");
                assert(Math.abs(reserved - 2*neutral) < 0.00001);
                assert(Math.abs(sourceKeeper - (40/15)*neutral) < 0.00001);
            }
        });
    });
    describe("valueSource", function() {
        it("estimate the value of mining a source", function() {
            const roomEc = 5000;
            for (let d = 50 ; d < 301 ; d += 50) {
                const dSwamps =  d + 4*0.1*d;
                const noRoads = budget.valueSource(
                    C.SOURCE_ENERGY_NEUTRAL_CAPACITY, dSwamps, dSwamps, dSwamps,false,0.1*d,false,
                );
                const noRoads24 = budget.valueSource(
                    C.SOURCE_ENERGY_NEUTRAL_CAPACITY, dSwamps, dSwamps, dSwamps,false,0.1*d,false,roomEc
                );
                const roads = budget.valueSource(
                    C.SOURCE_ENERGY_NEUTRAL_CAPACITY, d, d, d,true,0.1*d,false,
                );
                const roads24 = budget.valueSource(
                    C.SOURCE_ENERGY_NEUTRAL_CAPACITY, d, d, d,true,0.1*d,false, roomEc
                );
                const noRoadsReserved = budget.valueSource(
                    C.SOURCE_ENERGY_CAPACITY, dSwamps, dSwamps, dSwamps,false,0.1*d,true,
                );
                const noRoads24Reserved = budget.valueSource(
                    C.SOURCE_ENERGY_CAPACITY, dSwamps, dSwamps, dSwamps,false,0.1*d,true,roomEc
                );
                const roadsReserved = budget.valueSource(
                    C.SOURCE_ENERGY_CAPACITY, d, d, d,true,0.1*d,true,
                );
                const roads24Reserved = budget.valueSource(
                    C.SOURCE_ENERGY_CAPACITY, d, d, d,true,0.1*d,true, roomEc
                );
                //console.log("valueSource noRoads",JSON.stringify(noRoads,"", "\t"));
                //console.log(d,"valueSource noRoads",noRoads.netEnergy,"24",noRoads24.netEnergy );
                //console.log("valueSource roads",JSON.stringify(roads,"", "\t"));
                //console.log(d,"valueSource roads",roads.netEnergy,"24",roads24.netEnergy );
                //console.log("valueSource noRoads reserved",JSON.stringify(noRoadsReserved,"", "\t"))
                //console.log(d,"valueSource noRoadsreserved",noRoadsReserved.netEnergy,"24Reserved",noRoads24Reserved.netEnergy );
                //console.log("valueSource roads",JSON.stringify(roadsReserved,"", "\t"))
                //console.log(d,"valueSource roadsReserved",roadsReserved.netEnergy,"roadsReserved24",roads24Reserved.netEnergy );

                assert(d <= 150 ? noRoads.netEnergy > 0 : noRoads.netEnergy < 0);                       //3
                assert(d <= 50 ? noRoads24.netEnergy > 0 : noRoads24.netEnergy < 0);                    //1
                assert(d <= 250 ? roads.netEnergy > 0 : roads.netEnergy < 0);                           //5
                assert(d <= 100 ? roads24.netEnergy > 0 : roads24.netEnergy < 0);                       //2
                assert(d <= 100 ? noRoadsReserved.netEnergy > 0 : noRoadsReserved.netEnergy < 0);       //2
                assert(d <= 100 ? noRoads24Reserved.netEnergy > 0 : noRoads24Reserved.netEnergy < 0);   //2
                assert(d <= 200 ? roadsReserved.netEnergy > 0 : roadsReserved.netEnergy < 0);           //4
                assert(d <= 150 ? roads24Reserved.netEnergy > 0 : roads24Reserved.netEnergy < 0);       //3
            }
        });
    });
});