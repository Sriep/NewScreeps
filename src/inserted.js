/**
 * @fileOverview screeps
 * Created by piers on 24/04/2020
 * @autohor Piers Shepperson
 */
const economy = require("economy")

const inserted = {
    top: function () {
        room = Game.rooms["W7N7"]
        //console.log("room",JSON.stringify(room))
        //console.log("controller",JSON.stringify(room.controller));
        //hws = budget.harvesterWsRoom(room, room)
        //pcs = budget.portersCsRoom(room, room)
        //console.log("budget harvester Ws", hws, "porter Cs", pcs);

        //cPos = new RoomPosition(17, 10, 'W7N7');
        //sPos = new RoomPosition(16, 11, 'W7N7')
        //joins = gf.joinPointsBetween(cPos, sPos, false);
        //console.log("joins", JSON.stringify(joins));
        //let spots, pos;
        //pos = new RoomPosition(16, 11, 'W7N7');
        //spots = economy.findMostFreeNeighbours(
        //    room, pos, 1
        //)
        //console.log("find neighbours pos", JSON.stringify(pos), 1, "spots",JSON.stringify(spots) )
        pos = new RoomPosition(22, 13, 'W7N7');
        spots = economy.findMostFreeNeighbours(
            room, pos, 2
        )
        console.log("find neighbours pos", JSON.stringify(pos), 2, "spots",JSON.stringify(spots) )
        //pos = new RoomPosition(3, 6, 'W7N7');
        //spots = economy.findMostFreeNeighbours(
        //    room, pos, 1
        //)
        //console.log("find neighbours pos", JSON.stringify(pos), 1, "spots",JSON.stringify(spots) )

    },


    bottom: function () {

    }
}

module.exports = inserted;