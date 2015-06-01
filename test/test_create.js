/**
 * augur.js unit tests
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var assert = require("assert");
var Augur = require("../augur");

require('it-each')({ testPerIteration: true });

Augur.connect();

var log = console.log;
var descriptions = [
    "Will Jack win the June 2015 Augur Breakdancing Competition?",
    "Will the Augur software sale clear $1M?",
    "Will the Augur software sale clear $5M?",
    "Will the Augur software sale clear $100M?",
    "Will the Sun turn into a red giant and engulf the Earth by the end of 2015?",
    "Will the next American Idol winner be female?",
    "Is InfoSec Taylor Swift really Taylor Swift?",
    "Will Jeremy grow at least an inch taller before the end of June 2015?",
    "The Fed is pretty frickin sweet, amirite?",
    "Will Hillary Clinton win the 2016 U.S. Presidential Election?",
    "Will Rand Paul win the 2016 U.S. Presidential Election?"
];

// createMarket.se
describe("createMarket", function () {
    it.each(descriptions, "creating event/market: %s", ['element'], function (element, next) {
        this.timeout(240000);
        var event_description = element;
        var expDate = Augur.blockNumber() + Math.round(Math.random() * 1000);
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
                // assert.equal(r.branch, Augur.branches.dev);
                // assert.equal(r.expirationDate, expDate);
                // assert.equal(r.minValue, minValue);
                // assert.equal(r.maxValue, maxValue);
                // assert.equal(r.numOutcomes, numOutcomes);
                // assert.equal(r.description, event_description);
                var alpha = "0.0079";
                var initialLiquidity = 50;
                var tradingFee = "0.03";
                var events = [ r.id ];
                var market_description = element;
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
                        // assert.equal(res.numOutcomes, numOutcomes);
                        // assert.equal(parseFloat(res.alpha).toFixed(5), parseFloat(alpha).toFixed(5));
                        // assert.equal(res.numOutcomes, numOutcomes);
                        // assert.equal(parseFloat(res.tradingFee).toFixed(5), parseFloat(tradingFee).toFixed(5));
                        // assert.equal(res.description, market_description);
                        // log("description: ", res.description);
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
