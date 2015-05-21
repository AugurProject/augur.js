#!/usr/bin/env node
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

    var ex_integer = 12345678901;
    var ex_decimal = 0.123456789;
    var ex_integer_hex = "0x2dfdc1c35";
    var ex_integer_string = "12345678901";
    var ex_decimal_string = "0.123456789";

    describe("bignum", function () {
        it("should be the same if called with a float or a string", function () {
            assert(Augur.bignum(ex_decimal).eq(Augur.bignum(ex_decimal_string)));
        });
        it("should create 0 successfully", function () {
            assert(Augur.bignum(0).eq(new BigNumber(0)));
        });
    });
    describe("fix", function () {
        it("should be equal to round(n*2^64)", function () {
            assert(Augur.fix(ex_decimal, "BigNumber").eq((new BigNumber(ex_decimal)).mul(Augur.ONE).round()));
        });
        it("should return a base 10 string '2277375790844960561'", function () {
            assert(Augur.fix(ex_decimal, "string") === "2277375790844960561");
        });
        it("should return a base 16 string '0x1f9add3739635f31'", function () {
            assert(Augur.fix(ex_decimal_string, "hex") === "0x1f9add3739635f31");
        });
    });
    describe("unfix", function () {
        it("fixed-point -> hex", function () {
            assert.equal(Augur.unfix(Augur.fix(ex_integer_hex, "BigNumber"), "hex"), ex_integer_hex);
        });
        it("fixed-point -> string", function () {
            assert.equal(Augur.unfix(Augur.fix(ex_integer_string, "BigNumber"), "string"), ex_integer_string);
        });
        it("fixed-point -> number", function () {
            assert.equal(Augur.unfix(Augur.fix(ex_integer_string, "BigNumber"), "number"), ex_integer);
        });
    });

    var amount = "1";
    var branch_id = Augur.branches.dev;
    var branch_number = "1";
    var participant_id = constants.accounts.jack;
    var participant_number = "1";
    var outcome = Augur.NO.toString();
    var event_id = "0x0919ce53f2c2c2a5422c2aacafdede55a3795ce4f6e4a4034e37e44bc054d13b";
    var market_id = "0x9fa7e53477023001394ef9a7d65f5d2dffd9b7c975e7b40497a9d582b2665664";
    var market_id2 = "0xfb79748fa3056de9b6df8cd0693c203f8024eedfb88c0abcaa4406184b5db243";
    var event_description = "[augur.js] " + Math.random().toString(36).substring(4);
    var market_description = "[augur.js] " + Math.random().toString(36).substring(4);
    // var event_description = "Will the Augur alpha be done by Saturday, May 16, 2015?";
    // var market_description = "Will the Augur alpha be done by Saturday, May 16, 2015?";
    var reporter_index = "0";
    var reporter_address = constants.accounts.jack;
    var ballot = [Augur.YES, Augur.YES, Augur.NO, Augur.YES];
    var salt = "1337";
    var receiving_account = constants.accounts.joey;
    var vote_period = 1;

    // payment methods
    describe("pay", function () {
        it("complete call-send-confirm callback sequence", function (done) {
            this.timeout(120000);
            var start_balance = Augur.bignum(Augur.balance()).dividedBy(Augur.ETHER);
            var value = 10;
            var tx = {
                to: constants.accounts.loopy,
                value: value,
                onSent: function (res) {
                    // log(res);
                },
                onSuccess: function (res) {
                    // log("success: " + JSON.stringify(res, null, 2));
                    // var final_balance = Augur.bignum(Augur.balance()).dividedBy(Augur.ETHER);
                    // assert.equal(start_balance.sub(final_balance).toNumber(), value);
                    done();
                }
            };
            Augur.pay(tx);
        });
    });
    describe("sendCash", function () {
        it("complete call-send-confirm callback sequence", function (done) {
            this.timeout(120000);
            var start_balance = Augur.bignum(Augur.getCashBalance());
            var value = 10;
            Augur.sendCash({
                to: constants.accounts.scott,
                value: value,
                onSent: function (res) {
                    // log(res);
                },
                onSuccess: function (res) {
                    // log("success: " + JSON.stringify(res, null, 2));
                    // var final_balance = Augur.bignum(Augur.getCashBalance());
                    // assert.equal(start_balance.sub(final_balance).toNumber(), value);
                    done();
                },
                onFailed: function (res) {
                    log("failed: " + JSON.stringify(res, null, 2));
                    done();
                }
            });
        });
    });
    describe("sendReputation", function () {
        it("complete call-send-confirm callback sequence", function (done) {
            this.timeout(120000);
            var start_balance = Augur.bignum(Augur.getRepBalance(Augur.branches.dev));
            var value = 10;
            Augur.sendReputation({
                branchId: Augur.branches.dev,
                to: constants.accounts.scott,
                value: value,
                onSent: function (res) {
                    // log(res);
                },
                onSuccess: function (res) {
                    // log("success: " + JSON.stringify(res, null, 2));
                    // var final_balance = Augur.bignum(Augur.getRepBalance(Augur.branches.dev));
                    // assert.equal(start_balance.sub(final_balance).toNumber(), value);
                    done();
                },
                onFailed: function (res) {
                    log("failed: " + JSON.stringify(res, null, 2));
                    done();
                }
            });
        });
    });

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
            // it("sync", function () {
            //     Augur.tx.cashFaucet.send = true;
            //     Augur.tx.cashFaucet.returns = undefined;
            //     var res = Augur.cashFaucet();
            //     is_not_zero(res);
            // });
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
        describe("getCreator(" + event_id + ") [event] -> " + constants.accounts.jack, function () {
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
        describe("getCreator(" + market_id + ") [market] -> ", function () {
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
                assert.equal(res, "[augur.js] dbk7kieqjxxbt9");
            });
            it("async", function (done) {
                Augur.getDescription(event_id, function (r) {
                    assert.equal(r, "[augur.js] dbk7kieqjxxbt9");
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
                assert.equal(res.expirationDate, "329557");
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
        describe("getExpiration(" + event_id + ") == '329557'", function () {
            var test = function (r) {
                assert.equal(r, "329557");
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
            it("should have description '[augur.js] dbk7kieqjxxbt9'", function () {
                assert.equal("[augur.js] dbk7kieqjxxbt9", marketInfo.description);
            });
        });
        describe("getMarketInfo(" + market_id + ")", function () {
            var test = function (r) {
                assert.equal(r.description, "[augur.js] dbk7kieqjxxbt9");
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
                assert.equal(r.description, "Will Augur raise over $2M in the crowdsale?");
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
                assert(array_equal(r, ["0x1253ae7a83d5cbd1b583db494bbef15ae57fa8cefc1dbea78887b111625d60bb"]));
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
                assert.equal(r, "0x38a820692912b5f7a3bfefc2a1d4826e1da6beaed5fac6de3d22b18132133991");
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
                assert.equal(r, "1098");
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
                assert.equal(r, constants.accounts.jack);
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
                assert(r.length >= 3); // why equal to 5...?
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
                assert.equal(r, "0");
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
                assert.equal(r, "0x7e2d63d1ba8dfda2b2764e6be7a616fc9b7195d84f40736f76fb769b8f819331");
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
            Augur.tx.sendReputation.send = false;
            Augur.tx.sendReputation.returns = "unfix";
            it("sync", function () {
                test(Augur.sendReputation(branch_id, receiving_account, amount));
            });
            it("async", function (done) {
                Augur.sendReputation(branch_id, receiving_account, amount, function (r) {
                    test(r); done();
                });
            });
        });
    });

    // transferShares.se

    // makeReports.se
    describe("makeReports.se", function () {
        describe("report", function () {
            it("complete call-send-confirm callback sequence", function (done) {
                this.timeout(120000);
                var report = {
                    branchId: branch_id,
                    report: [1, 2, 1, 1],
                    votePeriod: Augur.getCurrentVotePeriod(branch_id),
                    salt: salt,
                    onSent: function (res) {
                        // log("sent: " + JSON.stringify(res));
                    },
                    onSuccess: function (res) {
                        // log("success: " + JSON.stringify(res));
                        done();
                    },
                    onFailed: function (res) {
                        log("failed: " + JSON.stringify(res));
                        done();
                    }
                };
                Augur.report(report);
            });
        });
        describe("submitReportHash", function () {
            it("complete call-send-confirm callback sequence", function (done) {
                this.timeout(120000);
                var reportHashObj = {
                    branchId: branch_id,
                    reportHash: Augur.hash('[1,2,1,1]'),
                    votePeriod: Augur.getCurrentVotePeriod(branch_id),
                    onSent: function (res) {
                        // log("sent: " + JSON.stringify(res, null, 2));
                    },
                    onSuccess: function (res) {
                        // log("success: " + JSON.stringify(res, null, 2));
                        done();
                    },
                    onFailed: function (res) {
                        log("failed: " + JSON.stringify(res, null, 2));
                        done();
                    }
                };
                Augur.submitReportHash(reportHashObj);
            });
        });
        describe("checkReportValidity", function () {
            it("complete call-send-confirm callback sequence", function (done) {
                this.timeout(120000);
                var checkReportObj = {
                    branchId: branch_id,
                    report: [1, 2, 1, 1],
                    votePeriod: Augur.getCurrentVotePeriod(branch_id),
                    onSent: function (res) {
                        // log("sent: " + JSON.stringify(res, null, 2));
                    },
                    onSuccess: function (res) {
                        // log("success: " + JSON.stringify(res, null, 2));
                        done();
                    },
                    onFailed: function (res) {
                        log("failed: " + JSON.stringify(res, null, 2));
                        done();
                    }
                };
                Augur.checkReportValidity(checkReportObj);
            });
        });
        describe("slashRep", function () {
            it("complete call-send-confirm callback sequence", function (done) {
                this.timeout(120000);
                var slashRepObj = {
                    branchId: branch_id,
                    votePeriod: Augur.getCurrentVotePeriod(branch_id),
                    salt: salt,
                    report: [1, 2, 1, 1],
                    reporter: constants.accounts.jack,
                    onSent: function (res) {
                        // log("sent: " + JSON.stringify(res, null, 2));
                    },
                    onSuccess: function (res) {
                        // log("success: " + JSON.stringify(res, null, 2));
                        done();
                    },
                    onFailed: function (res) {
                        log("failed: " + JSON.stringify(res, null, 2));
                        done();
                    }
                };
                Augur.slashRep(slashRepObj);
            });
        });
    });

    // createEvent.se
    describe("createEvent.se", function () {
        describe("createEvent: \"" + event_description + "\"", function () {
            it("async", function (done) {
                this.timeout(120000);
                var expDate = "30000000";
                var minValue = "1";
                var maxValue = "2";
                var numOutcomes = "2";
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

    // createMarket.se
    describe("createMarket.se", function () {
        describe("createMarket: \"" + market_description + "\"", function () {
            it("async", function (done) {
                this.timeout(120000);
                var alpha = "0.0079";
                var initialLiquidity = "5000";
                var tradingFee = "0.03";
                var events = ["0x0919ce53f2c2c2a5422c2aacafdede55a3795ce4f6e4a4034e37e44bc054d13b"];
                var numOutcomes = "2";
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
                        assert.equal(r.description, market_description);
                        done();
                    },
                    onFailed: function (r) {
                        log("createMarket: \"" + market_description + "\"");
                        log("failed: " + JSON.stringify(r, null, 2));
                        done();
                    }
                };
                Augur.createMarket(marketObj);
                // done();
            });
        });
    });

    // closeMarket.se
    describe("closeMarket.se", function () {
        describe("closeMarket(" + branch_id + ", " + market_id + ") [call] ", function () {
            it("async", function (done) {
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
            it("async", function (done) {
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
