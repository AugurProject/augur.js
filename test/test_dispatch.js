/**
 * augur.js unit tests
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var assert = require("assert");
var _ = require("lodash");
var Augur = require("../augur");
var constants = require("./constants");
require('it-each')({ testPerIteration: true });

Augur.connect();

var log = console.log;
var TIMEOUT = 120000;
var num_components = 2;
var num_iterations = 5;
var dispatches = 9 + num_components*(4 + num_iterations);
var branch = Augur.branches.dev;
var period = Augur.getVotePeriod(branch);

describe("testing consensus/dispatch", function () {
    it.each(_.range(0, dispatches), "dispatch %s", ['element'], function (element, next) {
        this.timeout(TIMEOUT);
        Augur.dispatch({
            branchId: branch,
            onSent: function (r) {
                // log("dispatch", r.step);
            },
            onSuccess: function (r) {
                // log("dispatch", r);
                log("    - step:   ", Augur.getStep(branch));
                log("    - substep:", Augur.getSubstep(branch));
                next();
            },
            onFailed: function (r) {
                throw("dispatch failed: " + r);
                next();
            }
        });
    });
});
