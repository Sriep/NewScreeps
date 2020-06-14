/**
 * @fileOverview screeps
 * Created by piers on 05/05/2020
 * @author Piers Shepperson
 */
const gc = require("gc");
const FlagOwnedRoom = require("flag_owned_room");
const PolicyBase = require("policy_base");

class PolicyBuildStructure extends PolicyBase {
    constructor (id, data) {
        super(id, data);
        this.type = gc.POLICY_BUILD_STRUCTURE;
        this.structureType = data.structureType;
    }
    initilise() {
        super.initilise();
        this.m.built = false;
        return true
    };

    enact() {
        //console.log("POLICY_BUILD_STRUCTURE this",JSON.stringify(this));
        const fRoom = new FlagOwnedRoom(this.home);
        //console.log("fRoom spawn", JSON.stringify(fRoom["spawn"]));
        this.m.built = !fRoom.buildStructure(this.structureType)
    };

    draftReplacement() {
        return this.m.built ? false : this;
    };
}

module.exports = PolicyBuildStructure;













