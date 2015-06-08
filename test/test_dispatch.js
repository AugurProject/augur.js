/**
 * augur.js unit tests
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var assert = require("assert");
var Augur = require("../augur");
var constants = require("./constants");
require('it-each')({ testPerIteration: true });

Augur.connect();

var log = console.log;
var TIMEOUT = 120000;
var branch = Augur.branches.dev;
var period = Augur.getVotePeriod(branch);
var num_events = Augur.getNumberEvents(branch, period);
var num_reports = Augur.getNumberReporters(branch);

describe("testing consensus/dispatch", function () {
    var label = "dispatch " + Augur.getStep(branch) + " (" + Augur.getSubstep(branch) + ")";
    it(label, function (done) {
        this.timeout(TIMEOUT);
        Augur.dispatch({
            branchId: branch,
            onSent: function (r) {
                log("dispatch sent:", r);
            },
            onSuccess: function (r) {
                log("dispatch success:", r);
                log("   step:   ", Augur.getStep(branch));
                log("   substep:", Augur.getSubstep(branch));
                done();
            },
            onFailed: function (r) {
                log("dispatch failed:", r);
                log("   step:   ", Augur.getStep(branch));
                log("   substep:", Augur.getSubstep(branch));
                done();
            }
        });
    });
});
