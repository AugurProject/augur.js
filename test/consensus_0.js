/**
 * augur.js unit tests
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var BigNumber = require("bignumber.js");
var assert = require("assert");
var fs = require("fs");
var _ = require("lodash");
var Augur = require("../augur");
var constants = require("./constants");

require('it-each')({ testPerIteration: true });

Augur.connect();

var log = console.log;
var TIMEOUT = 120000;

var branch_id = Augur.branches.dev;
var minValue = 0;
var maxValue = 1;
var numOutcomes = 2;
var num_events = 10;

describe("creating events for consensus", function () {
    var events = [];
    it.each(_.range(0, num_events), "creating event %s", ['element'], function (element, next) {
        this.timeout(TIMEOUT);
        var event_description = Math.random().toString(36).substring(4);
        Augur.createEvent({
            branchId: branch_id,
            description: event_description,
            expDate: Augur.blockNumber() + 25,
            minValue: minValue,
            maxValue: maxValue,
            numOutcomes: numOutcomes,
            onSent: function (r) {

            },
            onSuccess: function (r) {
                fs.appendFile("events.dat", r.id + "\n");
                next();
            },
            onFailed: function (r) {
                log("failed: " + JSON.stringify(r, null, 2));
                next();
            }
        });
    });
});
