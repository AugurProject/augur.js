/**
 * augur.js unit tests
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var assert = require("assert");
var fs = require('fs');
var Augur = require("../augur");

require('it-each')({ testPerIteration: true });

Augur.connect();

var log = console.log;
var branch = Augur.branches.dev;
var vote_period = Augur.getVotePeriod(branch);

describe("populating vote period and +50", function () {

    var events = fs.readFileSync('events.dat').toString().split("\n");

    it.each(events, "addEvent: %s", ['element'], function (element, next) {
        if (element !== "" && element !== "\n") {
            Augur.tx.addEvent.send = false;
            assert.equal(Augur.addEvent(branch, parseInt(vote_period), element), "0x01");
            Augur.tx.addEvent.send = true;
            Augur.addEvent(branch, parseInt(vote_period), element);
        }
        next();
    });
    
    it.each(events, "addEvent (future): %s", ['element'], function (element, next) {
        if (element !== "" && element !== "\n") {
            Augur.tx.addEvent.send = false;
            assert.equal(Augur.addEvent(branch, parseInt(vote_period) + 50, element), "0x01");
            Augur.tx.addEvent.send = true;
            Augur.addEvent(branch, parseInt(vote_period) + 50, element);
        }
        next();
    });

});
