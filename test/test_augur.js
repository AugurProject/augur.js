/**
 * augur.js unit tests
 * @author Jack Peterson (jack@tinybike.net)
 */
// var nock = require('nock');
// nock.recorder.rec();

"use strict";

var BigNumber = require("bignumber.js");
var assert = require("assert");
var Augur = require("../augur");
var constants = require("./constants");

Augur.connect();

var log = console.log;

function array_equal(a, b) {
    if (a === b) return true;
    if (a === null || b === null) return false;
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}
function gteq0(n) { return (parseFloat(n) >= 0); }
function is_array(r) {
    assert(r.constructor === Array);
    assert(r.length > 0);
}
function is_object(r) {
    assert(r.constructor === Object);
}
function is_empty(o) {
    for (var i in o) {
        if (o.hasOwnProperty(i)) return false;
    }
    return true;
}
function on_root_branch(r) {
    assert(r.branch === Augur.branches.dev);
}
function is_not_zero(r) {
    assert(r.id !== "0" && r.id !== "0x" && r.id !== "0x0" && parseInt(r) !== 0);
}

describe("Augur API", function () {

    var amount = "1";
    var branch_id = Augur.branches.dev;
    var branch_number = "1";
    var participant_id = constants.accounts.jack;
    var participant_number = "1";
    var outcome = Augur.NO.toString();
    var event_id = "0xfe56aaf4c27c86989616147f4219097b1b9ae015d05e1761a82d402c664ef89d";
    var event_info_1 = {
        branch: '0x00000000000000000000000000000000000000000000000000000000000f69b5',
        expirationDate: '492149',
        outcome: '0',
        minValue: '0',
        maxValue: '1',
        numOutcomes: '2',
        description: 'future'
    };
    var market_id = "0x70f56a29596a7455b35a4666ddd572c564a4cbad14af32cd68b8774cecc0083a";
    var market_creator_1 = "0x63524e3fe4791aefce1e932bbfb3fdf375bfad89";
    var market_info_1 = {
        currentParticipant: '0',
        alpha: '0.00790000000000000001',
        cumulativeScale: '1',
        numOutcomes: '2',
        tradingPeriod: '24607',
        tradingFee: '0.01999999999999999998',
        description: 'future'
    };
    var market_id2 = "0x027f0086d94c77658eea3b954809c35c95bd8b8ff1a1cdb0df7a055c2a2ea823";
    var market_creator_2 = "0x63524e3fe4791aefce1e932bbfb3fdf375bfad89";
    var market_info_2 = {
        currentParticipant: '0',
        alpha: '0.00790000000000000001',
        cumulativeScale: '1',
        numOutcomes: '2',
        tradingPeriod: '24584',
        tradingFee: '0.01999999999999999998',
        description: 'is it lel time?'
    };
    var event_description = "[augur.js] " + Math.random().toString(36).substring(4);
    var market_description = "[augur.js] " + Math.random().toString(36).substring(4);
    var reporter_index = "0";
    var reporter_address = constants.accounts.jack;
    var ballot = [Augur.YES, Augur.YES, Augur.NO, Augur.YES];
    var salt = "1337";
    var receiving_account = constants.accounts.joey;
    var vote_period = 1;

    // cash.se
    describe("cash.se", function () {
        describe("cashFaucet() [call] -> '1'", function () {
            Augur.tx.cashFaucet.send = false;
            Augur.tx.cashFaucet.returns = "number";
            var res = Augur.cashFaucet();
            it("sync", function () {
                assert.equal(res, "1");
            });
            it("async", function (done) {
                Augur.cashFaucet(function (r) {
                    assert.equal(r, "1");
                    done();
                });
            });
        });
        describe("cashFaucet() [sendTx] != 0", function () {
            it("async", function (done) {
                Augur.tx.cashFaucet.send = true;
                Augur.tx.cashFaucet.returns = undefined;
                Augur.cashFaucet(function (txhash) {
                    assert(txhash.constructor === String);
                    assert(txhash.length > 2);
                    assert(txhash.length === 66);
                    assert.ok(parseInt(txhash));
                    assert.ok(Augur.bignum(txhash));
                });
                done();
            });
        });
    });

    // info.se
    describe("info.se", function () {
        describe("getCreator(" + event_id + ") [event]", function () {
            it("sync", function () {
                var res = Augur.getCreator(event_id);
                assert.equal(res, constants.accounts.jack);
            });
            it("async", function (done) {
                Augur.getCreator(event_id, function (r) {
                    assert.equal(r, constants.accounts.jack);
                    done();
                });
            });
        });
        describe("getCreator(" + market_id + ") [market]", function () {
            it("sync", function () {
                var res = Augur.getCreator(market_id);
                assert.equal(res, constants.accounts.jack);
            });
            it("async", function (done) {
                Augur.getCreator(market_id, function (r) {
                    assert.equal(r, constants.accounts.jack);
                    done();
                });
            });
        });
        describe("getCreationFee(" + event_id + ") [event]", function () {
            it("sync", function () {
                var res = Augur.getCreationFee(event_id);
                assert.equal(res, "0.00000000000000000244");
            });
            it("async", function (done) {
                Augur.getCreationFee(event_id, function (r) {
                    assert.equal(r, "0.00000000000000000244");
                    done();
                });
            });
        });
        describe("getCreationFee(" + market_id + ") [market]", function () {
            it("sync", function () {
                var res = Augur.getCreationFee(market_id);
                assert.equal(res, "100");
            });
            it("async", function (done) {
                Augur.getCreationFee(market_id, function (r) {
                    assert.equal(r, "100");
                    done();
                });
            });
        });
        describe("getDescription(" + event_id + ")", function () {
            it("sync", function () {
                var res = Augur.getDescription(event_id);
                assert.equal(res, event_info_1.description);
            });
            it("async", function (done) {
                Augur.getDescription(event_id, function (r) {
                    assert.equal(r, event_info_1.description);
                    done();
                });
            });
        });
    });

    // branches.se
    describe("branches.se", function () {
        describe("getBranches: array length >= 3", function () {
            var test = function (r) {
                is_array(r);
                assert(r.length >= 3);
            };
            it("sync", function () {
                test(Augur.getBranches());
            });
            it("async", function (done) {
                Augur.getBranches(function (r) {
                    test(r); done();
                });
            });
        });
        describe("getMarkets(" + branch_id + ")", function () {
            var test = function (r) {
                is_array(r);
                assert(r.length > 2);
                assert.equal(r[0], "0xd8fb9d0b319667d10be2c26a5a8fb431fef22f3510697b81dda9801cf5494cf3");
                assert.equal(r[1], "0xcc1003282a0f980c362d9e9e3a5a14cc4c04ee0ecced124755e1a6611e3d07d8");
            };
            it("sync", function () {
                test(Augur.getMarkets(branch_id));
            });
            it("async", function (done) {
                Augur.getMarkets(branch_id, function (r) {
                    test(r); done();
                });
            });
        });
        describe("getPeriodLength(" + branch_id + ") == '300'", function () {
            var test = function (r) {
                assert.equal(r, "300");
            };
            it("sync", function () {
                test(Augur.getPeriodLength(branch_id));
            });
            it("async", function (done) {
                Augur.getPeriodLength(branch_id, function (r) {
                    test(r); done();
                });
            });
        });
        describe("getVotePeriod(" + branch_id + ") >= 1096", function () {
            var test = function (r) {
                assert(parseInt(r) >= 1096);
            };
            it("sync", function () {
                test(Augur.getVotePeriod(branch_id));
            });
            it("async", function (done) {
                Augur.getVotePeriod(branch_id, function (r) {
                    test(r); done();
                });
            });
        });
        describe("getStep(" + branch_id + ") <= 9", function () {
            var test = function (r) {
                assert(parseInt(r) >= 0 && parseInt(r) <= 9);
            };
            it("sync", function () {
                test(Augur.getStep(branch_id));
            });
            it("async", function (done) {
                Augur.getStep(branch_id, function (r) {
                    test(r); done();
                });
            });
        });
        describe("getNumMarkets(" + branch_id + ") >= 6", function () {
            var test = function (r) {
                assert(parseInt(r) >= 6);
            };
            it("sync", function () {
                test(Augur.getNumMarkets(branch_id));
            });
            it("async", function (done) {
                Augur.getNumMarkets(branch_id, function (r) {
                    test(r); done();
                });
            });
        });
        describe("getMinTradingFee(" + branch_id + ")", function () {
            var test = function (r) {
                assert(parseFloat(r) >= 0.0);
                assert(parseFloat(r) <= 1.0);
            };
            it("sync", function () {
                test(Augur.getMinTradingFee(branch_id));
            });
            it("async", function (done) {
                Augur.getMinTradingFee(branch_id, function (r) {
                    test(r); done();
                });
            });
        });
        describe("getNumBranches()", function () {
            var test = function (r) {
                assert(parseInt(r) >= 3);
            };
            it("sync", function () {
                test(Augur.getNumBranches());
            });
            it("async", function (done) {
                Augur.getNumBranches(function (r) {
                    test(r); done();
                });
            });
        });
        describe("getBranch(" + branch_number + ")", function () {
            var test = function (r) {
                assert.equal(r, "0x7f5026f174d59f6f01ff3735773b5e3adef0b9c98f8a8e84e0000f034cfbf35a");
            };
            it("sync", function () {
                test(Augur.getBranch(branch_number));
            });
            it("async", function (done) {
                Augur.getBranch(branch_number, function (r) {
                    test(r); done();
                });
            });
        });
    });

    // events.se
    describe("events.se", function () {
        describe("getEventInfo(" + event_id + ")", function () {
            var test = function (res) {
                on_root_branch(res);
                assert.equal(res.expirationDate, "30000000");
                assert.equal(res.description, "[augur.js] dbk7kieqjxxbt9");
            };
            it("sync", function () {
                test(Augur.getEventInfo(event_id));
            });
            it("async", function (done) {
                Augur.getEventInfo(event_id, function (r) {
                    test(r); done();
                });
            });
        });

        // TODO getEventBranch
        describe("getExpiration(" + event_id + ") == '30000000'", function () {
            var test = function (r) {
                assert.equal(r, "30000000");
            };
            it("sync", function () {
                test(Augur.getExpiration(event_id));
            });
            it("async", function (done) {
                Augur.getExpiration(event_id, function (r) {
                    test(r); done();
                });
            });
        });
        // TODO getOutcome
        describe("getMinValue(" + event_id + ") == '1'", function () {
            var test = function (r) {
                assert.equal(r, "1");
            };
            it("sync", function () {
                test(Augur.getMinValue(event_id));
            });
            it("async", function (done) {
                Augur.getMinValue(event_id, function (r) {
                    test(r); done();
                });
            });
        });
        describe("getMaxValue(" + event_id + ") == '2'", function () {
            var test = function (r) {
                assert.equal(r, "2");
            };
            it("sync", function () {
                test(Augur.getMaxValue(event_id));
            });
            it("async", function (done) {
                Augur.getMaxValue(event_id, function (r) {
                    test(r); done();
                });
            });
        });
        describe("getNumOutcomes(" + event_id + ") == '2'", function () {
            var test = function (r) {
                assert.equal(r, "2");
            };
            it("sync", function () {
                test(Augur.getNumOutcomes(event_id));
            });
            it("async", function (done) {
                Augur.getNumOutcomes(event_id, function (r) {
                    test(r); done();
                });
            });
        });
    });

    // expiringEvents.se
    describe("expiringEvents.se", function () {
        describe("getEvents(" + branch_id + ", " + vote_period + ")", function () {
            var test = function (r) {
                log(r);
            };
            it("sync", function () {
                test(Augur.getEvents(branch_id, vote_period));
            });
            it("async", function (done) {
                Augur.getEvents(branch_id, vote_period, function (r) {
                    test(r); done();
                });
            });
        });
    });

    // markets.se
    describe("markets.se", function () {
        describe("getSimulatedBuy(" + market_id + ", " + outcome + ", " + amount + ")", function () {
            var test = function (r) {
                log(r);
            };
            it("sync", function () {
                test(Augur.getSimulatedBuy(market_id, outcome, amount));
            });
            it("async", function (done) {
                Augur.getSimulatedBuy(market_id, outcome, amount, function (r) {
                    test(r); done();
                });
            });
        });
        describe("getSimulatedSell(" + market_id + ", " + outcome + ", " + amount + ")", function () {
            var test = function (r) {
                log(r);
            };
            it("sync", function () {
                test(Augur.getSimulatedSell(market_id, outcome, amount));
            });
            it("async", function (done) {
                Augur.getSimulatedSell(market_id, outcome, amount, function (r) {
                    test(r); done();
                });
            });
        });
        describe("lsLmsr", function () {
            var test = function (r) {
                assert(Augur.bignum(r).toNumber() > 0);
            };
            it("sync", function () {
                test(Augur.lsLmsr(market_id));
            });
            it("async", function (done) {
                Augur.lsLmsr(market_id, function (r) {
                    test(r); done();
                });
            });
        });
        describe("getMarketInfo", function () {
            var marketInfo = Augur.getMarketInfo(market_id);
            it("should have 2 outcomes", function () {
                assert.equal("2", marketInfo.numOutcomes);
            });
            it("should have description '" + market_info_1.description + "'", function () {
                assert.equal(market_info_1.description, marketInfo.description);
            });
        });
        describe("getMarketInfo(" + market_id + ")", function () {
            var test = function (r) {
                assert.equal(r.description, market_info_1.description);
            };
            it("sync", function () {
                test(Augur.getMarketInfo(market_id));
            });
            it("async", function (done) {
                Augur.getMarketInfo(market_id, function (r) {
                    test(r); done();
                });
            });
        });
        describe("getMarketInfo(" + market_id2 + ")", function () {
            var test = function (r) {
                assert.equal(r.description, market_info_2.description);
            };
            it("sync", function () {
                test(Augur.getMarketInfo(market_id2));
            });
            it("async", function (done) {
                Augur.getMarketInfo(market_id2, function (r) {
                    test(r); done();
                });
            });
        });
        describe("getMarketEvents(" + market_id + ")", function () {
            function test(r) {
                assert.equal(r.constructor, Array);
                assert(array_equal(r, [ event_id ]));
            }
            it("sync", function () {
                test(Augur.getMarketEvents(market_id));
            });
            it("async", function (done) {
                Augur.getMarketEvents(market_id, function (r) {
                    test(r); done();
                });
            });
        });
        describe("getNumEvents(" + market_id + ") === '1'", function () {
            var test = function (r) {
                assert.equal(r, "1");
            };
            it("sync", function () {
                test(Augur.getNumEvents(market_id));
            });
            it("async", function (done) {
                Augur.getNumEvents(market_id, function (r) {
                    test(r); done();
                });
            });
        });
        describe("getBranchID(" + market_id + ")", function () {
            var test = function (r) {
                assert.equal(r, "0x0f69b5");
            };
            it("sync", function () {
                test(Augur.getBranchID(market_id));
            });
            it("async", function (done) {
                Augur.getBranchID(market_id, function (r) {
                    test(r); done();
                });
            });
        });
        describe("getCurrentParticipantNumber(" + market_id + ") >= 0", function () {
            var test = function (r) {
                gteq0(r);
            };
            it("sync", function () {
                test(Augur.getCurrentParticipantNumber(market_id));
            });
            it("async", function (done) {
                Augur.getCurrentParticipantNumber(market_id, function (r) {
                    test(r); done();
                });
            });
        });
        describe("getMarketNumOutcomes(" + market_id + ") ", function () {
            var test = function (r) {
                assert.equal(r, "2");
            };
            it("sync", function () {
                test(Augur.getMarketNumOutcomes(market_id));
            });
            it("async", function (done) {
                Augur.getMarketNumOutcomes(market_id, function (r) {
                    test(r); done();
                });
            });
        });
        describe("getParticipantSharesPurchased(" + market_id + ", " + participant_number + "," + outcome + ") ", function () {
            var test = function (r) {
                gteq0(r);
            };
            it("sync", function () {
                test(Augur.getParticipantSharesPurchased(market_id, participant_number, outcome));
            });
            it("async", function (done) {
                Augur.getParticipantSharesPurchased(market_id, participant_number, outcome, function (r) {
                    test(r); done();
                });
            });
        });
        describe("getSharesPurchased(" + market_id + ", " + outcome + ") ", function () {
            var test = function (r) {
                gteq0(r);
            };
            it("sync", function () {
                test(Augur.getSharesPurchased(market_id, outcome));
            });
            it("async", function (done) {
                Augur.getSharesPurchased(market_id, outcome, function (r) {
                    test(r); done();
                });
            });
        });
        describe("getWinningOutcomes(" + market_id + ")", function () {
            var test = function (r) {
                log(r);
                is_array(r);
            };
            it("sync", function () {
                test(Augur.getWinningOutcomes(market_id));
            });
            it("async", function (done) {
                Augur.getWinningOutcomes(market_id, function (r) {
                    test(r); done();
                });
            });
        });
        describe("price(" + market_id + ", " + outcome + ") ", function () {
            var test = function (r) {
                assert(parseFloat(r) >= 0.0);
                assert(parseFloat(r) <= 1.0);
            };
            it("sync", function () {
                test(Augur.price(market_id, outcome));
            });
            it("async", function (done) {
                Augur.price(market_id, outcome, function (r) {
                    test(r); done();
                });
            });
        });
        describe("getParticipantNumber(" + market_id + ", " + constants.accounts.jack + ") ", function () {
            var test = function (r) {
                gteq0(r);
            };
            it("sync", function () {
                test(Augur.getParticipantNumber(market_id, constants.accounts.jack));
            });
            it("async", function (done) {
                Augur.getParticipantNumber(market_id, constants.accounts.jack, function (r) {
                    test(r); done();
                });
            });
        });
        describe("getParticipantID(" + market_id + ", " + participant_number + ") ", function () {
            var test = function (r) {
                log(r);
            };
            it("sync", function () {
                test(Augur.getParticipantID(market_id, participant_number));
            });
            it("async", function (done) {
                Augur.getParticipantID(market_id, participant_number, function (r) {
                    test(r); done();
                });
            });
        });
        describe("getAlpha(" + market_id + ") ", function () {
            var test = function (r) {
                assert.equal(parseFloat(r).toFixed(6), "0.007900");
            };
            it("sync", function () {
                test(Augur.getAlpha(market_id));
            });
            it("async", function (done) {
                Augur.getAlpha(market_id, function (r) {
                    test(r); done();
                });
            });
        });
        describe("getCumScale(" + market_id + ") ", function () {
            var test = function (r) {
                assert.equal(r, "0.00000000000000000005");
            };
            it("sync", function () {
                test(Augur.getCumScale(market_id));
            });
            it("async", function (done) {
                Augur.getCumScale(market_id, function (r) {
                    test(r); done();
                });
            });
        });
        describe("getTradingPeriod(" + market_id + ") ", function () {
            var test = function (r) {
                assert.equal(r, "24607");
            };
            it("sync", function () {
                test(Augur.getTradingPeriod(market_id));
            });
            it("async", function (done) {
                Augur.getTradingPeriod(market_id, function (r) {
                    test(r); done();
                });
            });
        });
        describe("getTradingFee(" + market_id + ") ", function () {
            var test = function (r) {
                assert.equal(r, "0.01999999999999999998");
            };
            it("sync", function () {
                test(Augur.getTradingFee(market_id));
            });
            it("async", function (done) {
                Augur.getTradingFee(market_id, function (r) {
                    test(r); done();
                });
            });
        });
    });

    // reporting.se
    describe("reporting.se", function () {
        describe("getRepBalance(" + branch_id + ") ", function () {
            var test = function (r) {
                gteq0(r);
            };
            it("sync", function () {
                test(Augur.getRepBalance(branch_id, Augur.coinbase));
            });
            it("async", function (done) {
                Augur.getRepBalance(branch_id, Augur.coinbase, function (r) {
                    test(r); done();
                });
            });
        });
        describe("getRepByIndex(" + branch_id + ", " + reporter_index + ") ", function () {
            var test = function (r) {
                gteq0(r);
            };
            it("sync", function () {
                test(Augur.getRepByIndex(branch_id, reporter_index));
            });
            it("async", function (done) {
                Augur.getRepByIndex(branch_id, reporter_index, function (r) {
                    test(r); done();
                });
            });
        });
        describe("getReporterID(" + branch_id + ", " + reporter_index + ") ", function () {
            var test = function (r) {
                assert.equal(r, "0xa369ca3e80c8e8e5fdc3e2fc7ee7764c519de70f");
            };
            it("sync", function () {
                test(Augur.getReporterID(branch_id, reporter_index));
            });
            it("async", function (done) {
                Augur.getReporterID(branch_id, reporter_index, function (r) {
                    test(r); done();
                });
            });
        });
        describe("getReputation(" + reporter_address + ")", function () {
            var test = function (r) {
                is_array(r);
                assert(r.length >= 1); // why equal to 5...?
                for (var i = 0, len = r.length; i < len; ++i) {
                    gteq0(r[i]);
                }
            };
            it("sync", function () {
                test(Augur.getReputation(reporter_address));
            });
            it("async", function (done) {
                Augur.getReputation(reporter_address, function (r) {
                    test(r); done();
                });
            });
        });
        describe("getNumberReporters(" + branch_id + ") ", function () {
            var test = function (r) {
                gteq0(r);
                assert(parseInt(r) >= 1);
            };
            it("sync", function () {
                test(Augur.getNumberReporters(branch_id));
            });
            it("async", function (done) {
                Augur.getNumberReporters(branch_id, function (r) {
                    test(r); done();
                });
            });
        });
        describe("repIDToIndex(" + branch_id + ", " + Augur.coinbase + ") ", function () {
            var test = function (r) {
                assert.equal(r, "1");
            };
            it("sync", function () {
                test(Augur.repIDToIndex(branch_id, Augur.coinbase));
            });
            it("async", function (done) {
                Augur.repIDToIndex(branch_id, Augur.coinbase, function (r) {
                    test(r); done();
                });
            });
        });
        describe("hashReport([ballot], " + salt + ") ", function () {
            var test = function (r) {
                // TODO double-check this
                assert.equal(r, "0xecb634e07550319ba80b77114114b7670d384edb4b4db01a67bfba058147a081");
            };
            it("sync", function () {
                test(Augur.hashReport(ballot, salt));
            });
            it("async", function (done) {
                Augur.hashReport(ballot, salt, function (r) {
                    test(r); done();
                });
            });
        });
        Augur.tx.reputationFaucet.send = false;
        Augur.tx.reputationFaucet.returns = "number";
        describe("reputationFaucet(" + branch_id + ") ", function () {
            var test = function (r) {
                assert.equal(r, "1");
            };
            it("sync", function () {
                test(Augur.reputationFaucet(branch_id));
            });
            it("async", function (done) {
                Augur.reputationFaucet(branch_id, function (r) {
                    test(r); done();
                });
            });
        });
    });

    // checkQuorum.se
    describe("checkQuorum.se", function () {
        describe("checkQuorum(" + branch_id + ")", function () {
            var test = function (r) {
                assert(parseInt(r) === 0 || parseInt(r) === 1);
            };
            it("sync", function () {
                test(Augur.checkQuorum(branch_id));
            });
            it("async", function (done) {
                Augur.checkQuorum(branch_id, function (r) {
                    test(r); done();
                });
            });
        });
    });

    // buy&sellShares.se
    describe("buy&sellShares.se", function () {
        describe("getNonce(" + market_id + ") ", function () {
            var test = function (r) {
                assert.equal(r, "0");
            };
            it("sync", function () {
                test(Augur.getNonce(market_id));
            });
            it("async", function (done) {
                Augur.getNonce(market_id, function (r) {
                    test(r); done();
                });
            });
        });
        describe("buyShares(" + branch_id + ", " + market_id + ", " + outcome + ", " + amount + ", null)", function () {
            it("async", function (done) {
                // this.timeout(30000);
                var amount = (Math.random() * 10).toString();
                Augur.buyShares({
                    branchId: branch_id,
                    marketId: market_id,
                    outcome: outcome,
                    amount: amount,
                    nonce: null,
                    onSent: function (r) {
                        log(r);
                    },
                    onSuccess: function (r) {
                        log(r); done();
                    },
                    onFailed: function (r) {
                        assert(r.error === "-1");
                        done();
                    }
                });
            });
        });
        describe("sellShares(" + branch_id + ", " + market_id + ", " + outcome + ", " + amount + ", null)", function () {
            it("async", function (done) {
                // this.timeout(30000);
                var amount = (Math.random() * 10).toString();
                Augur.sellShares({
                    branchId: branch_id,
                    marketId: market_id,
                    outcome: outcome,
                    amount: amount,
                    nonce: null,
                    onSent: function (r) {
                        log(r);
                    },
                    onSuccess: function (r) {
                        log(r); done();
                    },
                    onFailed: function (r) {
                        assert(r.error === "-1");
                        done();
                    }
                });
            });
        });
    });

    // createBranch.se

    // p2pWagers.se

    // sendReputation.se
    // call: returns rep amount sent
    describe("sendReputation.se", function () {
        describe("sendReputation(" + branch_id + ", " + receiving_account + ", " + amount + ") [call] ", function () {
            var test = function (r) {
                is_not_zero(r);
                assert.equal(r, amount);
            };
            it("sync", function () {
                Augur.tx.sendReputation.send = false;
                Augur.tx.sendReputation.returns = "unfix";
                test(Augur.sendReputation(branch_id, receiving_account, amount));
            });
            it("async", function (done) {
                Augur.tx.sendReputation.send = false;
                Augur.tx.sendReputation.returns = "unfix";
                Augur.sendReputation(branch_id, receiving_account, amount, function (r) {
                    test(r); done();
                });
            });
        });
    });

    // transferShares.se

    // createEvent.se
    describe("createEvent.se", function () {
        describe("createEvent: \"" + event_description + "\"", function () {
            it("complete call-send-confirm callback sequence", function (done) {
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
                        done();
                    },
                    onFailed: function (r) {
                        log("failed: " + JSON.stringify(r, null, 2));
                        done();
                    }
                };
                Augur.createEvent(eventObj);
                // done();
            });
        });
    });

    // closeMarket.se
    describe("closeMarket.se", function () {
        describe("closeMarket(" + branch_id + ", " + market_id + ") [call] ", function () {
            it("complete call-send-confirm callback sequence", function (done) {
                Augur.tx.closeMarket.send = false;
                Augur.tx.closeMarket.returns = "number";
                Augur.closeMarket(branch_id, market_id, function (r) {
                    log("closeMarket: " + r);
                    done();
                });
                Augur.tx.closeMarket.send = true;
                Augur.tx.closeMarket.returns = undefined;
            });
        });
    });

    // dispatch.se
    describe("dispatch.se", function () {
        describe("dispatch(" + branch_id + ")", function () {
            var test = function (r) {
                assert(r.error);
                assert(r.message);
                assert.equal(r.error, "-1");
            };
            it("complete call-send-confirm callback sequence", function (done) {
                this.timeout(120000);
                var dispatchObj = {
                    branchId: branch_id,
                    onSent: function (r) {
                        test(r);
                    },
                    onSuccess: function (r) {
                        test(r); done();
                    },
                    onFailed: function (r) {
                        test(r); done();
                    }
                };
                Augur.dispatch(dispatchObj);
            });
        });
    });
});
