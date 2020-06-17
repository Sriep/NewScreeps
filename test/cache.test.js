/**
 * @fileOverview screeps
 * Created by piers on 27/04/2020
 * @author Piers Shepperson
 */
const gc = require("../src/gc");
gc.UNIT_TEST = true;
const assert = require('assert');
const cache = require("../src/cache");
//const gf = require("../src/gf");
const paths = require("./mocks/paths");

//const rawPathW7N7 = "{\"path\":[{\"x\":17,\"y\":10,\"home\":\"W7N7\"},{\"x\":18,\"y\":11,\"home\":\"W7N7\"},{\"x\":19,\"y\":12,\"home\":\"W7N7\"},{\"x\":20,\"y\":13,\"home\":\"W7N7\"},{\"x\":21,\"y\":14,\"home\":\"W7N7\"},{\"x\":22,\"y\":15,\"home\":\"W7N7\"},{\"x\":23,\"y\":16,\"home\":\"W7N7\"}],\"ops\":5,\"cost\":7,\"incomplete\":false}";
//const rawPathW8N7 = "{\"path\":[{\"x\":5,\"y\":6,\"home\":\"W8N7\"},{\"x\":6,\"y\":7,\"home\":\"W8N7\"},{\"x\":7,\"y\":8,\"home\":\"W8N7\"},{\"x\":8,\"y\":9,\"home\":\"W8N7\"},{\"x\":9,\"y\":8,\"home\":\"W8N7\"},{\"x\":10,\"y\":7,\"home\":\"W8N7\"},{\"x\":11,\"y\":6,\"home\":\"W8N7\"},{\"x\":12,\"y\":5,\"home\":\"W8N7\"},{\"x\":13,\"y\":5,\"home\":\"W8N7\"},{\"x\":14,\"y\":5,\"home\":\"W8N7\"},{\"x\":15,\"y\":5,\"home\":\"W8N7\"},{\"x\":16,\"y\":5,\"home\":\"W8N7\"},{\"x\":17,\"y\":5,\"home\":\"W8N7\"},{\"x\":18,\"y\":5,\"home\":\"W8N7\"},{\"x\":19,\"y\":6,\"home\":\"W8N7\"},{\"x\":20,\"y\":7,\"home\":\"W8N7\"},{\"x\":21,\"y\":8,\"home\":\"W8N7\"},{\"x\":22,\"y\":9,\"home\":\"W8N7\"},{\"x\":23,\"y\":10,\"home\":\"W8N7\"},{\"x\":24,\"y\":11,\"home\":\"W8N7\"},{\"x\":25,\"y\":12,\"home\":\"W8N7\"},{\"x\":26,\"y\":13,\"home\":\"W8N7\"},{\"x\":27,\"y\":14,\"home\":\"W8N7\"},{\"x\":28,\"y\":14,\"home\":\"W8N7\"},{\"x\":29,\"y\":14,\"home\":\"W8N7\"},{\"x\":30,\"y\":14,\"home\":\"W8N7\"},{\"x\":31,\"y\":14,\"home\":\"W8N7\"},{\"x\":32,\"y\":14,\"home\":\"W8N7\"},{\"x\":33,\"y\":14,\"home\":\"W8N7\"},{\"x\":34,\"y\":14,\"home\":\"W8N7\"},{\"x\":35,\"y\":14,\"home\":\"W8N7\"},{\"x\":36,\"y\":14,\"home\":\"W8N7\"},{\"x\":37,\"y\":14,\"home\":\"W8N7\"},{\"x\":38,\"y\":14,\"home\":\"W8N7\"},{\"x\":39,\"y\":14,\"home\":\"W8N7\"},{\"x\":40,\"y\":14,\"home\":\"W8N7\"},{\"x\":41,\"y\":14,\"home\":\"W8N7\"},{\"x\":42,\"y\":14,\"home\":\"W8N7\"},{\"x\":43,\"y\":14,\"home\":\"W8N7\"},{\"x\":44,\"y\":14,\"home\":\"W8N7\"},{\"x\":45,\"y\":14,\"home\":\"W8N7\"},{\"x\":46,\"y\":14,\"home\":\"W8N7\"},{\"x\":47,\"y\":14,\"home\":\"W8N7\"},{\"x\":48,\"y\":14,\"home\":\"W8N7\"},{\"x\":49,\"y\":14,\"home\":\"W8N7\"},{\"x\":0,\"y\":14,\"home\":\"W7N7\"},{\"x\":1,\"y\":15,\"home\":\"W7N7\"},{\"x\":2,\"y\":15,\"home\":\"W7N7\"},{\"x\":3,\"y\":15,\"home\":\"W7N7\"},{\"x\":4,\"y\":15,\"home\":\"W7N7\"},{\"x\":5,\"y\":15,\"home\":\"W7N7\"},{\"x\":6,\"y\":15,\"home\":\"W7N7\"},{\"x\":7,\"y\":15,\"home\":\"W7N7\"},{\"x\":8,\"y\":15,\"home\":\"W7N7\"},{\"x\":9,\"y\":15,\"home\":\"W7N7\"},{\"x\":10,\"y\":15,\"home\":\"W7N7\"},{\"x\":11,\"y\":16,\"home\":\"W7N7\"},{\"x\":12,\"y\":16,\"home\":\"W7N7\"},{\"x\":13,\"y\":16,\"home\":\"W7N7\"},{\"x\":14,\"y\":16,\"home\":\"W7N7\"},{\"x\":15,\"y\":16,\"home\":\"W7N7\"},{\"x\":16,\"y\":16,\"home\":\"W7N7\"},{\"x\":17,\"y\":16,\"home\":\"W7N7\"},{\"x\":18,\"y\":16,\"home\":\"W7N7\"},{\"x\":19,\"y\":16,\"home\":\"W7N7\"},{\"x\":20,\"y\":17,\"home\":\"W7N7\"},{\"x\":21,\"y\":18,\"home\":\"W7N7\"}],\"ops\":35,\"cost\":67,\"incomplete\":false}";
//const rawPathW3N7 = "{\"path\":[{\"x\":37,\"y\":4,\"home\":\"W3N7\"},{\"x\":36,\"y\":5,\"home\":\"W3N7\"},{\"x\":35,\"y\":6,\"home\":\"W3N7\"},{\"x\":34,\"y\":7,\"home\":\"W3N7\"},{\"x\":33,\"y\":7,\"home\":\"W3N7\"},{\"x\":32,\"y\":7,\"home\":\"W3N7\"},{\"x\":31,\"y\":7,\"home\":\"W3N7\"},{\"x\":30,\"y\":6,\"home\":\"W3N7\"},{\"x\":29,\"y\":6,\"home\":\"W3N7\"},{\"x\":28,\"y\":6,\"home\":\"W3N7\"},{\"x\":27,\"y\":6,\"home\":\"W3N7\"},{\"x\":26,\"y\":6,\"home\":\"W3N7\"},{\"x\":25,\"y\":6,\"home\":\"W3N7\"},{\"x\":24,\"y\":6,\"home\":\"W3N7\"},{\"x\":23,\"y\":6,\"home\":\"W3N7\"},{\"x\":22,\"y\":6,\"home\":\"W3N7\"},{\"x\":21,\"y\":6,\"home\":\"W3N7\"},{\"x\":20,\"y\":6,\"home\":\"W3N7\"},{\"x\":19,\"y\":6,\"home\":\"W3N7\"},{\"x\":18,\"y\":7,\"home\":\"W3N7\"},{\"x\":17,\"y\":8,\"home\":\"W3N7\"},{\"x\":16,\"y\":9,\"home\":\"W3N7\"},{\"x\":15,\"y\":10,\"home\":\"W3N7\"},{\"x\":14,\"y\":11,\"home\":\"W3N7\"},{\"x\":13,\"y\":12,\"home\":\"W3N7\"},{\"x\":12,\"y\":13,\"home\":\"W3N7\"},{\"x\":11,\"y\":14,\"home\":\"W3N7\"},{\"x\":10,\"y\":15,\"home\":\"W3N7\"},{\"x\":9,\"y\":14,\"home\":\"W3N7\"},{\"x\":8,\"y\":13,\"home\":\"W3N7\"},{\"x\":7,\"y\":12,\"home\":\"W3N7\"},{\"x\":6,\"y\":12,\"home\":\"W3N7\"},{\"x\":5,\"y\":12,\"home\":\"W3N7\"},{\"x\":4,\"y\":12,\"home\":\"W3N7\"},{\"x\":3,\"y\":12,\"home\":\"W3N7\"},{\"x\":2,\"y\":12,\"home\":\"W3N7\"},{\"x\":1,\"y\":12,\"home\":\"W3N7\"},{\"x\":0,\"y\":12,\"home\":\"W3N7\"},{\"x\":49,\"y\":12,\"home\":\"W4N7\"},{\"x\":48,\"y\":13,\"home\":\"W4N7\"},{\"x\":47,\"y\":14,\"home\":\"W4N7\"},{\"x\":46,\"y\":15,\"home\":\"W4N7\"},{\"x\":45,\"y\":15,\"home\":\"W4N7\"},{\"x\":44,\"y\":15,\"home\":\"W4N7\"},{\"x\":43,\"y\":15,\"home\":\"W4N7\"},{\"x\":42,\"y\":15,\"home\":\"W4N7\"},{\"x\":41,\"y\":15,\"home\":\"W4N7\"},{\"x\":40,\"y\":15,\"home\":\"W4N7\"},{\"x\":39,\"y\":15,\"home\":\"W4N7\"},{\"x\":38,\"y\":15,\"home\":\"W4N7\"},{\"x\":37,\"y\":15,\"home\":\"W4N7\"},{\"x\":36,\"y\":15,\"home\":\"W4N7\"},{\"x\":35,\"y\":15,\"home\":\"W4N7\"},{\"x\":34,\"y\":15,\"home\":\"W4N7\"},{\"x\":33,\"y\":15,\"home\":\"W4N7\"},{\"x\":32,\"y\":15,\"home\":\"W4N7\"},{\"x\":31,\"y\":15,\"home\":\"W4N7\"},{\"x\":30,\"y\":15,\"home\":\"W4N7\"},{\"x\":29,\"y\":15,\"home\":\"W4N7\"},{\"x\":28,\"y\":15,\"home\":\"W4N7\"},{\"x\":27,\"y\":15,\"home\":\"W4N7\"},{\"x\":26,\"y\":15,\"home\":\"W4N7\"},{\"x\":25,\"y\":15,\"home\":\"W4N7\"},{\"x\":24,\"y\":15,\"home\":\"W4N7\"},{\"x\":23,\"y\":15,\"home\":\"W4N7\"},{\"x\":22,\"y\":15,\"home\":\"W4N7\"},{\"x\":21,\"y\":15,\"home\":\"W4N7\"},{\"x\":20,\"y\":15,\"home\":\"W4N7\"},{\"x\":19,\"y\":15,\"home\":\"W4N7\"},{\"x\":18,\"y\":15,\"home\":\"W4N7\"},{\"x\":17,\"y\":15,\"home\":\"W4N7\"},{\"x\":16,\"y\":15,\"home\":\"W4N7\"},{\"x\":15,\"y\":15,\"home\":\"W4N7\"},{\"x\":14,\"y\":16,\"home\":\"W4N7\"},{\"x\":13,\"y\":17,\"home\":\"W4N7\"},{\"x\":12,\"y\":18,\"home\":\"W4N7\"},{\"x\":11,\"y\":19,\"home\":\"W4N7\"},{\"x\":10,\"y\":20,\"home\":\"W4N7\"},{\"x\":9,\"y\":20,\"home\":\"W4N7\"},{\"x\":8,\"y\":20,\"home\":\"W4N7\"},{\"x\":7,\"y\":20,\"home\":\"W4N7\"},{\"x\":6,\"y\":20,\"home\":\"W4N7\"},{\"x\":5,\"y\":20,\"home\":\"W4N7\"},{\"x\":4,\"y\":20,\"home\":\"W4N7\"},{\"x\":3,\"y\":20,\"home\":\"W4N7\"},{\"x\":2,\"y\":20,\"home\":\"W4N7\"},{\"x\":1,\"y\":20,\"home\":\"W4N7\"},{\"x\":0,\"y\":20,\"home\":\"W4N7\"},{\"x\":49,\"y\":20,\"home\":\"W5N7\"},{\"x\":48,\"y\":21,\"home\":\"W5N7\"},{\"x\":47,\"y\":22,\"home\":\"W5N7\"},{\"x\":46,\"y\":23,\"home\":\"W5N7\"},{\"x\":45,\"y\":24,\"home\":\"W5N7\"},{\"x\":44,\"y\":25,\"home\":\"W5N7\"},{\"x\":43,\"y\":26,\"home\":\"W5N7\"},{\"x\":42,\"y\":27,\"home\":\"W5N7\"},{\"x\":41,\"y\":27,\"home\":\"W5N7\"},{\"x\":40,\"y\":27,\"home\":\"W5N7\"},{\"x\":39,\"y\":27,\"home\":\"W5N7\"},{\"x\":38,\"y\":26,\"home\":\"W5N7\"},{\"x\":37,\"y\":25,\"home\":\"W5N7\"},{\"x\":36,\"y\":25,\"home\":\"W5N7\"},{\"x\":35,\"y\":25,\"home\":\"W5N7\"},{\"x\":34,\"y\":25,\"home\":\"W5N7\"},{\"x\":33,\"y\":24,\"home\":\"W5N7\"},{\"x\":32,\"y\":23,\"home\":\"W5N7\"},{\"x\":31,\"y\":22,\"home\":\"W5N7\"},{\"x\":30,\"y\":22,\"home\":\"W5N7\"},{\"x\":29,\"y\":22,\"home\":\"W5N7\"},{\"x\":28,\"y\":22,\"home\":\"W5N7\"},{\"x\":27,\"y\":22,\"home\":\"W5N7\"},{\"x\":26,\"y\":22,\"home\":\"W5N7\"},{\"x\":25,\"y\":23,\"home\":\"W5N7\"},{\"x\":24,\"y\":24,\"home\":\"W5N7\"},{\"x\":23,\"y\":24,\"home\":\"W5N7\"},{\"x\":22,\"y\":23,\"home\":\"W5N7\"},{\"x\":21,\"y\":22,\"home\":\"W5N7\"},{\"x\":20,\"y\":21,\"home\":\"W5N7\"},{\"x\":19,\"y\":21,\"home\":\"W5N7\"},{\"x\":18,\"y\":21,\"home\":\"W5N7\"},{\"x\":17,\"y\":21,\"home\":\"W5N7\"},{\"x\":16,\"y\":22,\"home\":\"W5N7\"},{\"x\":15,\"y\":23,\"home\":\"W5N7\"},{\"x\":14,\"y\":24,\"home\":\"W5N7\"},{\"x\":13,\"y\":25,\"home\":\"W5N7\"},{\"x\":12,\"y\":26,\"home\":\"W5N7\"},{\"x\":11,\"y\":27,\"home\":\"W5N7\"},{\"x\":10,\"y\":28,\"home\":\"W5N7\"},{\"x\":9,\"y\":29,\"home\":\"W5N7\"},{\"x\":8,\"y\":30,\"home\":\"W5N7\"},{\"x\":7,\"y\":31,\"home\":\"W5N7\"},{\"x\":6,\"y\":32,\"home\":\"W5N7\"},{\"x\":5,\"y\":33,\"home\":\"W5N7\"},{\"x\":4,\"y\":34,\"home\":\"W5N7\"},{\"x\":3,\"y\":35,\"home\":\"W5N7\"},{\"x\":2,\"y\":36,\"home\":\"W5N7\"},{\"x\":1,\"y\":37,\"home\":\"W5N7\"},{\"x\":0,\"y\":38,\"home\":\"W5N7\"},{\"x\":49,\"y\":38,\"home\":\"W6N7\"},{\"x\":48,\"y\":39,\"home\":\"W6N7\"},{\"x\":47,\"y\":40,\"home\":\"W6N7\"},{\"x\":46,\"y\":41,\"home\":\"W6N7\"},{\"x\":45,\"y\":41,\"home\":\"W6N7\"},{\"x\":44,\"y\":41,\"home\":\"W6N7\"},{\"x\":43,\"y\":41,\"home\":\"W6N7\"},{\"x\":42,\"y\":41,\"home\":\"W6N7\"},{\"x\":41,\"y\":41,\"home\":\"W6N7\"},{\"x\":40,\"y\":41,\"home\":\"W6N7\"},{\"x\":39,\"y\":42,\"home\":\"W6N7\"},{\"x\":38,\"y\":42,\"home\":\"W6N7\"},{\"x\":37,\"y\":42,\"home\":\"W6N7\"},{\"x\":36,\"y\":43,\"home\":\"W6N7\"},{\"x\":35,\"y\":44,\"home\":\"W6N7\"},{\"x\":34,\"y\":45,\"home\":\"W6N7\"},{\"x\":34,\"y\":46,\"home\":\"W6N7\"},{\"x\":33,\"y\":47,\"home\":\"W6N7\"},{\"x\":33,\"y\":48,\"home\":\"W6N7\"},{\"x\":33,\"y\":49,\"home\":\"W6N7\"},{\"x\":33,\"y\":0,\"home\":\"W6N6\"},{\"x\":32,\"y\":1,\"home\":\"W6N6\"},{\"x\":31,\"y\":1,\"home\":\"W6N6\"},{\"x\":30,\"y\":1,\"home\":\"W6N6\"},{\"x\":29,\"y\":2,\"home\":\"W6N6\"},{\"x\":28,\"y\":3,\"home\":\"W6N6\"},{\"x\":27,\"y\":3,\"home\":\"W6N6\"},{\"x\":26,\"y\":3,\"home\":\"W6N6\"},{\"x\":25,\"y\":3,\"home\":\"W6N6\"},{\"x\":24,\"y\":3,\"home\":\"W6N6\"},{\"x\":23,\"y\":3,\"home\":\"W6N6\"},{\"x\":22,\"y\":3,\"home\":\"W6N6\"},{\"x\":21,\"y\":3,\"home\":\"W6N6\"},{\"x\":20,\"y\":3,\"home\":\"W6N6\"},{\"x\":19,\"y\":2,\"home\":\"W6N6\"},{\"x\":18,\"y\":1,\"home\":\"W6N6\"},{\"x\":17,\"y\":1,\"home\":\"W6N6\"},{\"x\":16,\"y\":1,\"home\":\"W6N6\"},{\"x\":15,\"y\":1,\"home\":\"W6N6\"},{\"x\":14,\"y\":1,\"home\":\"W6N6\"},{\"x\":13,\"y\":1,\"home\":\"W6N6\"},{\"x\":12,\"y\":1,\"home\":\"W6N6\"},{\"x\":11,\"y\":1,\"home\":\"W6N6\"},{\"x\":10,\"y\":1,\"home\":\"W6N6\"},{\"x\":9,\"y\":1,\"home\":\"W6N6\"},{\"x\":8,\"y\":1,\"home\":\"W6N6\"},{\"x\":7,\"y\":0,\"home\":\"W6N6\"},{\"x\":7,\"y\":49,\"home\":\"W6N7\"},{\"x\":6,\"y\":48,\"home\":\"W6N7\"},{\"x\":5,\"y\":47,\"home\":\"W6N7\"},{\"x\":4,\"y\":46,\"home\":\"W6N7\"},{\"x\":3,\"y\":45,\"home\":\"W6N7\"},{\"x\":2,\"y\":44,\"home\":\"W6N7\"},{\"x\":2,\"y\":43,\"home\":\"W6N7\"},{\"x\":2,\"y\":42,\"home\":\"W6N7\"},{\"x\":1,\"y\":41,\"home\":\"W6N7\"},{\"x\":0,\"y\":40,\"home\":\"W6N7\"},{\"x\":49,\"y\":40,\"home\":\"W7N7\"},{\"x\":48,\"y\":39,\"home\":\"W7N7\"},{\"x\":47,\"y\":38,\"home\":\"W7N7\"},{\"x\":46,\"y\":37,\"home\":\"W7N7\"},{\"x\":45,\"y\":36,\"home\":\"W7N7\"},{\"x\":44,\"y\":35,\"home\":\"W7N7\"},{\"x\":43,\"y\":34,\"home\":\"W7N7\"},{\"x\":42,\"y\":33,\"home\":\"W7N7\"},{\"x\":41,\"y\":32,\"home\":\"W7N7\"},{\"x\":40,\"y\":31,\"home\":\"W7N7\"},{\"x\":39,\"y\":31,\"home\":\"W7N7\"},{\"x\":38,\"y\":31,\"home\":\"W7N7\"},{\"x\":37,\"y\":30,\"home\":\"W7N7\"},{\"x\":36,\"y\":29,\"home\":\"W7N7\"},{\"x\":35,\"y\":29,\"home\":\"W7N7\"},{\"x\":34,\"y\":29,\"home\":\"W7N7\"},{\"x\":33,\"y\":29,\"home\":\"W7N7\"},{\"x\":32,\"y\":29,\"home\":\"W7N7\"},{\"x\":31,\"y\":29,\"home\":\"W7N7\"},{\"x\":30,\"y\":28,\"home\":\"W7N7\"},{\"x\":29,\"y\":27,\"home\":\"W7N7\"},{\"x\":28,\"y\":26,\"home\":\"W7N7\"},{\"x\":27,\"y\":25,\"home\":\"W7N7\"},{\"x\":26,\"y\":24,\"home\":\"W7N7\"},{\"x\":25,\"y\":23,\"home\":\"W7N7\"},{\"x\":24,\"y\":22,\"home\":\"W7N7\"},{\"x\":23,\"y\":21,\"home\":\"W7N7\"},{\"x\":22,\"y\":20,\"home\":\"W7N7\"},{\"x\":21,\"y\":19,\"home\":\"W7N7\"},{\"x\":21,\"y\":18,\"home\":\"W7N7\"}],\"ops\":450,\"cost\":233,\"incomplete\":false}";
let pathW7N7, pathW8N7, pathW3N7;
//let sPathW7N7, sPathW8N7, sPathW3N7;

