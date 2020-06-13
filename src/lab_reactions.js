/**
 * @fileOverview screeps
 * Created by piers on 01/06/2020
 * @author Piers Shepperson
 */
const C = require("./Constants");
const gc = require("./gc");
const gf = require("./gf");

const lr = {
    resource : function (color, secondaryColor) {
        return Object.keys(gc.LAB_COLOURS).find(key =>
            gc.LAB_COLOURS[key] === { color : color, secondaryColor: secondaryColor }
        );
    },

    reagents: function(resourceId) {
        for ( let i in C.REACTIONS) {
            for ( let j in C.REACTIONS[i] ) {
                if (C.REACTIONS[i][j] === resourceId) {
                    return [ i, j ];
                }
            }
        }
        return [];
    },

    reagentMap : function (root, storage) {
        const map = [];
        for (let reagent of this.reagents(root)) {
            if (gc.ATOMIC_RESOURCES.includes(reagent) || reagent in storage) {
                map.push(reagent)
            } else {
                map.push(this.reagentMap(reagent, storage))
            }
        }
        return map;
    },

    mapReagentsToLabs : function(reagentMap, numLabs, centerTile) {
        //const leafLabs = centerTile.lab_map.slice(0,centerTile.base_labs);
        //console.log("leafLabs", JSON.stringify(leafLabs));
        return this.mapReagentsToLabsI(
            [],
            reagentMap,
            [...Array(numLabs).keys()],
            [...Array(numLabs).keys()],
            [],
            centerTile.lab_map,
            [...Array(centerTile.base_labs).keys()],
        ).mapping
    },

    mapReagentsToLabsI : function (mappedSoFar, map, labsInRange, labsLeft, rightStack, labMap, leafLabs) {
        console.log("mapReagentsToLabsI leftMap", JSON.stringify(map),"mapped so far", mappedSoFar,
            "rightStack", JSON.stringify(rightStack),"labs in range", JSON.stringify(labsInRange),"labsLeft",JSON.stringify(labsLeft));
        if (labsInRange.length === 0 || labsLeft.length === 0) {
            //console.log("returning",JSON.stringify({ ok:false }));
            return { ok:false }
        }
        //console.log("leftMap.length",map.length,"leftMap",JSON.stringify(map));
        if (map.length === 1) {
            if (!Array.isArray(map)) {
                map = [map]
            }
            for (let done of mappedSoFar) {
                //console.log("map",JSON.stringify(map), "done",JSON.stringify(done), "done[map[0]",JSON.stringify(done[map[0]]),
                //    "labsInRange",JSON.stringify(labsInRange), "includes", labsInRange.includes(done[map[0]]));
                if (done[map[0]]>=0) {
                    if (labsInRange.includes(done[map[0]])) {
                        return this.mapReagentsToLabsIExpandRightStack(
                            mappedSoFar,
                            JSON.parse(JSON.stringify(rightStack)),
                            [...labsLeft],
                            labMap,
                            [...leafLabs]
                        );
                    } else {
                        return { "ok" : false }
                    }
                }
            }

            const leafLabsOk = leafLabs.filter(l => labsInRange.includes(l) && labsLeft.includes(l));
            if (leafLabsOk.length < 1) {
                return { "ok" : false }
            }

            for ( let lab of leafLabsOk) {
                //console.log("map",JSON.stringify(map),"lab",lab,"mappedSoFar",JSON.stringify(mappedSoFar))
                const result = this.mapReagentsToLabsIExpandRightStack(
                    this.addToMapping(mappedSoFar, map, lab),
                    JSON.parse(JSON.stringify(rightStack)),
                    labsLeft.filter(l => l !== lab),
                    labMap,
                    leafLabs,
                );
                if (result.ok) {
                    return result;
                }
            }
            return { "ok" : false }

        } else if (map.length === 2) {

            const flatMap = map.flat(10).sort().join("");
            for (let done of mappedSoFar) {
                if (done[flatMap] && labsInRange.includes(done[flatMap])) {
                    const result = this.mapReagentsToLabsIExpandRightStack(
                        mappedSoFar,
                        JSON.parse(JSON.stringify(rightStack)),
                        [...labsLeft],
                        labMap,
                        leafLabs,
                    );
                    if (result.ok) {
                        return result;
                    }
                }
            }
            const allowedLabs = labsInRange.filter(l => labsLeft.includes(l));
            for ( let i = allowedLabs.length-1 ; i >= 0 ; i-- ) {
                rightStack.push({
                    map: map[1],
                    labsInRange: labMap[allowedLabs[i]],
                });
                const left = this.mapReagentsToLabsI(
                    this.addToMapping(mappedSoFar, map, allowedLabs[i]),
                    map[0],
                    labMap[allowedLabs[i]],
                    labsLeft.filter(l => l !== allowedLabs[i]),
                    rightStack,
                    labMap,
                    leafLabs,
                );
                if (left.ok) {
                    //console.log("returning",JSON.stringify(left));
                    return left;
                }
                rightStack.pop();
            }
        } else {
            console.log("leftMap", JSON.stringify(map));
            gf.fatalError("something wrong in mapReagentsToLabsI")
        }
        //console.log("mapReagentsToLabsI dropped through")
        return { ok : false }
    },

    mapReagentsToLabsIExpandRightStack(mappedSoFar, rightStack, labsLeft, labMap, leafLabs) {
        let result = { ok : true, "mapping" : mappedSoFar};
        while (rightStack.length > 0) {
            const left = rightStack.pop();
            result = this.mapReagentsToLabsI(
                result.mapping,
                left.map,
                left.labsInRange,
                labsLeft,
                JSON.parse(JSON.stringify(rightStack)),
                labMap,
                leafLabs
            );
            if (!result.ok) {
               return result;
            }
        }
        return result;
    },

    addToMapping(mappedSoFar, node, labNum) {
        let newMapping = [...mappedSoFar];
        newMapping.push({ [this.flatToResource(node.flat(10).join(""))] : labNum});
        newMapping = [...new Set(newMapping)];
        return newMapping;
    },

    flatToResource(flat) {
        if (flat === "OH" || flat === "HO") {
            return C.RESOURCE_HYDROXIDE;
        }
        let resource = "";
        if (flat.includes(C.RESOURCE_CATALYST)) {
            resource += C.RESOURCE_CATALYST
        }
        if (flat.includes(C.RESOURCE_GHODIUM)) {
            resource += C.RESOURCE_GHODIUM
        }
        if (flat.includes(C.RESOURCE_ZYNTHIUM)) {
            resource += C.RESOURCE_ZYNTHIUM
        }
        if (flat.includes(C.RESOURCE_UTRIUM)) {
            resource += C.RESOURCE_UTRIUM
        }
        if (flat.includes(C.RESOURCE_LEMERGIUM)) {
            resource += C.RESOURCE_LEMERGIUM
        }
        if (flat.includes(C.RESOURCE_KEANIUM)) {
            resource += C.RESOURCE_KEANIUM
        }
        if (flat.includes(C.RESOURCE_HYDROGEN)) {
            resource += C.RESOURCE_HYDROGEN
        }
        if (flat.split(C.RESOURCE_HYDROGEN).length-1 === 2) {
            resource += 2
        }
        if (flat.includes(C.RESOURCE_OXYGEN)) {
            resource += C.RESOURCE_OXYGEN
        }
        if (flat.split(C.RESOURCE_OXYGEN).length-1 === 2) {
            resource += 2
        }
        return resource;
    },

    expandReagentArray : function (reagents, storage) {
        let temp = [...reagents];
        let atoms = [];
        for (let reagent of reagents) {
            if (!gc.ATOMIC_RESOURCES.includes(reagent) && !(reagent in storage)) {
                temp = this.reagents(reagent).concat(temp)
            } else {
                atoms.push(reagent)
            }
        }
        return [...new Set(atoms.concat(temp))];
    },

    assesProducts : function(totals, numLabs) {
        let products = this.findProducts(totals);
        let productCount = Object.keys(products).length;
        if (numLabs < 5 || productCount === 0) {
            return products
        }

        products = this.findProducts(totals, products);
        const productCount2 = Object.keys(products).length;
        if (numLabs < 7 || productCount === productCount2) {
            return products
        }

        products = this.findProducts(totals, products);
        const productCount3 = Object.keys(products).length;
        if (numLabs <= 9 || productCount2 === productCount3) {
            return products
        }

        products = this.findProducts(totals, products);
        return products
    },

    findProducts: function(totals, products) {
        if (products && Object.keys(products).length > 0) {
            for (let reagent1 in products) {
                if (C.REACTIONS[reagent1]) {
                    for (let reagent2 in totals) {
                        if (C.REACTIONS[reagent1][reagent2]) {
                            products[C.REACTIONS[reagent1][reagent2]] = [
                                reagent1, reagent2
                            ]
                        }
                    }
                    for (let reagent2 in products) {
                        if (C.REACTIONS[reagent1][reagent2]) {
                            products[C.REACTIONS[reagent1][reagent2]] = [
                                reagent1, reagent2
                            ]
                        }
                    }
                }
            }
        } else {
            products = {};
            for (let reagent1 in totals) {
                if (C.REACTIONS[reagent1]) {
                    for (let reagent2 in totals) {
                        if (C.REACTIONS[reagent1][reagent2]) {
                            products[C.REACTIONS[reagent1][reagent2]] = [
                                reagent1, reagent2
                            ]
                        }
                    }
                }
            }
        }
        return products;
    },

    prioiritisedBoosts :  [
        // tier 4
        C.RESOURCE_GHODIUM,
        C.RESOURCE_GHODIUM_HYDRIDE,
        //C.RESOURCE_GHODIUM_OXIDE,
        C.RESOURCE_GHODIUM_ACID,
        //C.RESOURCE_GHODIUM_ALKALIDE,
        C.RESOURCE_CATALYZED_GHODIUM_ACID,
        //C.RESOURCE_CATALYZED_GHODIUM_ALKALIDE,

        // tier 3
        //C.RESOURCE_CATALYZED_UTRIUM_ACID,
        C.RESOURCE_CATALYZED_UTRIUM_ALKALIDE,
        C.RESOURCE_CATALYZED_KEANIUM_ACID,
        //C.RESOURCE_CATALYZED_KEANIUM_ALKALIDE,
        C.RESOURCE_CATALYZED_LEMERGIUM_ACID,
        //C.RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE,
        //C.RESOURCE_CATALYZED_ZYNTHIUM_ACID,
        C.RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE,

        // tier 2
        //C.RESOURCE_UTRIUM_ACID,
        C.RESOURCE_UTRIUM_ALKALIDE,
        C.RESOURCE_KEANIUM_ACID,
        //C.RESOURCE_KEANIUM_ALKALIDE,
        C.RESOURCE_LEMERGIUM_ACID,
        //C.RESOURCE_LEMERGIUM_ALKALIDE,
        //C.RESOURCE_ZYNTHIUM_ACID,
        C.RESOURCE_ZYNTHIUM_ALKALIDE,

        // tier 1
        //C.RESOURCE_UTRIUM_HYDRIDE,
        C.RESOURCE_UTRIUM_OXIDE,
        C.RESOURCE_KEANIUM_HYDRIDE,
        //C.RESOURCE_KEANIUM_OXIDE,
        C.RESOURCE_LEMERGIUM_HYDRIDE,
        //C.RESOURCE_LEMERGIUM_OXIDE,
        //C.RESOURCE_ZYNTHIUM_HYDRIDE,
        C.RESOURCE_ZYNTHIUM_OXIDE,

        // tier 0
        C.RESOURCE_HYDROXIDE,
        C.RESOURCE_ZYNTHIUM_KEANITE,
        C.RESOURCE_UTRIUM_LEMERGITE,
    ],
};

module.exports = lr;