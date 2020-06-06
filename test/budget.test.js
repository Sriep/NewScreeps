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
                const neutral = budget.upgraderWsEnergy(C.SOURCE_ENERGY_NEUTRAL_CAPACITY, 20, depth);
                const reserved = budget.upgraderWsEnergy(C.SOURCE_ENERGY_CAPACITY, 20, depth);
                const sourceKeeper = budget.upgraderWsEnergy(C.SOURCE_ENERGY_KEEPER_CAPACITY, 20, depth);
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
            for (let d = 50 ; d < 351 ; d += 50) {
                const dSwamps =  d + 4*0.1*d;
                const noRoads = budget.valueSource(
                    C.SOURCE_ENERGY_NEUTRAL_CAPACITY, dSwamps,  dSwamps,false,0.1*d,
                );
                const noRoads24 = budget.valueSource(
                    C.SOURCE_ENERGY_NEUTRAL_CAPACITY, dSwamps,  dSwamps,false,0.1*d,roomEc
                );
                const roads = budget.valueSource(
                    C.SOURCE_ENERGY_NEUTRAL_CAPACITY, d,  d,true,0.1*d,
                );
                const roads24 = budget.valueSource(
                    C.SOURCE_ENERGY_NEUTRAL_CAPACITY, d,  d,true,0.1*d, roomEc
                );
                const noRoadsReserved = budget.valueSource(
                    C.SOURCE_ENERGY_CAPACITY, dSwamps,  dSwamps,false,0.1*d,
                );
                const noRoads24Reserved = budget.valueSource(
                    C.SOURCE_ENERGY_CAPACITY, dSwamps,  dSwamps,false,0.1*d,roomEc
                );
                const roadsReserved = budget.valueSource(
                    C.SOURCE_ENERGY_CAPACITY, d,  d,true,0.1*d,
                );
                const roads24Reserved = budget.valueSource(
                    C.SOURCE_ENERGY_CAPACITY, d, d, true,0.1*d, roomEc
                );
                assert(d <= 150 ? noRoads.netEnergy > 0 : noRoads.netEnergy < 0);                       //3
                assert(d <= 50 ? noRoads24.netEnergy > 0 : noRoads24.netEnergy < 0);                    //1
                assert(d <= 250 ? roads.netEnergy > 0 : roads.netEnergy < 0);                           //5
                assert(d <= 100 ? roads24.netEnergy > 0 : roads24.netEnergy < 0);                       //2
                assert(d <= 150 ? noRoadsReserved.netEnergy > 0 : noRoadsReserved.netEnergy < 0);       //2
                assert(d <= 100 ? noRoads24Reserved.netEnergy > 0 : noRoads24Reserved.netEnergy < 0);   //2
                assert(d <= 300 ? roadsReserved.netEnergy > 0 : roadsReserved.netEnergy < 0);           //4
                assert(d <= 200 ? roads24Reserved.netEnergy > 0 : roads24Reserved.netEnergy < 0);       //3

            }
        });
       /* it.skip("estimate the value of mining a source", function() {
            const roomEc = 5000;
            const maxd = 351;
            for (let d = 50 ; d < maxd ; d += 50) {
                const dSwamps =  d + 4*0.1*d;
                const noRoads = budget.valueSource(
                    C.SOURCE_ENERGY_NEUTRAL_CAPACITY, dSwamps,  dSwamps,false,0.1*d,
                );
                const noRoads24 = budget.valueSource(
                    C.SOURCE_ENERGY_NEUTRAL_CAPACITY, dSwamps,  dSwamps,false,0.1*d,roomEc
                );
                //console.log("valueSource noRoads",JSON.stringify(noRoads,"", "\t"));
                console.log(d,"valueSource noRoads",noRoads.netEnergy, noRoads.profitParts,
                                "24",noRoads24.netEnergy, noRoads24.profitParts);
            }

            for (let d = 50 ; d < maxd ; d += 50) {
                //const dSwamps =  d + 4*0.1*d;
                const roads = budget.valueSource(
                    C.SOURCE_ENERGY_NEUTRAL_CAPACITY, d,  d,true,0.1*d,
                );
                const roads24 = budget.valueSource(
                    C.SOURCE_ENERGY_NEUTRAL_CAPACITY, d,  d,true,0.1*d, roomEc
                );
                //console.log("valueSource roads",JSON.stringify(roads,"", "\t"));
                console.log(d,"valueSource roads",roads.netEnergy,roads.profitParts,
                    "24",roads24.netEnergy, roads24.profitParts );
            }

            for (let d = 50 ; d < maxd ; d += 50) {
                const dSwamps =  d + 4*0.1*d;
                const noRoadsReserved = budget.valueSource(
                    C.SOURCE_ENERGY_CAPACITY, dSwamps,  dSwamps,false,0.1*d,
                );
                const noRoads24Reserved = budget.valueSource(
                    C.SOURCE_ENERGY_CAPACITY, dSwamps,  dSwamps,false,0.1*d,roomEc
                );
                //console.log("valueSource noRoads reserved",JSON.stringify(noRoadsReserved,"", "\t"))
                console.log(d,"valueSource reserved no roads",noRoadsReserved.netEnergy,noRoadsReserved.profitParts,
                    "24",noRoads24Reserved.netEnergy, noRoads24Reserved.profitParts );
            }

            for (let d = 50 ; d < maxd ; d += 50) {
                //const dSwamps =  d + 4*0.1*d;
                const roadsReserved = budget.valueSource(
                    C.SOURCE_ENERGY_CAPACITY, d,  d,true,0.1*d,true,
                );
                const roads24Reserved = budget.valueSource(
                    C.SOURCE_ENERGY_CAPACITY, d,  d,true,0.1*d,true, roomEc
                );
                //console.log("valueSource roads",JSON.stringify(roadsReserved,"", "\t"))
                console.log(d,"valueSource reserved roads",roadsReserved.netEnergy,roadsReserved.profitParts,
                    "24",roads24Reserved.netEnergy, roads24Reserved.profitParts );
            }
            ///*
            50 valueSource noRoads 4367.254279736018 205.375168627218 24 736.8346993164378 10.893091596122925

            100 valueSource noRoads 2725.954403142024 72.50500319550063 24 -882.8691262697403 -10.530477052166427
            150 valueSource noRoads 906.5289585455821 16.274838525948436 24 -2678.3547623846516 -26.311446610253068
            200 valueSource noRoads -1121.6830124799626 -14.78168463989933 24 -4679.879733791438 -38.41965194620832
            -------------------------------------------------------------------------------------------------------
            50 valueSource roads 4960.710995434113 293.7399402903852 24 1324.5040988823894 20.92360791123654
            100 valueSource roads 4009.651882133621 142.87419385838137 24 388.2233107050497 5.219062440266575

            150 valueSource roads 2995.9217234034622 74.77059330332796 24 -609.6338321520934 -7.064908772693383
            200 valueSource roads 1912.2892447709837 36.08397096023367 24 -1676.1722936905544 -16.912085445500164
            250 valueSource roads 750.3661678479066 11.206675568131816 24 -2819.6338321520943 -24.96199499284687
            300 valueSource roads -499.6338321520934 -6.087003265775497 24 -4049.6338321520943 -31.648378720708827
            -------------------------------------------------------------------------------------------------------
            50 valueSource reserved no roads 9484.508559472037 223.00997606047375 24 6273.6693986328755 72.70888418457531
            100 valueSource reserved no roads 6201.908806284048 82.47926254737145 24 3034.2617474605195 25.566997145070687

            150 valueSource reserved no roads 2563.057917091164 23.00718214244173 24 -556.7095247693014 -3.6012336557161575
            200 valueSource reserved no roads -1493.3660249599252 -9.839885862268943 24 -4559.759467582877 -23.42915171246305
            -------------------------------------------------------------------------------------------------------
            50 valueSource reserved roads 11804.008197764779 443.69638008622525 24 11804.008197764779 443.69638008622525
            100 valueSource reserved roads 10036.446621410098 205.78598230266172 24 10036.446621410098 205.78598230266172
            150 valueSource reserved roads 8145.732335695813 112.22983819382307 24 8145.732335695813 112.22983819382307
            200 valueSource reserved roads 6117.65541261889 62.284068490865614 24 6117.65541261889 62.284068490865614
            250 valueSource reserved roads 3935.732335695813 31.25727018911625 24 3935.732335695813 31.25727018911625
            300 valueSource reserved roads 1580.7323356958132 10.138479565544575 24 1580.7323356958132 10.138479565544575
            350 valueSource reserved roads -969.9198382172326 -5.144840030118113 24 -969.9198382172326 -5.144840030118113
            //

        });
    */
    });
});