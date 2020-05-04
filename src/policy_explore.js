/**
 * @fileOverview screeps
 * Created by piers on 03/05/2020
 * @author Piers Shepperson
 */

function Policy  (data) {
    this.type = gc.POLICY_PEACE;
    if (!data) {
        return gf.fatalError("create Policy peace with no data");
    }
    this.id = data.id;
    this.buildPolicyId = data.buildPolicyId;
    this.roomName = Memory.policies[this.buildPolicyId].roomId;
}

Policy.prototype.initilise = function () {
    let nsew = this.roomName.split(/[0123456789]/);
    let xy = this.roomName.split(/[NSEW]/);
    console.log("xy",JSON.stringify(xy), "nsew", JSON.stringify(nsew));
    start = {x:xy[0]}
    const points = []
    for (let i = 0 ; i < 2 ; i++) {
        points.concat(pointsDistanceFrom())
    }
    console.log("ponts", JSON.stringify(points))


    start  = "W0N0";
    start = "W0S0";
    start = "E0N0";
    start = "E0S0";

}

pointsDistanceFrom = function (start, distance) {
    const points = [];
    if (distance <1)
        return points;
    for ( let dx = 0 ; dx <= distance ; dx++ ) {
        const dy = distance - dx;
        points.push({x: start.x + dx, y: start.y + dy})
        points.push({x: start.x - dx, y: start.y - dy})
        if (dy !== 0) {
            points.push({x: start.x + dx, y: start.y - dy})
        }
        if (dx !== 0) {
            points.push({x: start.x - dx, y: start.y + dy})
        }
    }
    return points;
}

Policy.prototype.enact = function () {

}

module.exports = Policy;





































