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
    //const mapping = lr.mapReagentsToLabs(
    //    lr.reagentMap(boost, stores),
    //    [...Array(labs.length).keys()],
    //    [...Array(labs.length).keys()],
    //    [],
    //    this.m.lab_map,
    //    this.m.base_labs
    //);
    //mapReagentsToLabs : function (leftMap, labsInRange, labsLeft, rightStack, labMap, leafLabs)

    //mapReagentsToLabs ["L","U"] numLabs 3 centreTile {"origin":{"x":29,"y":21},"x_dim":6,"y_dim":6,"lab":[{"x":31,"y":23},{"x":31,"y":24},{"x":32,"y":23},{"x":30,"y":24},{"x":31,"y":25},{"x":30,"y":25},{"x":32,"y":22},{"x":31,"y":22},{"x":30,"y":22},{"x":33,"y":22}],"lab_map":[[1,2,3,4,5,6,7,8,9],[0,2,3,4,5,6,7,8,9],[0,1,3,4,5,6,7,8,9],[0,1,2,4,5,6,7,8],[0,1,2,3,5],[0,1,2,3,4],[0,1,2,3,7,8,9],[0,1,2,3,6,8,9],[0,1,2,3,6,7],[0,1,2,6,7]],"base_labs":4,"storage":[{"x":33,"y":25}],"terminal":[{"x":32,"y":25}],"link":[{"x":33,"y":24},{"x":24,"y":24,"roomName":"sim"},{"x":24,"y":23,"roomName":"sim"},{"x":24,"y":23,"roomName":"sim"}],"spawn":[{"x":29,"y":21},{"x":29,"y":23},{"x":34,"y":21}],"powerSpawn":[{"x":34,"y":23}],"scientist":[{"x":32,"y":24}],"observer":[{"x":29,"y":26}],"tower":[{"x":26,"y":18},{"x":26,"y":19},{"x":27,"y":18},{"x":27,"y":19},{"x":27,"y":20},{"x":28,"y":19}],"extension":[{"x":29,"y":17},{"x":29,"y":18},{"x":29,"y":19},{"x":30,"y":17},{"x":30,"y":18},{"x":30,"y":20},{"x":31,"y":17},{"x":31,"y":20},{"x":32,"y":18},{"x":32,"y":19},{"x":33,"y":17},{"x":33,"y":18},{"x":33,"y":19},{"x":34,"y":17},{"x":34,"y":18},{"x":34,"y":20},{"x":35,"y":17},{"x":35,"y":20},{"x":36,"y":18},{"x":36,"y":19},{"x":29,"y":27},{"x":29,"y":28},{"x":29,"y":29},{"x":30,"y":27},{"x":30,"y":28},{"x":30,"y":30},{"x":31,"y":27},{"x":31,"y":30},{"x":32,"y":28},{"x":32,"y":29},{"x":33,"y":27},{"x":33,"y":28},{"x":33,"y":29},{"x":34,"y":27},{"x":34,"y":28},{"x":34,"y":30},{"x":35,"y":27},{"x":35,"y":30},{"x":36,"y":28},{"x":36,"y":29},{"x":22,"y":14},{"x":22,"y":15},{"x":22,"y":16},{"x":23,"y":14},{"x":23,"y":15},{"x":23,"y":17},{"x":24,"y":14},{"x":24,"y":17},{"x":25,"y":15},{"x":25,"y":16},{"x":22,"y":18},{"x":22,"y":19},{"x":22,"y":20},{"x":23,"y":18},{"x":23,"y":19},{"x":23,"y":21},{"x":24,"y":18},{"x":24,"y":21},{"x":25,"y":19},{"x":25,"y":20}],"centre":"CENTRE_6x6_3"}
//[4:36:45 PM]mapReagentsToLabsI leftMap ["L","U"] mapped so far  rightStack [] labs in range [0,1,2] labsLeft [0,1,2]
//    [4:36:45 PM]mapReagentsToLabsI leftMap "L" mapped so far [object Object] rightStack [{"map":"U","labsInRange":[0,1,3,4,5,6,7,8,9]}] labs in range [0,1,3,4,5,6,7,8,9] labsLeft [0,1]
//    [4:36:45 PM]mapReagentsToLabsI leftMap "U" mapped so far [object Object],[object Object] rightStack [] labs in range [0,1,3,4,5,6,7,8,9] labsLeft [1]
//    [4:36:45 PM]flagLabs mapping [{"UL":2},{"L":0},{"U":1}]
//    [4:36:45 PM]objType is not defined
    //    RESOURCE_UTRIUM: "U",
    //     RESOURCE_LEMERGIUM: "L"
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































