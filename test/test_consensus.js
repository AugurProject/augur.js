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

var amount = "1";
var branch = Augur.branches.dev;
var branch_number = "1";
var participant_id = Augur.coinbase;
var participant_number = "1";
var outcome = Augur.NO.toString();
var reporter_index = "0";
var reporter_address = Augur.coinbase;
var salt = "1010101";

var period = "274";
var num_events = Augur.getNumberEvents(branch, period);
var num_reports = Augur.getNumberReporters(branch);
var step = Augur.getStep(branch);
var substep = Augur.getSubstep(branch);
var num_events = Augur.getNumberEvents(branch, period);
var num_reports = Augur.getNumberReporters(branch);
var flatsize = num_events * num_reports;
var ballot = new Array(num_events);

describe("Consensus", function () {

    it("dispatch 0", function (done) {

        this.timeout(TIMEOUT);

        Augur.setStep(branch, 0);
        Augur.setSubstep(branch, 0);

        var reputation = Augur.getRepBalance(branch, Augur.coinbase);
        var rep_new = Augur.getRepBalance(branch, constants.chain10101.accounts.tinybike_new);

        var reports = new Array(flatsize);
        for (var i = 0; i < num_reports; ++i) {
            var getballot = Augur.getReporterBallot(branch, period, Augur.getReporterID(branch, i));
            if (getballot[0] != 0) {
                for (var j = 0; j < num_events; ++j) {
                    reports[i*num_events + j] = getballot[j];
                }
            }
        }
        log(Augur.unfix(reports, "string"));

        Augur.tx.redeem_interpolate.send = false;
        var retval = Augur.redeem_interpolate(branch, period, num_events, num_reports, flatsize);
        assert.equal(retval, "0x01");

        var reports_filled = Augur.getReportsFilled(branch, period);
        for (var i = 0; i < num_events; ++i) {
            // assert.equal(reports_filled[i], Augur.fix(ballot[i], "string"));
        }
        var reports_mask = Augur.getReportsMask(branch, period);
        for (var i = 0; i < num_events; ++i) {
            // assert.equal(reports_mask[i], "0");
        }
        var v_size = Augur.getVSize(branch, period);
        // assert.equal(v_size, num_reports * num_events);

        Augur.tx.dispatch.send = false;
        var d = Augur.dispatch(branch, period);
        log("dispatch: ", d);

        Augur.tx.dispatch.send = true;
        log(Augur.dispatch(branch, period));
        log("step:     ", Augur.getStep(branch));
        log("substep:  ", Augur.getSubstep(branch));

        done();
    });
    it("dispatch 1", function (done) {

        this.timeout(TIMEOUT);

        var reputation = Augur.getRepBalance(branch, Augur.coinbase);
        var rep_new = Augur.getRepBalance(branch, constants.chain10101.accounts.tinybike_new);

        var reports = new Array(flatsize);
        for (var i = 0; i < num_reports; ++i) {
            var getballot = Augur.getReporterBallot(branch, period, Augur.getReporterID(branch, i));
            if (getballot[0] != 0) {
                for (var j = 0; j < num_events; ++j) {
                    reports[i*num_events + j] = getballot[j];
                }
            }
        }

        var rb = Augur.redeem_blank(branch, period, num_events, num_reports, flatsize);
        assert.equal(rb, "0x01");

        var iv = Augur.blank(1, 5, num_events);
        assert.equal(iv[0], "18446744073709551616");
        assert.equal(iv[1], "0");
        assert.equal(iv[iv.length-1], "1");
        assert.equal(iv[iv.length-2], "5");

        Augur.tx.redeem_center.returns = "number[]";
        var rc = Augur.redeem_center(branch, period, num_events, num_reports, flatsize);
        // log(rc);

        var scaled = [];
        var scaled_min = [];
        var scaled_max = [];
        for (var i = 0; i < num_events; ++i) {
            scaled.push(0);
            scaled_min.push(1);
            scaled_max.push(2);
        }
        Augur.tx.center.returns = "number[]";
        var c = Augur.center(reports, [reputation, rep_new], scaled, scaled_min, scaled_max, 5, 1);
        log(c);

        Augur.tx.dispatch.send = false;
        var d = Augur.dispatch(branch, period);
        log("dispatch: ", d);

        Augur.tx.dispatch.send = true;
        log(Augur.dispatch(branch, period));
        log("step:     ", Augur.getStep(branch));
        log("substep:  ", Augur.getSubstep(branch));

        done();
    });
    it("dispatch 2", function (done) {
        
        this.timeout(TIMEOUT);

        var reputation = Augur.getRepBalance(branch, Augur.coinbase);
        var rep_new = Augur.getRepBalance(branch, constants.chain10101.accounts.tinybike_new);
        var reports = new Array(flatsize);
        for (var i = 0; i < num_reports; ++i) {
            var getballot = Augur.getReporterBallot(branch, period, Augur.getReporterID(branch, i));
            if (getballot[0] != 0) {
                for (var j = 0; j < num_events; ++j) {
                    reports[i*num_events + j] = getballot[j];
                }
            }
        }
        var scaled = [];
        var scaled_min = [];
        var scaled_max = [];
        for (var i = 0; i < num_events; ++i) {
            scaled.push(0);
            scaled_min.push(1);
            scaled_max.push(2);
        }
        // Augur.tx.center.returns = "hash[]";
        // var wcd = Augur.center(reports, [reputation, rep_new], scaled, scaled_min, scaled_max, 5, 1);
        // log(wcd.slice(0,18));
        // wcd = wcd.slice(0,18);
        // Augur.tx.setDeflated.send = false;
        // var defl = Augur.setDeflated(branch, period, wcd);
        // log(defl);
        // Augur.tx.setDeflated.send = true;
        // var defl = Augur.setDeflated(branch, period, wcd);

        // var rcov = Augur.redeem_covariance(branch, period, num_events, num_reports, flatsize);
        // log(rcov);

        var smooth_rep = [reputation, rep_new];
        var res = Augur.resolve(smooth_rep, reports, scaled, scaled_max, scaled_min, num_reports, num_events);
        // log("resolve: ", res);

        var red_res = Augur.redeem_resolve(branch, period, num_events, num_reports, flatsize);
        assert.equal(parseInt(red_res), 1);
        // log("redeem_resolve: ", red_res);

        // var lv = Augur.getLoadingVector(branch, period);
        // log(lv);

        done();
    });
    it("dispatch call/sendTx", function (done) {
        
        Augur.tx.dispatch.send = false;
        var d = Augur.dispatch(branch, period);
        log("dispatch: ", d);

        Augur.tx.dispatch.send = true;
        log(Augur.dispatch(branch, period));
        log("step:     ", Augur.getStep(branch));
        log("substep:  ", Augur.getSubstep(branch));

        done();
    });
});
