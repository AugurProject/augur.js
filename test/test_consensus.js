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

var period = Augur.getVotePeriod(branch);
var num_events = Augur.getNumberEvents(branch, period);
var num_reports = Augur.getNumberReporters(branch);
var step = Augur.getStep(branch);
var substep = Augur.getSubstep(branch);
var num_events = Augur.getNumberEvents(branch, period);
var num_reports = Augur.getNumberReporters(branch);
var flatsize = num_events * num_reports;
var ballot = new Array(num_events);

var reputation = Augur.getRepBalance(branch, Augur.coinbase);
var rep_new = Augur.getRepBalance(branch, constants.chain10101.accounts.tinybike_new);
var reports = new Array(flatsize);
for (var i = 0; i < num_reports; ++i) {
    ballot = Augur.getReporterBallot(branch, period, Augur.getReporterID(branch, i));
    if (ballot[0] != 0) {
        for (var j = 0; j < num_events; ++j) {
            reports[i*num_events + j] = ballot[j];
        }
    }
}
log(reports);
var scaled = [];
var scaled_min = [];
var scaled_max = [];
for (var i = 0; i < num_events; ++i) {
    scaled.push(0);
    scaled_min.push(1);
    scaled_max.push(2);
}
// log(Augur.unfix(reports, "string"));
var reputation_vector = [reputation, rep_new];

describe("Test PCA consensus", function () {

    it("interpolate", function (done) {
        assert.equal(reports.length, flatsize);
        assert.equal(reputation_vector.length, 2);
        assert.equal(scaled.length, num_events);
        assert.equal(scaled_max.length, num_events);
        assert.equal(scaled_min.length, num_events);
        Augur.interpolate(
            reports,
            reputation_vector,
            scaled,
            scaled_max,
            scaled_min,
            function (r) {
                // sent
                log("interpolate sent:", r);
            },
            function (r) {
                // success
                log("interpolate success:", r);
                done();
            },
            function (r) {
                //failed
                log("interpolate failed:", r);
                done();
            }
        );
    });

    // it("redeem_interpolate", function (done) {
    //     this.timeout(TIMEOUT);

    //     Augur.setStep(branch, 0);
    //     Augur.setSubstep(branch, 0);

    //     Augur.tx.redeem_interpolate.send = false;
    //     // var retval = Augur.redeem_interpolate(branch, period, num_events, num_reports, flatsize);
    //     // assert.equal(retval, "0x01");
    //     Augur.redeem_interpolate(branch, period, num_events, num_reports, flatsize,
    //         function (r) {
    //             // sent
    //         },
    //         function (r) {
    //             // success
    //             var i, reports_filled, reports_mask, v_size;
    //             log("redeem_interpolate success:", r);
    //             reports_filled = Augur.getReportsFilled(branch, period);
    //             for (i = 0; i < num_events; ++i) {
    //                 assert.equal(reports_filled[i], Augur.fix(ballot[i], "string"));
    //             }
    //             reports_mask = Augur.getReportsMask(branch, period);
    //             for (i = 0; i < num_events; ++i) {
    //                 assert.equal(reports_mask[i], "0");
    //             }
    //             v_size = Augur.getVSize(branch, period);
    //             assert.equal(v_size, num_reports * num_events);
    //             done();
    //         },
    //         function (r) {
    //             // failed
    //             log("redeem_interpolate failed:", r);
    //             done();
    //         }
    //     );
    // });

    // var label = "dispatch " + Augur.getStep(branch) + " (" + Augur.getSubstep(branch) + ")";
    // it(label, function (done) {
    //     this.timeout(TIMEOUT);
    //     Augur.dispatch({
    //         branchId: branch,
    //         period: period,
    //         onSent: function (r) {
    //             log("sent:", r);
    //         },
    //         onSuccess: function (r) {
    //             log("success:", r);
    //             log("step:     ", Augur.getStep(branch));
    //             log("substep:  ", Augur.getSubstep(branch));
    //             done();
    //         },
    //         onFailed: function (r) {
    //             log("failed:", r);
    //             log("step:     ", Augur.getStep(branch));
    //             log("substep:  ", Augur.getSubstep(branch));
    //             done();
    //         }
    //     });
    // });
});
