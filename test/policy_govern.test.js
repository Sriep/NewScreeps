/**
 * @fileOverview screeps
 * Created by piers on 01/06/2020
 * @author Piers Shepperson
 */
const gc = require("../src/gc");
gc.UNIT_TEST = true;
const assert = require('assert');
const PolicyGovern = require("../src/policy_govern");
const MockFlagRoom = require("./mocks/flag_room");
const policy = require("../src/policy");

describe("policy_govern", function() {

    //let flagRooms = [];
    //const distance = 50;
/*
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
            fRoom.m.linkInfo["W7N7"] = JSON.stringify(linkInfoW7N7);
            flagRooms.push(fRoom)
        }
    });
    */
    describe("requestAddColony", function() {
        it("should add colony if satisfies requirments", function() {
            policy.getPolicyByType = function(){ return { decolonise : function(){} } };
            const flagRooms = MockFlagRoom.createMock0123();
            //console.log("Game.rooms[W7N7]", JSON.stringify(Game.rooms["W7N7"]));
            const data = JSON.parse("{\"id\":\"1\",\"type\":\"govern\",\"m\":{\"home\":\"spawnRoom\",\"colonies\":[{\"name\":\"W7N7\",\"profit\":24013.959194801653,\"parts\":109,\"profitpart\":220.31155224588673,\"spawnPartsLT\":500},{\"name\":\"W6N7\",\"profit\":5049.1801338749665,\"parts\":14.490120572835886,\"profitpart\":348.4567370226363},{\"name\":\"W7N6\",\"profit\":4994.718048155326,\"parts\":15.047040303752608,\"profitpart\":331.9402319212028},{\"name\":\"W8N7\",\"profit\":9477.892853291694,\"parts\":35.257662643787256,\"profitpart\":268.8179573628597},{\"name\":\"W7N8\",\"profit\":4501.865228928857,\"parts\":20.02146725184417,\"profitpart\":224.85191381336904},{\"name\":\"W8N6\",\"profit\":4246.011508797921,\"parts\":22.619565713627846,\"profitpart\":187.71410391136652},{\"name\":\"W5N8\",\"profit\":7608.1646108192035,\"parts\":54.16591157380424,\"profitpart\":140.46038162678445},{\"name\":\"W6N8\",\"profit\":7209.658901704921,\"parts\":58.19528992483765,\"profitpart\":123.88732680972262},{\"name\":\"W8N8\",\"profit\":718.0137415673533,\"parts\":58.486372738706194,\"profitpart\":12.276598939981328},{\"name\":\"W5N7\",\"profit\":330.3473523279191,\"parts\":32.15253019292711,\"profitpart\":10.274381218078715}],\"parts\":419.435960916123}}");
            const data0 = JSON.parse("{\"id\":\"1\",\"m\":{\"home\":\"W7N7\",\"rcl\":2,\"agendaIndex\":8,\"colonies\":[{\"name\":\"W7N7\",\"profit\":27422.13562915782,\"parts\":72,\"profitpart\":380.8629948494142,\"spawnPartsLT\":500},{\"name\":\"W8N7\",\"profit\":7872.625213529242,\"parts\":60.83602160700082,\"profitpart\":129.40729859664728},{\"name\":\"W6N7\",\"profit\":3409.5318812065907,\"parts\":40.22837328134307,\"profitpart\":84.75440598508735},{\"name\":\"W7N6\",\"profit\":3346.418276718512,\"parts\":40.85950932622385,\"profitpart\":81.90059870764927},{\"name\":\"W8N8\",\"profit\":6233.159634747133,\"parts\":77.15775349565236,\"profitpart\":80.7846179074972},{\"name\":\"W7N8\",\"profit\":3170.648282481463,\"parts\":42.53820107446347,\"profitpart\":74.5364919623944},{\"name\":\"W6N8\",\"profit\":5507.071402470067,\"parts\":84.26768517079978,\"profitpart\":65.35211441144895}],\"agendaName\":\"default_1\",\"mine_colonies\":true,\"parts\":417.88754395548335},\"type\":\"govern\"}");
            const data2 = { m : {
                    parts: 45,
                    [gc.ACTIVITY_COLONY_ROADS]: true,
                    [gc.ACTIVITY_RESERVED_COLONIES]: false,
                    [gc.ACTIVITY_FLEXI_HARVESTERS]: false,
                    colonies: [

                    ]
            }};
            PolicyGovern.prototype.partsSuppliedLT = function() { return 500 };
            PolicyGovern.prototype.checkPaybackByNextUpgrade = function() { return true };
            PolicyGovern.prototype.removeColony = function() { };
            const policyGovern = new PolicyGovern(1, data);
            policyGovern.m[gc.ACTIVITY_MINE_COLONIES] = true;

            //console.log("policyGovern", JSON.stringify(policyGovern));
            const result0 = policyGovern.requestAddColony(flagRooms[0]);
            assert(!result0.added);
            //console.log("flagRooms[0]", result0);
            const flagRoomsInColonyListBefore = policyGovern.m.colonies.filter( c => {
                return c.name === flagRooms[1].name
                    || c.name === flagRooms[2].name
                    || c.name === flagRooms[3].name
            });
            assert.strictEqual(flagRoomsInColonyListBefore.length, 0);
            //console.log(flagRoomsInColonyListBefore.length, "m.colonies",flagRoomsInColonyListBefore);
            const result1 = policyGovern.requestAddColony(flagRooms[1]);
            //console.log(JSON.stringify(result1));
            assert(result1.added);
            //console.log("flagRooms[1]", result2);
            const result2 = policyGovern.requestAddColony(flagRooms[2]);
            assert(result2.added);
            const flagRoomsInColonyListAfter1 = policyGovern.m.colonies.filter( c => {
                return c.name === flagRooms[1].name
                    || c.name === flagRooms[2].name
                    || c.name === flagRooms[3].name
            });
            assert.strictEqual(flagRoomsInColonyListAfter1.length, 2);
            //console.log("flagRooms[2]", result3);
            const result3 = policyGovern.requestAddColony(flagRooms[3]);
            assert(result3.added);
            const flagRoomsInColonyListAfter2 = policyGovern.m.colonies.filter( c => {
                return c.name === flagRooms[1].name
                    || c.name === flagRooms[2].name
                    || c.name === flagRooms[3].name
            });
            assert.strictEqual(flagRoomsInColonyListAfter2.length, 1)

            //console.log("flagRooms[3]", result4);
            //console.log(flagRoomsInColonyListAfter.length,"m.colonies",flagRoomsInColonyListAfter);


        });
    });
});