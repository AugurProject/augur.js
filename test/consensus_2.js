/**
 * augur.js unit tests
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var assert = require("assert");
var Augur = require("../augur");

Augur.connect();

var branch = Augur.branches.dev;

describe("call cash and reputation faucets", function () {
    it("coinbase", function (done) {
        Augur.reputationFaucet(branch);
        Augur.cashFaucet();
        done();
    });
});