describe("cache", function() {
    before(function() {
        pathW7N7 = JSON.parse(paths.rawPathW7N7);
        pathW8N7 = JSON.parse(paths.rawPathW8N7);
        pathW3N7 = JSON.parse(paths.rawPathW3N7);
        //console.log("pathW7N7", pathW7N7.path.length, "pathW8N7", pathW8N7.path.length, "pathW3N7",pathW3N7.path.length);
    });
    describe("deserialisePtAt", function() {
        it("should deserialise single point in path", function() {
            //paths.rawPathW8N7 --> pathW8N7
            for ( let i = 0 ; i < paths.sPathW8N7.length ; i++ ) {
                const ptI = cache.deserialisePtAt(paths.sPathW8N7, i);
                //console.log(i,"ptI",ptI,"pathW8N7",pathW8N7.path[i])
                assert.strictEqual(ptI.x, pathW8N7.path[i].x);
                assert.strictEqual(ptI.y, pathW8N7.path[i].y)
            }

        });
    });
    describe("serialisePath", function() {
        it("should compress path", function() {

            const sPathW7N7 = cache.serialisePath(pathW7N7.path);
            //console.log("sPathW7N7",sPathW7N7,"len",sPathW7N7.length);
            //console.log("typeof", typeof sPathW7N7);
            assert.strictEqual(sPathW7N7.length, pathW7N7.path.length);
            assert.strictEqual(typeof paths.sPathW7N7, "string");

            const sPathW8N7 = cache.serialisePath(pathW8N7.path);
            assert.strictEqual(sPathW8N7.length, pathW8N7.path.length);
            assert.strictEqual(typeof sPathW8N7, "string");

            const sPathW3N7 = cache.serialisePath(pathW3N7.path);
            assert.strictEqual(sPathW3N7.length, pathW3N7.path.length);
            assert.strictEqual(typeof sPathW3N7, "string");
        });
    });
    describe("deserialisePath", function() {
        it("should decompress to {x,y} points", function() {
            //console.log("sPathW7N7", JSON.stringify(sPathW7N7));
            const dPathW7N7 = cache.deserialisePath(paths.sPathW7N7);
            //console.log("pathW7N7.path\t", JSON.stringify(pathW7N7.path))
            //console.log("dPathW7N7\t", JSON.stringify(dPathW7N7))
            assert.strictEqual(dPathW7N7.length, pathW7N7.path.length);
            for (let i in dPathW7N7) {
                assert.strictEqual(dPathW7N7[i].x, pathW7N7.path[i].x);
                assert.strictEqual(dPathW7N7[i].y, pathW7N7.path[i].y)
            }

        });
    });
    describe("deserialiseRnPath", function() {
        it("should decompress to {x,y,home} points", function() {
            //console.log("pathW7N7\t", JSON.stringify(pathW7N7.path));
            const dPathW7N7 = cache.deserialiseRnPath(paths.sPathW7N7, "W7N7");
            assert.strictEqual(dPathW7N7.length, pathW7N7.path.length);
            for (let i in dPathW7N7) {
                assert.strictEqual(dPathW7N7[i].x, pathW7N7.path[i].x);
                assert.strictEqual(dPathW7N7[i].y, pathW7N7.path[i].y);
                //console.log("path roomName",dPathW7N7[i].roomName, pathW7N7.path[i].roomName)
                assert.strictEqual(dPathW7N7[i].roomName, pathW7N7.path[i].roomName);
            }
            //console.log("dPathW7N7\t", JSON.stringify(dPathW7N7))


            //console.log("pathW8N7\t", JSON.stringify(pathW8N7.path));
            const dPathW8N7 = cache.deserialiseRnPath(paths.sPathW8N7, "W8N7");
            //console.log("dPathW8N7\t", JSON.stringify(dPathW8N7));
            assert.strictEqual(dPathW8N7.length, pathW8N7.path.length);
            for (let i in dPathW7N7) {
                assert.strictEqual(dPathW8N7[i].x, pathW8N7.path[i].x);
                assert.strictEqual(dPathW8N7[i].y, pathW8N7.path[i].y);
                assert.strictEqual(dPathW8N7[i].roomName, pathW8N7.path[i].roomName);
            }

            //console.log("pathW3N7\t", JSON.stringify(pathW3N7.path));
            const dPathW3N7 = cache.deserialiseRnPath(paths.sPathW3N7, "W3N7");
            //console.log("dPathW3N7\t", JSON.stringify(dPathW3N7));
            assert.strictEqual(dPathW3N7.length, pathW3N7.path.length);
            for (let i in dPathW3N7) {
                assert.strictEqual(dPathW3N7[i].x, pathW3N7.path[i].x);
                assert.strictEqual(dPathW3N7[i].y, pathW3N7.path[i].y);
                assert.strictEqual(dPathW3N7[i].roomName, pathW3N7.path[i].roomName);
            }

        });
    });
});


