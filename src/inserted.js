/**
 * @fileOverview screeps
 * Created by piers on 24/04/2020
 * @autohor Piers Shepperson
 */
// const economy = require("economy")
    const budget = require("budget");

const inserted = {
    top: function () {

        //if (Game.time === 30800) {

        //}
    },

    bottom: function () {
/*
        console.log("---------------------------------------------------------");
        let nsew = "W7NW".split(/[0123456789]/);
        let xy = "W7N7".split(/[NSEW]/);
        console.log("xy",JSON.stringify(xy), "nsew", JSON.stringify(nsew));
        const start = {x:xy[1]*1, y:xy[2]*1}
        console.log("start", JSON.stringify(start));

        const points1 = pointsDistanceFrom(start, 1);
        const points2 = pointsDistanceFrom(start, 2);

        console.log("points1", JSON.stringify(points1))
        console.log("---")
        console.log("points2", JSON.stringify(points2))
*/
    }
}

pointsDistanceFrom = function (start, distance) {
    const points = [];
    if (distance <1)
        return points;
    console.log("start", JSON.stringify(start), "distance", distance)
    for ( let dx = 0 ; dx <= distance ; dx++ ) {
        const dy = distance - dx;
        points.push({x: start.x + dx, y: start.y + dy})
        points.push({x: start.x - dx, y: start.y - dy})
        if (dx !== 0 && dy !== 0) {
            points.push({x: start.x + dx, y: start.y - dy})
        }
        if (dx !== 0 && dy !== 0) {
            points.push({x: start.x - dx, y: start.y + dy})
        }
    }
    return points;
}

module.exports = inserted;















