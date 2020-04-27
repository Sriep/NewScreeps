/**
 * @fileOverview screeps
 * Created by piers on 25/04/2020
 * @author Piers Shepperson
 */

const gc = require("gc");

function Role (data) {
    console.log("new role worker", JSON.stringify(data))
    this.type = gc.ROLE_WORKER;
    if (data) {
        this.id = data.id;
        this.poloicyId = data.poloicyId;
    }
}

Role.prototype.enact = function () {
    console.log("enact role worker")
}

module.exports = Role;