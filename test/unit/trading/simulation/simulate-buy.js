/* eslint-env mocha */

"use strict";

var assert = require("chai").assert;
var BigNumber = require("bignumber.js");
var simulateBuy = require("../../../../src/trading/simulation/simulate-buy");
var constants = require("../../../../src/constants");
var ZERO = constants.ZERO;

describe("trading/simulation/simulate-buy", function () {
  var test = function (t) {
    it(t.description, function () {
      t.assertions(simulateBuy(t.params.outcomeID, t.params.sharesToCover, t.params.shareBalances, t.params.tokenBalance, t.params.userAddress, t.params.minPrice, t.params.maxPrice, t.params.price, t.params.marketCreatorFeeRate, t.params.reportingFeeRate, t.params.shouldCollectReportingFees, t.params.sellOrderBook));
    });
  };
  test({
    description: "single matching ask, taker partially filled",
    params: {
      outcomeID: 0,
      sharesToCover: new BigNumber("3", 10),
      shareBalances: [ZERO, new BigNumber("5", 10)],
      tokenBalance: ZERO,
      userAddress: "USER_ADDRESS",
      minPrice: ZERO,
      maxPrice: new BigNumber("1", 10),
      price: new BigNumber("0.7", 10),
      marketCreatorFeeRate: ZERO,
      reportingFeeRate: new BigNumber("0.01", 10),
      shouldCollectReportingFees: 1,
      sellOrderBook: {
        ORDER_0: {
          amount: "2",
          fullPrecisionPrice: "0.7",
          sharesEscrowed: "2",
          outcome: 0,
          owner: "OWNER_ADDRESS"
        }
      }
    },
    assertions: function (output) {
      assert.deepEqual(output, {
        settlementFees: new BigNumber("0.006", 10),
        maxSettlementFees: new BigNumber("0.03", 10),
        gasFees: ZERO,
        otherSharesDepleted: new BigNumber("3", 10),
        sharesDepleted: ZERO,
        tokensDepleted: ZERO,
        shareBalances: [ZERO, new BigNumber("4", 10)]
      });
    }
  });
  test({
    description: "no matching asks",
    params: {
      outcomeID: 0,
      sharesToCover: new BigNumber("3", 10),
      shareBalances: [ZERO, new BigNumber("5", 10)],
      tokenBalance: ZERO,
      userAddress: "USER_ADDRESS",
      minPrice: ZERO,
      maxPrice: new BigNumber("1", 10),
      price: new BigNumber("0.7", 10),
      marketCreatorFeeRate: ZERO,
      reportingFeeRate: new BigNumber("0.01", 10),
      shouldCollectReportingFees: 1,
      sellOrderBook: {
        ORDER_0: {
          amount: "2",
          fullPrecisionPrice: "0.8",
          sharesEscrowed: "2",
          outcome: 0,
          owner: "OWNER_ADDRESS"
        }
      }
    },
    assertions: function (output) {
      assert.deepEqual(output, {
        settlementFees: ZERO,
        maxSettlementFees: new BigNumber("0.03", 10),
        gasFees: ZERO,
        otherSharesDepleted: new BigNumber("3", 10),
        sharesDepleted: ZERO,
        tokensDepleted: ZERO,
        shareBalances: [ZERO, new BigNumber("2", 10)]
      });
    }
  });
  test({
    description: "two matching asks, complete fill",
    params: {
      outcomeID: 0,
      sharesToCover: new BigNumber("3", 10),
      shareBalances: [ZERO, new BigNumber("5", 10)],
      tokenBalance: ZERO,
      userAddress: "USER_ADDRESS",
      minPrice: ZERO,
      maxPrice: new BigNumber("1", 10),
      price: new BigNumber("0.7", 10),
      marketCreatorFeeRate: ZERO,
      reportingFeeRate: new BigNumber("0.01", 10),
      shouldCollectReportingFees: 1,
      sellOrderBook: {
        ORDER_0: {
          amount: "2",
          fullPrecisionPrice: "0.6",
          sharesEscrowed: "2",
          outcome: 0,
          owner: "OWNER_ADDRESS"
        },
        ORDER_1: {
          amount: "1",
          fullPrecisionPrice: "0.7",
          sharesEscrowed: "2",
          outcome: 0,
          owner: "OWNER_ADDRESS"
        }
      }
    },
    assertions: function (output) {
      assert.deepEqual(output, {
        settlementFees: new BigNumber("0.011", 10),
        maxSettlementFees: new BigNumber("0.03", 10),
        gasFees: ZERO,
        otherSharesDepleted: new BigNumber("3", 10),
        sharesDepleted: ZERO,
        tokensDepleted: ZERO,
        shareBalances: [ZERO, new BigNumber("2", 10)]
      });
    }
  });
});
