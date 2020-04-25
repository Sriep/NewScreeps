/**
 * @fileOverview screeps
 * Created by piers on 25/04/2020
 * @author Piers Shepperson
 */
const gc = require("gc");

function Policy  (data) {
    console.log("new policy peace", JSON.stringify(data))
    this.type = gc.POLICY_PEACE;
    if (data) {
        this.id = data.id;
        this.roomId = data.roomId;
    }
}

Policy.prototype.enact = function () {
    console.log("enacting policy peace");
}

module.exports = Policy;