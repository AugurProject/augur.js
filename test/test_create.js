/**
 * augur.js unit tests
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var _ = require("lodash");
var assert = require("assert");
var Augur = require("../augur");

require('it-each')({ testPerIteration: true });

Augur.connect();

var log = console.log;
var new_markets = 1;

// createMarket.se
describe("createMarket", function () {
    it.each(_.range(0, new_markets), "creating event/market [%s]", ['element'], function (element, next) {
        this.timeout(240000);
        var event_description = "Will Jack win the June 2015 Augur Breakdancing Competition?";
        var expDate = 500080 + Math.round(Math.random() * 1000);
        var minValue = 0;
        var maxValue = 1;
        var numOutcomes = 2;
        var eventObj = {
            branchId: Augur.branches.dev,
            description: event_description,
            expDate: expDate,
            minValue: minValue,
            maxValue: maxValue,
            numOutcomes: numOutcomes,
            onSent: function (r) {
                log("createEvent sent: " + JSON.stringify(r, null, 2));
            },
            onSuccess: function (r) {
                log("createEvent success: " + JSON.stringify(r, null, 2));
                assert.equal(r.branch, Augur.branches.dev);
                assert.equal(r.expirationDate, expDate);
                assert.equal(r.minValue, minValue);
                assert.equal(r.maxValue, maxValue);
                assert.equal(r.numOutcomes, numOutcomes);
                assert.equal(r.description, event_description);
                var alpha = "0.0079";
                var initialLiquidity = 50;
                var tradingFee = "0.03";
                var events = [ r.id ];
                var market_description = "Will Jack win the June 2015 Augur Breakdancing Competition?";
                var numOutcomes = 2;
                var marketObj = {
                    branchId: Augur.branches.dev,
                    description: market_description,
                    alpha: alpha,
                    initialLiquidity: initialLiquidity,
                    tradingFee: tradingFee,
                    events: events,
                    onSent: function (res) {
                        log("createMarket sent: " + JSON.stringify(res, null, 2));
                    },
                    onSuccess: function (res) {
                        log("createMarket success: " + JSON.stringify(res, null, 2));
                        assert.equal(res.numOutcomes, numOutcomes);
                        assert.equal(parseFloat(res.alpha).toFixed(5), parseFloat(alpha).toFixed(5));
                        assert.equal(res.numOutcomes, numOutcomes);
                        assert.equal(parseFloat(res.tradingFee).toFixed(5), parseFloat(tradingFee).toFixed(5));
                        // assert.equal(res.description, market_description);
                        log("description: ", res.description);
                        next();
                    },
                    onFailed: function (res) {
                        log("createMarket failed: " + JSON.stringify(res, null, 2));
                        next();
                    }
                };
                Augur.createMarket(marketObj);
            },
            onFailed: function (r) {
                log("createEvent failed: " + JSON.stringify(r, null, 2));
                next();
            }
        };
        Augur.createEvent(eventObj);
    });
});
