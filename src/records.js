/**
 * @fileOverview screeps
 * Created by piers on 15/05/2020
 * @author Piers Shepperson
 */

const records = {
    RECORDING: false,
    POLICY_CREATE: true,
    POLICY_REMOVAL : true,
    AGENDA_ITEMS : true,
    NEW_COLONY : true,
    GAIN_RCL: true,
    COMPACT: false,

    M: {},

    startup: function () {
        this.RECORDING = true;
        this.M = {};
        this.M["started"] = Game.time;
        this.M.policies = {};
        this.M.policies.created = {};
        this.M.policies.removed = {};
        this.colonies = {};
        this.M.agenda = {};
        this.M.updates = {};
        Memory.Records = JSON.stringify(M);
    },

    newColony: function(room, colony) {
        if (!this.RECORDING || !this.NEW_COLONY) {
            return;
        }
        if (!this.M) {
            this.M = JSON.parse(Memory.Records);
        }
        if (!this.M.colonies[room]) {
            this.M.colonies[room] = {}
        }
        if (this.M.colonies[room][Game.time]){
            this.M.colonies[room][Game.time].push(colony)
        } else {
            this.M.colonies[room][Game.time] = [colony]
        }
    },

    agendaItem: function(room, rcl, item, start) {
        if (!this.RECORDING || !this.AGENDA_ITEMS) {
            return;
        }
        if (!this.M) {
            this.M = JSON.parse(Memory.Records);
        }
        if (!this.M.policies.agenda[room]) {
            this.M.policies.agenda[room] = {}
        }
        if (!this.M.policies.agenda[room][rcl]) {
            this.M.policies.agenda[room][rcl] = []
        }
        this.M.policies.agenda[room][rcl].push({
            "item" : item,
            "time": Game.time,
            "action" :  start ? "started" : "checked",
        })

    },

    createdPolicy: function(policy) {
        if (!this.RECORDING || !this.POLICY_CREATE) {
            return;
        }
        if (!this.M) {
            this.M = JSON.parse(Memory.Records);
        }
        this.M.policies.created[Game.time] = policy;
    },

    removedPolicy: function(policy) {
        if (!this.RECORDING || !this.POLICY_REMOVAL) {
            return;
        }
        if (!this.M) {
            this.M = JSON.parse(Memory.Records);
        }
        this.M.policies.removed[Game.time] = policy;
    },

    saveRecords: function () {
        Memory.Records = JSON.stringify(this.M)
    }
};

module.exports = records;