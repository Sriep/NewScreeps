/**
 * @fileOverview screeps
 * Created by piers on 10/05/2020
 * @author Piers Shepperson
 */
const gc = require("../src/gc");
gc.UNIT_TEST = true;
const assert = require('assert');
const C = require("../src/Constants");
//const gf = require("../src/gf");
const lr = require("../src/lab_reactions");
const tile = require("../src/tile");

describe("lab reactions", function() {
    describe("resource and lab", function() {
        it ("should return resource associated with colours", function() {
            let colourCount = 0;
            for (let resource in gc.LAB_COLOURS) {
                colourCount++;
                assert(resource, lr.resource(
                    gc.LAB_COLOURS[resource].color),
                    gc.LAB_COLOURS[resource].secondaryColor
                )
            }
            assert(colourCount, Object.keys(gc.LAB_COLOURS).length);
        });

        it ("should return reagents that make resource", function() {
            for (let r1 in C.REACTIONS) {
                for (let r2 in C.REACTIONS[r1]) {
                    const reagents = lr.reagents(C.REACTIONS[r1][r2]);
                    assert( reagents[0] === r1 || reagents[0] === r2);
                    assert( reagents[1] === r1 || reagents[1] === r2);
                }
            }
        })

    })
});

describe("lab reactions", function() {
    describe("findProducts", function() {
        it("show resources that can be made", function() {
            let store = {
                [C.RESOURCE_HYDROGEN] : 1000,
                [C.RESOURCE_OXYGEN] : 2000,
                [C.RESOURCE_UTRIUM] : 1000,
                [C.RESOURCE_CATALYST] : 500,
            };
            let products = lr.findProducts(store);
            assert.strictEqual( Object.keys(products).length,3);
            //console.log("products1",JSON.stringify(products));
            assert(products[C.RESOURCE_HYDROXIDE]);
            assert(products[C.RESOURCE_HYDROXIDE].includes(C.RESOURCE_HYDROGEN));
            assert(products[C.RESOURCE_HYDROXIDE].includes(C.RESOURCE_OXYGEN));
            assert(products[C.RESOURCE_UTRIUM_HYDRIDE]);
            assert(products[C.RESOURCE_UTRIUM_HYDRIDE].includes(C.RESOURCE_UTRIUM));
            assert(products[C.RESOURCE_UTRIUM_OXIDE]);
            assert(!products[C.RESOURCE_UTRIUM_ACID]);
            products = lr.findProducts(store, products);
            assert.strictEqual( Object.keys(products).length, 5);
            //console.log("products2",JSON.stringify(products));
            assert(products[C.RESOURCE_UTRIUM_ACID]);
            assert(products[C.RESOURCE_UTRIUM_ALKALIDE]);
            assert(!products[C.RESOURCE_CATALYZED_UTRIUM_ACID]);
            products = lr.findProducts(store, products);
            assert.strictEqual( Object.keys(products).length, 7);
            //console.log("products3",JSON.stringify(products));
            assert(products[C.RESOURCE_CATALYZED_UTRIUM_ACID]);
            assert(products[C.RESOURCE_CATALYZED_UTRIUM_ALKALIDE]);
            products = lr.findProducts(store, products);
            assert.strictEqual( Object.keys(products).length, 7);
            //console.log("products4",JSON.stringify(products));
        });
        it("show resources that can be made", function() {
            let store = {
                [C.RESOURCE_HYDROGEN] : 1000,
                [C.RESOURCE_OXYGEN] : 2000,
                [C.RESOURCE_ZYNTHIUM] : 1000,
                [C.RESOURCE_LEMERGIUM] : 1000,
                [C.RESOURCE_KEANIUM] : 1000,
                [C.RESOURCE_UTRIUM] : 1000,
                [C.RESOURCE_CATALYST] : 500,
            };
            let products = lr.findProducts(store);
            assert.strictEqual( Object.keys(products).length,11);
            //console.log(Object.keys(products).length, "products1",JSON.stringify(products));
            products = lr.findProducts(store, products);
            assert.strictEqual( Object.keys(products).length, 20);
            //console.log(Object.keys(products).length, "products1",JSON.stringify(products));
            products = lr.findProducts(store, products);
            assert.strictEqual( Object.keys(products).length, 30);
            //console.log(Object.keys(products).length, "products1",JSON.stringify(products));
            products = lr.findProducts(store, products);
            assert.strictEqual( Object.keys(products).length, 32);
            //console.log(Object.keys(products).length, "products1",JSON.stringify(products));
            products = lr.findProducts(store, products);
            assert.strictEqual( Object.keys(products).length, 34);
            //console.log(Object.keys(products).length, "products1",JSON.stringify(products));
            products = lr.findProducts(store, products);
            assert.strictEqual( Object.keys(products).length, 34);
            //console.log(Object.keys(products).length, "products1",JSON.stringify(products));
        });
    });

    describe("expandReagentArray", function() {
        it("show componets of resources", function() {
            store = {
                [C.RESOURCE_ZYNTHIUM_KEANITE] : 1000,
                [C.RESOURCE_UTRIUM_LEMERGITE] : 1000,
            };
            let reagents = [C.RESOURCE_CATALYZED_GHODIUM_ALKALIDE];
            reagents = lr.expandReagentArray(reagents,store);
            //console.log("1 reagents", JSON.stringify(reagents));
            reagents = lr.expandReagentArray(reagents,store);
            //console.log("2 reagents", JSON.stringify(reagents));
            reagents = lr.expandReagentArray(reagents,store);
            //console.log("3 reagents", JSON.stringify(reagents));
            reagents = lr.expandReagentArray(reagents,store);
            //console.log("4 reagents", JSON.stringify(reagents));
            reagents = lr.expandReagentArray(reagents,store);
            assert.strictEqual( reagents.length, 10);
            //console.log("5 reagents", JSON.stringify(reagents))

        });
        it("show componets of resources", function() {
            store = {
                [C.RESOURCE_GHODIUM] : 1000,
                //[C.RESOURCE_UTRIUM_LEMERGITE] : 1000,
            };
            let reagents = [C.RESOURCE_CATALYZED_GHODIUM_ALKALIDE];
            //console.log("0 reagents", JSON.stringify(reagents));
            reagents = lr.expandReagentArray(reagents,store);
            //console.log("1 reagents", JSON.stringify(reagents));
            reagents = lr.expandReagentArray(reagents,store);
            //console.log("2 reagents", JSON.stringify(reagents));
            reagents = lr.expandReagentArray(reagents,store);
            //console.log("3 reagents", JSON.stringify(reagents));
            reagents = lr.expandReagentArray(reagents,store);
            //console.log("4 reagents", JSON.stringify(reagents));
            reagents = lr.expandReagentArray(reagents,store);
            assert.strictEqual( reagents.length, 8);
            //console.log("5 reagents", JSON.stringify(reagents))
        })
    });
    describe("expandReagentArray", function() {
        it("map of resources to make resource", function() {
            store = {
                [C.RESOURCE_GHODIUM] : 1000,
            };
            const map1 = lr.reagentMap(C.RESOURCE_CATALYZED_GHODIUM_ALKALIDE, store);
            assert.strictEqual( map1.length, 2);
            //console.log("map", JSON.stringify(map1), map1.length);
            const map2 = lr.reagentMap(C.RESOURCE_CATALYZED_GHODIUM_ALKALIDE, {});
            assert.strictEqual( map2.length, 2);
            //console.log("map", JSON.stringify(map2), map2.length)
        })
    });

    describe("mapReagentsToLabs", function() {
        it.skip("map resoures to labs", function() {

            const store = {
                [C.RESOURCE_UTRIUM] : 1000,
                [C.RESOURCE_LEMERGIUM] : 700,
            };
            const numLabs = 10;
            const centreTile = tile.centres["CENTRE_6x6_3"];
            lr.reagentMap();

            const mapUH = lr.reagentMap(C.RESOURCE_UTRIUM_HYDRIDE, store);
            console.log("reagentMap mapUH",JSON.stringify(mapUH));
            //(reagentMap, numLabs, baseLabs, labMap)
            const mappingUH = lr.mapReagentsToLabs(
                mapUH,
                numLabs,
                centreTile.baseLabs,
                centreTile.labMap
            );
            console.log("mapping mapUH", mappingUH);

            const mapUH2O = lr.reagentMap(C.RESOURCE_UTRIUM_ACID, store);
            console.log("reagentMap mapUH",JSON.stringify(mapUH2O));
            const mappingUH2O = lr.mapReagentsToLabs(
                mapUH2O,
                numLabs,
                centreTile.baseLabs,
                centreTile.labMap
            );
            console.log("mapping mapUH2O", mappingUH2O);

            const mapXGHO2 = lr.reagentMap(C.RESOURCE_CATALYZED_GHODIUM_ALKALIDE, store);
            console.log("reagentMapmap XGHO2 ",JSON.stringify(mapXGHO2));
            const mappingXGHO2 = lr.mapReagentsToLabs(
                mapXGHO2,
                numLabs,
                centreTile.baseLabs,
                centreTile.labMap
            );
            console.log("mapping XGHO2", mappingXGHO2);

        });

        it("map resoures to labs", function() {
            store = {
                [C.RESOURCE_GHODIUM] : 1000,
            };
            const numLabs = 10;
            //const centreTile = tile.CENTRE_6x6_3;
            const centreTile = tile.centres["CENTRE_6x6_3"];
            let count = 0;
            for (let resource of gc.BOOSTS_RESOURCES) {
                const map = lr.reagentMap(resource, store);
                //console.log("map", JSON.stringify(map));
                const mapping = lr.mapReagentsToLabs(
                    map,
                    numLabs,
                    centreTile.baseLab,
                    centreTile.labMap
                );
                //console.log("mapping", JSON.stringify(mapping));
                const mapObj = {};
                for (let pair of mapping) {
                    mapObj[Object.keys(pair)[0]] = pair[Object.keys(pair)[0]]
                }
                for (let resource in mapObj) {
                    if (resource.length > 1) {
                        const reagents = lr.reagents(resource);
                        assert(centreTile.labMap[mapObj[resource]].includes(mapObj[reagents[0]]));
                        assert(centreTile.labMap[mapObj[resource]].includes(mapObj[reagents[1]]));
                        count++
                    }
                }
            }
            assert.strictEqual(count, 80)
        })
    })

});































