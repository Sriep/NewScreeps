/**
 * @fileOverview screeps
 * Created by piers on 10/05/2020
 * @author Piers Shepperson
 */

const assert = require('assert');
const construction = require("../src/construction");
const Terrain = require("./terrain");
const pt = { x : 22, y : 13 };

describe("construction", function() {

    describe("can fit rectangle", function() {

        it("return rectangle if fits", function() {
            const terrain = new Terrain("W7N7");

            const data1 = construction.placeRectangle(terrain, {"x":25,"y":25}, 6, 4, []);
            console.log("data1", JSON.stringify(data1));

            const data2 = construction.placeRectangle(terrain, {"x":12,"y":12}, 4, 6, []);
            console.log("data2", JSON.stringify(data2));
        });


        it("return rectangle if fits", function() {
            const terrain = new Terrain("W7N7");
            const data = construction.planWall_2(terrain);
            for (let x = 10 ; x < 40 ; x+= 5) {
                const result = construction.canFitRectangle(terrain, x, 30, 6, 6, data);
            }
        });

        it("show some working", function() {
            const terrain = new Terrain("W7N7");
            const data = construction.planWall_2(terrain, {x:12, y:11});
       });

        it.skip("show some working", function() {
            const terrain = new Terrain("W7N7");
            const data = construction.planwall_1(terrain, {x:12, y:11});
            console.log("centre", JSON.stringify({x:12, y:11}));
            console.log("yUp",JSON.stringify(data.yUp));
            console.log("yDown",JSON.stringify(data.yDown));
            console.log("xRight",JSON.stringify(data.xRight));
            console.log("xLeft",JSON.stringify(data.xLeft));
            console.log("------------------------------------------------------")
        });
    });

    describe("cover  area", function() {
        it("should show best two points to put contaienr", function() {
           const terrainW7N7 = new Terrain("W7N7");
           const pts = construction.coverArea(pt, 3, terrainW7N7);
           assert.strictEqual(pts[0].numPosts + pts[1].numPosts, 2*3*3);
        });

        it.skip("should return true if points within range", function() {
            const pt1 = {x:25,y:14};
            const pt2 = {x:18, y:13};
            const pt3 = {x:21, y:9};
            const pt4 = {x:21, y:10};
            assert(construction.withinRange(pt, pt1,3));
            assert(construction.withinRange(pt1, pt,3));
            assert(!construction.withinRange(pt1, pt2,3));
            assert(!construction.withinRange(pt1, pt3,3));
            assert(construction.withinRange(pt, pt4,3));
        });

        it("should give nxm array of difference", function() {
            delta11 = construction.nxmDeltaArray(1,1);
            assert.strictEqual(9, delta11.length);
            delta33 = construction.nxmDeltaArray(3,3);
            assert.strictEqual(49, delta33.length);
        });
    });
});