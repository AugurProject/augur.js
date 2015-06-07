/**
 * augur.js unit tests
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var BigNumber = require("bignumber.js");
var assert = require("assert");
var Augur = require("../augur");
var _ = require("lodash");
var constants = require("./constants");

require('it-each')({ testPerIteration: true });

Augur.connect();

var log = console.log;
var TIMEOUT = 120000;

var branch = Augur.branches.dev;
var salt = "1010101";

describe("Consensus", function () {

    var period = "274";
    var num_events = Augur.getNumberEvents(branch, period);
    var num_reports = Augur.getNumberReporters(branch);
    var step = Augur.getStep(branch);
    var substep = Augur.getSubstep(branch);
    var num_events = Augur.getNumberEvents(branch, period);
    var num_reports = Augur.getNumberReporters(branch);
    var flatsize = num_events * num_reports;
    var ballot = new Array(num_events);

    it("set reporter ballots", function (done) {

        this.timeout(TIMEOUT);

        for (var i = 0; i < num_events; ++i) {
            ballot[i] = Math.random();
            if (ballot[i] > 0.6) {
                ballot[i] = 2.0;
            } else if (ballot[i] >= 0.4) {
                ballot[i] = 1.5;
            } else {
                ballot[i] = 1.0;
            }
        }
        var reputation = Augur.getRepBalance(branch, Augur.coinbase);
        assert.equal(Augur.getReporterID(branch, 0), Augur.coinbase);
        Augur.setReporterBallot(
            branch,
            period,
            Augur.coinbase,
            ballot,
            reputation
        );
      
        var ballot_new = new Array(num_events);
        for (var i = 0; i < num_events; ++i) {
            ballot_new[i] = Math.random();
            if (ballot_new[i] > 0.6) {
                ballot_new[i] = 2.0;
            } else if (ballot_new[i] >= 0.4) {
                ballot_new[i] = 1.5;
            } else {
                ballot_new[i] = 1.0;
            }
        }
        var rep_new = Augur.getRepBalance(
            branch,
            constants.chain10101.accounts.tinybike_new
        );
        assert.equal(
            Augur.getReporterID(branch, 1),
            constants.chain10101.accounts.tinybike_new
        );
        Augur.setReporterBallot(
            branch,
            period,
            constants.chain10101.accounts.tinybike_new,
            ballot_new,
            rep_new
        );

        done();
    });
});
