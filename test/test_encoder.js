#!/usr/bin/env node
/**
 * augur.js unit tests
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var assert = require("assert");
var Augur = require("../augur");
var constants = require("./constants");

Augur.connect();

function copy(obj) {
    if (null === obj || "object" !== typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

var log = console.log;

describe("Contract ABI data serialization", function () {
    describe("No parameters", function () {
        describe("ten.se: " + constants.examples.ten, function () {
            it("ten()", function () {
                var tx = {
                    to: constants.examples.ten,
                    method: "ten",
                    returns: "number"
                };
                assert.equal(Augur.abi_data(tx), "0x643ceff9");
            });
        });
        describe("cash.se: " + Augur.contracts.cash, function () {
            it("faucet()", function () {
                var tx = {
                    to: Augur.contracts.cash,
                    method: "faucet"
                };
                assert.equal(Augur.abi_data(tx), "0xde5f72fd");
            });
        });
        describe("branches.se: " + Augur.contracts.branches, function () {
            it("getBranches()", function () {
                var tx = {
                    from: Augur.coinbase,
                    to: Augur.contracts.branches,
                    method: "getBranches"
                };
                assert.equal(Augur.abi_data(tx), "0xc3387858");
            });
        });
    });
    describe("One int256 parameter", function () {
        describe("mul2.se: " + constants.examples.mul2, function () {
            it("double(3)", function () {
                var tx = {
                    to: constants.examples.mul2,
                    method: "double",
                    signature: "i",
                    params: [3]
                };
                var expected = "0x6ffa1caa0000000000000000000000000000000000000000000000000000000000000003";
                assert.equal(Augur.abi_data(tx), expected);
            });
        });
        describe("branches.se: " + Augur.contracts.branches, function () {
            it("getMarkets(1010101)", function () {
                var tx = {
                    to: Augur.contracts.branches,
                    method: "getMarkets",
                    signature: "i",
                    params: 1010101
                };
                var expected = "0xb3903c8a00000000000000000000000000000000000000000000000000000000000f69b5";
                assert.equal(Augur.abi_data(tx), expected);
            });
        });
        describe("branches.se: " + Augur.contracts.branches, function () {
            it("getVotePeriod(1010101)", function () {
                var tx = {
                    from: Augur.coinbase,
                    to: Augur.contracts.branches,
                    method: "getVotePeriod",
                    signature: "i",
                    params: 1010101
                };
                var expected = "0x7a66d7ca00000000000000000000000000000000000000000000000000000000000f69b5";
                assert.equal(Augur.abi_data(tx), expected);
            });
        });
        describe("info.se: " + Augur.contracts.info, function () {
            var method = "getDescription";
            var params = "0xb2a6de45f349b5ac384b01a785e640f519f0a8597ab2031c964c7f572d96b13c";
            it(method + "(" + params + ")", function () {
                var tx = {
                    to: Augur.contracts.info,
                    method: method,
                    signature: "i",
                    params: params
                };
                var expected = "0x37e7ee00b2a6de45f349b5ac384b01a785e640f519f0a8597ab2031c964c7f572d96b13c";
                assert.equal(Augur.abi_data(tx), expected);
            });
        });
        describe("events.se: " + Augur.contracts.events, function () {
            var method = "getEventInfo";
            var params = "0xb2a6de45f349b5ac384b01a785e640f519f0a8597ab2031c964c7f572d96b13c";
            it(method + "(" + params + ")", function () {
                var tx = {
                    from: Augur.coinbase,
                    to: Augur.contracts.events,
                    method: method,
                    signature: "i",
                    params: params
                };
                var expected = "0x1aecdb5b"+
                    "b2a6de45f349b5ac384b01a785e640f519f0a8597ab2031c964c7f572d96b13c";
                assert.equal(Augur.abi_data(tx), expected);
            });
        });
    });
    describe("Two int256 parameters", function () {
        describe("multiplier.se: " + constants.examples.multiplier, function () {
            it("multiply(2,3)", function () {
                var tx = {
                    to: constants.examples.multiplier,
                    method: "multiply",
                    signature: "ii",
                    params: [2, 3]
                };
                var expected = "0x3c4308a8"+
                    "0000000000000000000000000000000000000000000000000000000000000002"+
                    "0000000000000000000000000000000000000000000000000000000000000003";
                assert.equal(Augur.abi_data(tx), expected);
            });
        });
    });
    describe("Single int256[] parameter", function () {
        describe("arraydouble.se: " + constants.examples.arraydouble, function () {
            it("double([4,7])", function () {
                var tx = {
                    from: '0x63524e3fe4791aefce1e932bbfb3fdf375bfad89',
                    to: '0x86c62f40cd49b3a42fad6104f38b3f68aa9871f8',
                    method: 'double',
                    signature: 'a',
                    params: [[4, 7]]
                };
                var expected = "0x8de53e9"+
                    "0000000000000000000000000000000000000000000000000000000000000020"+
                    "0000000000000000000000000000000000000000000000000000000000000002"+
                    "0000000000000000000000000000000000000000000000000000000000000004"+
                    "0000000000000000000000000000000000000000000000000000000000000007";
                assert.equal(Augur.abi_data(tx), expected);
            });
        });
    });
    describe("Multiple parameters: int256, int256[]", function () {
        describe("makeReports.se", function () {
            it("slashRep", function () {
                var branch_id = "0x38a820692912b5f7a3bfefc2a1d4826e1da6beaed5fac6de3d22b18132133991";
                var vote_period = "1170";
                var salt = "1337";
                var report = [1, 2, 1, 1];
                var reporter = "0x63524e3fe4791aefce1e932bbfb3fdf375bfad89";
                var expected = "0x660a246c"+
                    "38a820692912b5f7a3bfefc2a1d4826e1da6beaed5fac6de3d22b18132133991"+
                    "0000000000000000000000000000000000000000000000000000000000000492"+
                    "0000000000000000000000000000000000000000000000000000000000000539"+
                    "00000000000000000000000000000000000000000000000000000000000000a0"+
                    "00000000000000000000000063524e3fe4791aefce1e932bbfb3fdf375bfad89"+
                    "0000000000000000000000000000000000000000000000000000000000000004"+
                    "0000000000000000000000000000000000000000000000000000000000000001"+
                    "0000000000000000000000000000000000000000000000000000000000000002"+
                    "0000000000000000000000000000000000000000000000000000000000000001"+
                    "0000000000000000000000000000000000000000000000000000000000000001";
                var tx = copy(Augur.tx.slashRep);
                tx.params = [branch_id, vote_period, salt, report, reporter];
                assert.equal(Augur.abi_data(tx), expected);
            });
        });
    });
    describe("Multiple parameters: int256, string", function () {
        describe("createEvent.se: " + Augur.contracts.createEvent, function () {
            it("createEvent('my event')", function () {
                var tx = {
                  method: 'createEvent',
                  signature: 'isiiii',
                  params: 
                   [ '0x38a820692912b5f7a3bfefc2a1d4826e1da6beaed5fac6de3d22b18132133991',
                     'my event',
                     250000,
                     1,
                     2,
                     2 ]
                };
                var expected = "0x130dd1b3"+
                    "38a820692912b5f7a3bfefc2a1d4826e1da6beaed5fac6de3d22b18132133991"+
                    "00000000000000000000000000000000000000000000000000000000000000c0"+
                    "000000000000000000000000000000000000000000000000000000000003d090"+
                    "0000000000000000000000000000000000000000000000000000000000000001"+
                    "0000000000000000000000000000000000000000000000000000000000000002"+
                    "0000000000000000000000000000000000000000000000000000000000000002"+
                    "0000000000000000000000000000000000000000000000000000000000000008"+
                    "6d79206576656e74000000000000000000000000000000000000000000000000";
                assert.equal(Augur.abi_data(tx), expected);
            });
            it("createEvent('augur ragefest 2015')", function () {
                var tx = {
                    from: Augur.coinbase,
                    to: Augur.contracts.createEvent,
                    method: "createEvent",
                    signature: "isiiii",
                    params: [
                        "0x38a820692912b5f7a3bfefc2a1d4826e1da6beaed5fac6de3d22b18132133991",
                        "augur ragefest 2015",
                        250000,
                        1,
                        2,
                        2
                    ]
                };
                var expected = "0x130dd1b3"+
                    "38a820692912b5f7a3bfefc2a1d4826e1da6beaed5fac6de3d22b18132133991"+
                    "00000000000000000000000000000000000000000000000000000000000000c0"+
                    "000000000000000000000000000000000000000000000000000000000003d090"+
                    "0000000000000000000000000000000000000000000000000000000000000001"+
                    "0000000000000000000000000000000000000000000000000000000000000002"+
                    "0000000000000000000000000000000000000000000000000000000000000002"+
                    "0000000000000000000000000000000000000000000000000000000000000013"+
                    "6175677572207261676566657374203230313500000000000000000000000000";
                assert.equal(Augur.abi_data(tx), expected);
            });
        });
    });
    describe("Multiple parameters: int256, string, int256[]", function () {
        describe("createMarket.se: " + Augur.contracts.createMarket, function () {
            it("createMarket('market for ragefests')", function () {
                var tx = {
                    from: Augur.coinbase,
                    to: Augur.contracts.createMarket,
                    method: "createMarket",
                    signature: "isiiia",
                    params: [
                        "0x38a820692912b5f7a3bfefc2a1d4826e1da6beaed5fac6de3d22b18132133991",
                        "market for ragefests",
                        "0x1000000000000000",
                        "0x2800000000000000000",
                        "0x400000000000000",
                        ["0xb2a6de45f349b5ac384b01a785e640f519f0a8597ab2031c964c7f572d96b13c",
                         "0x4f37814757b7d0e2dde46de18bb4bf4a85e6716a06849d5cfcebf8f1d7270b12",
                         "0x412b3c588f9be08d54e99bf5095ef910c5e84080f048e3af8a2718b7b693cb83"]
                    ]
                };
                var expected = "0x8d19b3f"+
                    "38a820692912b5f7a3bfefc2a1d4826e1da6beaed5fac6de3d22b18132133991"+
                    "00000000000000000000000000000000000000000000000000000000000000c0"+
                    "0000000000000000000000000000000000000000000000001000000000000000"+
                    "0000000000000000000000000000000000000000000002800000000000000000"+
                    "0000000000000000000000000000000000000000000000000400000000000000"+
                    "0000000000000000000000000000000000000000000000000000000000000100"+
                    "0000000000000000000000000000000000000000000000000000000000000014"+
                    "6d61726b657420666f7220726167656665737473000000000000000000000000"+
                    "0000000000000000000000000000000000000000000000000000000000000003"+
                    "b2a6de45f349b5ac384b01a785e640f519f0a8597ab2031c964c7f572d96b13c"+
                    "4f37814757b7d0e2dde46de18bb4bf4a85e6716a06849d5cfcebf8f1d7270b12"+
                    "412b3c588f9be08d54e99bf5095ef910c5e84080f048e3af8a2718b7b693cb83";
                assert.equal(Augur.abi_data(tx), expected);
            });
            // negative hash
            it("createMarket('unicorns are real')", function () {
                var tx = {
                    from: Augur.coinbase,
                    to: Augur.contracts.createMarket,
                    method: "createMarket",
                    signature: "isiiia",
                    params: [
                        "0x38a820692912b5f7a3bfefc2a1d4826e1da6beaed5fac6de3d22b18132133991",
                        "unicorns are real",
                        "0x10000000000000000",
                        "0xa0000000000000000",
                        "0xa0000000000000000",
                        ["-0x2ae31f0184fa3e11a1517a11e3fc6319cb7c310cee36b20f8e0263049b1f3a6f"]
                    ]
                };
                var expected = "0x8d19b3f"+
                    "38a820692912b5f7a3bfefc2a1d4826e1da6beaed5fac6de3d22b18132133991"+
                    "00000000000000000000000000000000000000000000000000000000000000c0"+
                    "0000000000000000000000000000000000000000000000010000000000000000"+
                    "00000000000000000000000000000000000000000000000a0000000000000000"+
                    "00000000000000000000000000000000000000000000000a0000000000000000"+
                    "0000000000000000000000000000000000000000000000000000000000000100"+
                    "0000000000000000000000000000000000000000000000000000000000000011"+
                    "756e69636f726e7320617265207265616c000000000000000000000000000000"+
                    "0000000000000000000000000000000000000000000000000000000000000001"+
                    "d51ce0fe7b05c1ee5eae85ee1c039ce63483cef311c94df071fd9cfb64e0c591";
                assert.equal(Augur.abi_data(tx), expected);
            });
        });
    });
});

// test({ type: 'int256', value: 1,            expected: '0000000000000000000000000000000000000000000000000000000000000001'});
// test({ type: 'int256', value: 16,           expected: '0000000000000000000000000000000000000000000000000000000000000010'});
// test({ type: 'int256', value: -1,           expected: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'});
// test({ type: 'bytes', value: 'gavofyork',   expected: '0000000000000000000000000000000000000000000000000000000000000020' +
//                                                       '0000000000000000000000000000000000000000000000000000000000000009' +
//                                                       '6761766f66796f726b0000000000000000000000000000000000000000000000'});
// test({ type: 'int256[]', value: [3],        expected: '0000000000000000000000000000000000000000000000000000000000000020' +
//                                                       '0000000000000000000000000000000000000000000000000000000000000001' +
//                                                       '0000000000000000000000000000000000000000000000000000000000000003'});
// test({ types: ['int256'], values: [1],              expected: '0000000000000000000000000000000000000000000000000000000000000001'});
// test({ types: ['int256'], values: [16],             expected: '0000000000000000000000000000000000000000000000000000000000000010'});
// test({ types: ['int256'], values: [-1],             expected: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'});
// test({ types: ['bytes'], values: ['gavofyork'],     expected: '0000000000000000000000000000000000000000000000000000000000000020' +
//                                                               '0000000000000000000000000000000000000000000000000000000000000009' +
//                                                               '6761766f66796f726b0000000000000000000000000000000000000000000000'});
// test({ types: ['int256[]'], values: [[3]],          expected: '0000000000000000000000000000000000000000000000000000000000000020' +
//                                                               '0000000000000000000000000000000000000000000000000000000000000001' +
//                                                               '0000000000000000000000000000000000000000000000000000000000000003'});
// test({ types: ['int256[]'], values: [[1,2,3]],      expected: '0000000000000000000000000000000000000000000000000000000000000020' +
//                                                               '0000000000000000000000000000000000000000000000000000000000000003' +
//                                                               '0000000000000000000000000000000000000000000000000000000000000001' +
//                                                               '0000000000000000000000000000000000000000000000000000000000000002' +
//                                                               '0000000000000000000000000000000000000000000000000000000000000003'});
// test({ types: ['int[]', 'int[]'], values: [[1,2], [3,4]],             
//                                                     expected: '0000000000000000000000000000000000000000000000000000000000000040' +
//                                                               '00000000000000000000000000000000000000000000000000000000000000a0' +
//                                                               '0000000000000000000000000000000000000000000000000000000000000002' +
//                                                               '0000000000000000000000000000000000000000000000000000000000000001' +
//                                                               '0000000000000000000000000000000000000000000000000000000000000002' +
//                                                               '0000000000000000000000000000000000000000000000000000000000000002' +
//                                                               '0000000000000000000000000000000000000000000000000000000000000003' +
//                                                               '0000000000000000000000000000000000000000000000000000000000000004'});
// test({ types: ['bytes', 'int'], values: ['gavofyork', 5],
//                                                     expected: '0000000000000000000000000000000000000000000000000000000000000040' + 
//                                                               '0000000000000000000000000000000000000000000000000000000000000005' + 
//                                                               '0000000000000000000000000000000000000000000000000000000000000009' + 
//                                                               '6761766f66796f726b0000000000000000000000000000000000000000000000'});
// test({ types: ['bytes', 'int[]'], values: ['gavofyork', [1, 2, 3]],
//                                                     expected: '0000000000000000000000000000000000000000000000000000000000000040' + 
//                                                               '0000000000000000000000000000000000000000000000000000000000000080' + 
//                                                               '0000000000000000000000000000000000000000000000000000000000000009' + 
//                                                               '6761766f66796f726b0000000000000000000000000000000000000000000000' + 
//                                                               '0000000000000000000000000000000000000000000000000000000000000003' + 
//                                                               '0000000000000000000000000000000000000000000000000000000000000001' + 
//                                                               '0000000000000000000000000000000000000000000000000000000000000002' + 
//                                                               '0000000000000000000000000000000000000000000000000000000000000003'});
// test({ types: ['int', 'bytes'], values: [5, 'gavofyork'],
//                                                     expected: '0000000000000000000000000000000000000000000000000000000000000005' + 
//                                                               '0000000000000000000000000000000000000000000000000000000000000040' + 
//                                                               '0000000000000000000000000000000000000000000000000000000000000009' + 
//                                                               '6761766f66796f726b0000000000000000000000000000000000000000000000'});
// test({ types: ['int', 'bytes', 'int', 'int', 'int', 'int[]'], values: [1, 'gavofyork', 2, 3, 4, [5, 6, 7]],
//                                                     expected: '0000000000000000000000000000000000000000000000000000000000000001' +
//                                                               '00000000000000000000000000000000000000000000000000000000000000c0' +
//                                                               '0000000000000000000000000000000000000000000000000000000000000002' +
//                                                               '0000000000000000000000000000000000000000000000000000000000000003' +
//                                                               '0000000000000000000000000000000000000000000000000000000000000004' +
//                                                               '0000000000000000000000000000000000000000000000000000000000000100' +
//                                                               '0000000000000000000000000000000000000000000000000000000000000009' +
//                                                               '6761766f66796f726b0000000000000000000000000000000000000000000000' +
//                                                               '0000000000000000000000000000000000000000000000000000000000000003' +
//                                                               '0000000000000000000000000000000000000000000000000000000000000005' +
//                                                               '0000000000000000000000000000000000000000000000000000000000000006' +
//                                                               '0000000000000000000000000000000000000000000000000000000000000007'});