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

var num_components = "1";
var num_iterations = "5";
var branch = Augur.branches.dev;
var period = Augur.getVotePeriod(branch);
var num_events = Augur.getNumberEvents(branch, period);
var num_reports = Augur.getNumberReporters(branch);
var flatsize = num_events * num_reports;
var reputation_vector = [
    Augur.getRepBalance(branch, Augur.coinbase),
    Augur.getRepBalance(branch, constants.chain10101.accounts.tinybike_new)
];
var ballot = new Array(num_events);
var reports = new Array(flatsize);
for (var i = 0; i < num_reports; ++i) {
    ballot = Augur.getReporterBallot(branch, period, Augur.getReporterID(branch, i));
    if (ballot[0] != 0) {
        for (var j = 0; j < num_events; ++j) {
            reports[i*num_events + j] = ballot[j];
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

function fold(arr, num_cols) {
    var folded = [];
    num_cols = parseInt(num_cols);
    var num_rows = arr.length / num_cols;
    if (num_rows !== parseInt(num_rows)) {
        throw("array length (" + arr.length + ") not divisible by " + num_cols);
    }
    num_rows = parseInt(num_rows);
    var row;
    for (var i = 0; i < parseInt(num_rows); ++i) {
        row = [];
        for (var j = 0; j < num_cols; ++j) {
            row.push(arr[i*num_cols + j]);
        }
        folded.push(row);
    }
    return folded;
}

describe("testing consensus/score", function () {

    it("redeem_blank", function (done) {
        this.timeout(TIMEOUT);
        Augur.redeem_blank(
            branch,
            period,
            num_events,
            num_reports,
            flatsize,
            function (r) {
                // sent
            },
            function (r) {
                // success
                assert.equal(r.callReturn, "0x01")
                done();
            },
            function (r) {
                // failed
                throw("redeem_blank failed: " + r);
                done();
            }
        );
    });

    it("blank", function (done) {
        this.timeout(TIMEOUT);
        Augur.blank(
            num_components,
            num_iterations,
            num_events,
            function (r) {
                // sent
            },
            function (r) {
                // success
                assert.equal(r.callReturn[0], "18446744073709551616");
                assert.equal(r.callReturn[1], "0");
                assert.equal(r.callReturn[r.callReturn.length-1], num_components);
                assert.equal(r.callReturn[r.callReturn.length-2], num_iterations);
                done();
            },
            function (r) {
                // failed
                throw("blank failed: " + r);
                done();
            }
        );
    });

    it("loadings", function (done) {
        this.timeout(TIMEOUT*4);
        Augur.blank(
            num_components,
            num_iterations,
            num_events,
            function (r) {
                // sent
            },
            function (r) {
                // success
                Augur.loadings(
                    Augur.unfix(r.callReturn.slice(0, num_events+2), "string"),
                    Augur.getWeightedCenteredData(branch, period).slice(0, flatsize),
                    reputation_vector,
                    num_reports,
                    num_events,
                    function (r) {
                        // sent
                    },
                    function (r) {
                        // success
                        // log("loadings:");
                        // log(Augur.unfix(r.callReturn.slice(0, r.callReturn.length-2), "string"));
                        assert.equal(r.callReturn[r.callReturn.length-2], num_iterations);
                        assert.equal(r.callReturn[r.callReturn.length-1], num_components);
                        done();
                    },
                    function (r) {
                        // failed
                        throw("loadings failed: " + r);
                        done();
                    }
                );
            },
            function (r) {
                // failed
                throw("loadings (blank) failed: " + r);
                done();
            }
        );
    });
});
