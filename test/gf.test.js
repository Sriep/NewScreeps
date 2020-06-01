/**
 * @fileOverview screeps
 * Created by piers on 10/05/2020
 * @author Piers Shepperson
 */

const assert = require('assert');
const C = require("../src/Constants");
const gc = require("../src/gc");
const gf = require("../src/gf");

describe("gf", function() {
    describe("splitRoomName", function() {
        it("should split a room name into NSEW and x,y coordinates", function() {
            const split = gf.splitRoomName("W7N8");
            assert.strictEqual(split.EW, "W");
            assert.strictEqual(split.NS, "N");
            assert.strictEqual(split.x, 7);
            assert.strictEqual(split.y, 8);
        });
        it ("should recognise room names", function() {
            assert(gf.validateRoomName("W7N7"));
            assert(!gf.validateRoomName("the quick brown fox"));
            assert(!gf.validateRoomName("N7W7"));
            assert(gf.validateRoomName("E457S117"));
            assert(gf.validateRoomName("E7N17"));
            assert(gf.validateRoomName("W3S0"));
            assert(!gf.validateRoomName("W-3S0"));
        })
    });
    describe("resource and lab", function() {
        it ("should return resource associated with colours", function() {
            let colourCount = 0;
            for (let resource in gc.LAB_COLOURS) {
                colourCount++;
                assert(resource, gf.resource(
                    gc.LAB_COLOURS[resource].color),
                    gc.LAB_COLOURS[resource].secondaryColor
                )
            }
            assert(colourCount, Object.keys(gc.LAB_COLOURS).length);
        });

        it ("should return reagents that make resource", function() {
            for (let r1 in C.REACTIONS) {
                for (let r2 in C.REACTIONS[r1]) {
                    const reagents = gf.reagents(C.REACTIONS[r1][r2]);
                    assert( reagents[0] === r1 || reagents[0] === r2);
                    assert( reagents[1] === r1 || reagents[1] === r2);
                }
            }
        })

    })
});

describe("lab functions", function() {
    describe("findProducts", function() {
        it("show resources that can be made", function() {
            let store = {
                [C.RESOURCE_HYDROGEN] : 1000,
                [C.RESOURCE_OXYGEN] : 2000,
                [C.RESOURCE_UTRIUM] : 1000,
                [C.RESOURCE_CATALYST] : 500,
            };
            let products = gf.findProducts(store);
            assert.strictEqual( Object.keys(products).length,3);
            //console.log("products1",JSON.stringify(products));
            assert(products[C.RESOURCE_HYDROXIDE]);
            assert(products[C.RESOURCE_HYDROXIDE].includes(C.RESOURCE_HYDROGEN));
            assert(products[C.RESOURCE_HYDROXIDE].includes(C.RESOURCE_OXYGEN));
            assert(products[C.RESOURCE_UTRIUM_HYDRIDE]);
            assert(products[C.RESOURCE_UTRIUM_HYDRIDE].includes(C.RESOURCE_UTRIUM));
            assert(products[C.RESOURCE_UTRIUM_OXIDE]);
            assert(!products[C.RESOURCE_UTRIUM_ACID]);
            products = gf.findProducts(store, products);
            assert.strictEqual( Object.keys(products).length, 5);
            //console.log("products2",JSON.stringify(products));
            assert(products[C.RESOURCE_UTRIUM_ACID]);
            assert(products[C.RESOURCE_UTRIUM_ALKALIDE]);
            assert(!products[C.RESOURCE_CATALYZED_UTRIUM_ACID]);
            products = gf.findProducts(store, products);
            assert.strictEqual( Object.keys(products).length, 7);
            //console.log("products3",JSON.stringify(products));
            assert(products[C.RESOURCE_CATALYZED_UTRIUM_ACID]);
            assert(products[C.RESOURCE_CATALYZED_UTRIUM_ALKALIDE]);
            products = gf.findProducts(store, products);
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
            let products = gf.findProducts(store);
            assert.strictEqual( Object.keys(products).length,11);
            //console.log(Object.keys(products).length, "products1",JSON.stringify(products));
            products = gf.findProducts(store, products);
            assert.strictEqual( Object.keys(products).length, 20);
            //console.log(Object.keys(products).length, "products1",JSON.stringify(products));
            products = gf.findProducts(store, products);
            assert.strictEqual( Object.keys(products).length, 30);
            //console.log(Object.keys(products).length, "products1",JSON.stringify(products));
            products = gf.findProducts(store, products);
            assert.strictEqual( Object.keys(products).length, 32);
            //console.log(Object.keys(products).length, "products1",JSON.stringify(products));
            products = gf.findProducts(store, products);
            assert.strictEqual( Object.keys(products).length, 34);
            //console.log(Object.keys(products).length, "products1",JSON.stringify(products));
            products = gf.findProducts(store, products);
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
            reagents = gf.expandReagentArray(reagents,store);
            //console.log("1 reagents", JSON.stringify(reagents));
            reagents = gf.expandReagentArray(reagents,store);
            //console.log("2 reagents", JSON.stringify(reagents));
            reagents = gf.expandReagentArray(reagents,store);
            //console.log("3 reagents", JSON.stringify(reagents));
            reagents = gf.expandReagentArray(reagents,store);
            //console.log("4 reagents", JSON.stringify(reagents));
            reagents = gf.expandReagentArray(reagents,store);
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
            reagents = gf.expandReagentArray(reagents,store);
            //console.log("1 reagents", JSON.stringify(reagents));
            reagents = gf.expandReagentArray(reagents,store);
            //console.log("2 reagents", JSON.stringify(reagents));
            reagents = gf.expandReagentArray(reagents,store);
            //console.log("3 reagents", JSON.stringify(reagents));
            reagents = gf.expandReagentArray(reagents,store);
            //console.log("4 reagents", JSON.stringify(reagents));
            reagents = gf.expandReagentArray(reagents,store);
            assert.strictEqual( reagents.length, 8);
            //console.log("5 reagents", JSON.stringify(reagents))
        })
    });
    describe("expandReagentArray", function() {
        it("map of resources to make resource", function() {
            store = {
                [C.RESOURCE_GHODIUM] : 1000,
            };
            const map1 = gf.reagentMap(C.RESOURCE_CATALYZED_GHODIUM_ALKALIDE, store);
            //console.log("map", JSON.stringify(map1))
            const map2 = gf.reagentMap(C.RESOURCE_CATALYZED_GHODIUM_ALKALIDE, {});
           // console.log("map", JSON.stringify(map2))
        })
    })
});