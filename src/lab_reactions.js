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

    mapReagentsToLabs1: function (labs, resources, numBaseResources, numBaseLabs, labMap,) {
        if (numBaseLabs < numBaseResources
            || numBaseResources < 0
            || labs.length < resources.length
            || resources.length < 0) {
            return {};
        }
        //const umLabs = [...Array(labs.length).keys()];
        let umResoures = [...resources];
        const mapping = {};
        let mappedLabs = 0;
        for (let i = numBaseLabs ; i < labs.length ; i ++ ) {
            for (let j = resources.length ; j > numBaseResources ; j-- ) {
                if (labs[i].mineralType === umResoures[j]) {
                    mapping[i] = umResoures[j];
                    mappedLabs++;
                    umResoures = umResoures.slice(0,i).concat(umResoures.slice(i+1))
                }
            }
        }
        this.mapReagentsToLabs2(
            labs.length - mappedLabs,
            umResoures,
            numBaseResources,
            numBaseLabs,
            labMap,
        )
    },

    mapReagentsToLabs2: function (numLabs, resources, numBaseResources, numBaseLabs, labMap) {
        let umResoures = [...resources];
        //const mapping = {};
        //let mappedLabs = 0;
        for (let i = 0 ; i < numBaseLab ; i++ ) {
            for (let j = numBaseResources-1 ; j >= 0 ; j-- ) {
                let result;
                if (numBaseResources > 1) {
                    result = this.mapReagentsToLabs2(
                        numLabs - 1,
                        umResoures.slice(0,j).concat(umResoures.slice(j+1)),
                        numBaseResources-1,
                        numBaseLabs-1,
                        labMap,
                    )
                } else {
                    result = this.mapReagentsToLabs3(
                        numLabs - 1,
                        umResoures.slice(0,j).concat(umResoures.slice(j+1)),
                        labMap,
                    )
                }
            }
        }
    },

    mapReagentsToLabs : function (leftMap, labsInRange, labsLeft, rightStack, labMap, leafLabs) {
        if (labsInRange.length === 0 || labsLeft.length === 0) {
            return { ok:false }
        }
        if (leftMap.length === 1) {
            const leafLabsOk = leafLabs.filter(v => labsInRange.includes(v));
            for ( let lab of leafLabsOk) {
                let ok = true;
                let mapping = [];
                while (rightStack.length > 0 || !ok) {
                    const left = rightStack.pop();
                    const right = this.mapReagentsToLabs(
                        left.map,
                        left.labsInRange.filter(v => labsLeft.includes(v) && v !== lab),
                        labsLeft.filter(v => v !== lab),
                        rightStack,
                        labMap,
                        leafLabs
                    );
                    ok = right.ok;
                    if (ok) {
                        mapping = mapping.concat(right.mapping);
                    }
                }
                if (ok) {
                    mapping[lab] = leftMap[0];
                    return { "ok": true, "mapping": mapping }
                }
            }
        } if (leftMap.length === 2) {
            for ( let i = labsInRange.length-1 ; i >= 0 ; i-- ) {
                rightStack.push({
                    map: leftMap[1],
                    labsInRange: labMap(labsInRange[i]),
                });
                const left = this.mapReagentsToLabs(
                    leftMap[0],
                    labMap(labsInRange[i]).filter(v => labsLeft.includes(v)),
                    labsLeft.filter(v => v !== labsInRange[i]),
                    rightStack,
                    labMap,
                );
                if (left.ok) {
                    return left;
                }
            }
        } else {
            console.log("leftMap", JSON.stringify(leftMap));
            gf.fatalError("something wrong in mapReagentsToLabs")
        }
    },

    expandReagentArray : function (reagents, storage) {
        //console.log("expandReagentArray reagents",JSON.stringify(reagents)
        //    ,"storage",JSON.stringify(storage))
        //console.log("!storage[ZK]", "ZK" in storage, storage["ZK"])
        let temp = [...reagents];
        let atoms = [];
        for (let reagent of reagents) {
            if (!gc.ATOMIC_RESOURCES.includes(reagent) && !(reagent in storage)) {
                temp = this.reagents(reagent).concat(temp)
            } else {
                atoms.push(reagent)
            }
        }
        //console.log("atoms",JSON.stringify(atoms), "temp",JSON.stringify(temp));
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