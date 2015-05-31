/**
 * augur.js unit tests
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var assert = require("assert");
var Augur = require("../augur");

Augur.connect();

var log = console.log;
var branch_id = Augur.branches.dev;

// createMarket.se
describe("createMarket", function () {
    it("should successfully create event and market", function (done) {
        this.timeout(120000);
        var branch_id = "0x00000000000000000000000000000000000000000000000000000000000f69b5";
        var event_description = "Will Jack win the June 2015 Augur Breakdancing Competition?";
        var expDate = 500080 + Math.round(Math.random() * 1000);
        var minValue = 0;
        var maxValue = 1;
        var numOutcomes = 2;
        var eventObj = {
            branchId: branch_id,
            description: event_description,
            expDate: expDate,
            minValue: minValue,
            maxValue: maxValue,
            numOutcomes: numOutcomes,
            onSent: function (r) {
                log("sent: " + JSON.stringify(r, null, 2));
            },
            onSuccess: function (r) {
                log("success: " + JSON.stringify(r, null, 2));
                assert.equal(r.branch, branch_id);
                assert.equal(r.expirationDate, expDate);
                assert.equal(r.minValue, minValue);
                assert.equal(r.maxValue, maxValue);
                assert.equal(r.numOutcomes, numOutcomes);
                assert.equal(r.description, event_description);
                var alpha = "0.0079";
                var initialLiquidity = 50;
                var tradingFee = "0.03";
                var branch_id = "0x00000000000000000000000000000000000000000000000000000000000f69b5";
                var events = ["0x8423f7095761ece001a86555a8ff3fece4a751a089e2c364dc21cc5b19b899e4"];
                var market_description = "Will Jack win the June 2015 Augur Breakdancing Competition?";
                var numOutcomes = 2;
                var marketObj = {
                    branchId: branch_id,
                    description: market_description,
                    alpha: alpha,
                    initialLiquidity: initialLiquidity,
                    tradingFee: tradingFee,
                    events: events,
                    onSent: function (r) {
                        log("sent: " + JSON.stringify(r, null, 2));
                    },
                    onSuccess: function (r) {
                        log("createMarket: \"" + market_description + "\"");
                        log("success: " + JSON.stringify(r, null, 2));
                        assert.equal(r.numOutcomes, numOutcomes);
                        assert.equal(parseFloat(r.alpha).toFixed(5), parseFloat(alpha).toFixed(5));
                        assert.equal(r.numOutcomes, numOutcomes);
                        assert.equal(parseFloat(r.tradingFee).toFixed(5), parseFloat(tradingFee).toFixed(5));
                        // assert.equal(r.description, market_description);
                        console.log("description: ", r.description);
                        done();
                    },
                    onFailed: function (r) {
                        log("createMarket: \"" + market_description + "\"");
                        log("failed: " + JSON.stringify(r, null, 2));
                        done();
                    }
                };
                Augur.createMarket(marketObj);
                done();
            },
            onFailed: function (r) {
                log("failed: " + JSON.stringify(r, null, 2));
                done();
            }
        };
        Augur.createEvent(eventObj);
    });
});
