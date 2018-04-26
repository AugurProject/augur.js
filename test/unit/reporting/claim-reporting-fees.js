/* eslint-env mocha */

"use strict";

var assert = require("chai").assert;
var equal = require("chai").equal;
var assign = require("lodash.assign");
var proxyquire = require("proxyquire").noPreserveCache();
var noop = require("../../../src/utils/noop");
var sinon = require("sinon");

describe.only("reporting/claim-reporting-fees", function () {
  var claimReportingFees;
  var params = {
    redeemer: "REDEEMER_ADDRESS",
    feeWindows: [
      "FEE_WINDOW_1_ADDRESS",
    ],
    forkedMarket: {
      address: "FORKED_MARKET_ADDRESS",
      universeAddress: "FORKED_MARKET_UNIVERSE_ADDRESS",
      isFinalized: true,
      crowdsourcers: [
        {
          address: "FORKED_MARKET_CROWDSOURCER_1",
          isForked: true,
        },
        {
          address: "FORKED_MARKET_CROWDSOURCER_2",
          isForked: false,
        },
      ],
      initialReporter: {
        address: "FORKED_MARKET_INITIAL_REPORTER",
        isForked: true,
      },
    },
    nonforkedMarkets: [
      {
        address: "NONFORKED_MARKET_1_ADDRESS",
        universeAddress: "NONFORKED_MARKET_1_UNIVERSE_ADDRESS",
        crowdsourcersAreDisavowed: true,
        isMigrated: false,
        isFinalized: false,
        crowdsourcers: [
          "NON_FORKED_MARKET_1_CROWDSOURCER_1",
          "NON_FORKED_MARKET_1_CROWDSOURCER_2",
        ],
        initialReporterAddress: "NON_FORKED_MARKET_1_INITIAL_REPORTER",
      },
      {
        address: "NONFORKED_MARKET_2_ADDRESS",
        universeAddress: "NONFORKED_MARKET_2_UNIVERSE_ADDRESS",
        crowdsourcersAreDisavowed: false,
        isMigrated: true,
        isFinalized: false,
        crowdsourcers: [
          "NON_FORKED_MARKET_2_CROWDSOURCER_1",
          "NON_FORKED_MARKET_2_CROWDSOURCER_2",
        ],
        initialReporterAddress: "NON_FORKED_MARKET_2_INITIAL_REPORTER",
      },
      {
        address: "NONFORKED_MARKET_3_ADDRESS",
        universeAddress: "NONFORKED_MARKET_3_UNIVERSE_ADDRESS",
        crowdsourcersAreDisavowed: false,
        isMigrated: false,
        isFinalized: true,
        crowdsourcers: [
          "NON_FORKED_MARKET_3_CROWDSOURCER_1",
          "NON_FORKED_MARKET_3_CROWDSOURCER_2",
        ],
        initialReporterAddress: "NON_FORKED_MARKET_3_INITIAL_REPORTER",
      },
    ],
    estimateGas: true,
  };
  var api = function () {
    return {
      DisputeCrowdsourcer: {
        forkAndRedeem: function (p) {
        },
        redeem: function (p) {
        },
      },
      FeeWindow: {
        redeem: function (p) {
          console.log(p);
        },
      },
      InitialReporter: {
        forkAndRedeem: function (p) {
        },
        redeem: function (p) {
        },
      },
      Market: {
        disavowCrowdsourcers: function (p) {
        },
        migrateThroughOneFork: function (p) {
        },
      },
    };
  };
  var disputeCrowdsourcerForkAndRedeemSpy;
  var disputeCrowdsourcerRedeemSpy;
  var feeWindowRedeemSpy;
  var initialReporterForkAndRedeemSpy;
  var initialReporterRedeemSpy;
  var marketDisavowCrowdsourcersSpy;
  var marketMigrateThroughOneForkSpy;

  describe("When a market in the parent universe is forked", function () {
    before(function () {
      disputeCrowdsourcerForkAndRedeemSpy = sinon.spy(api().DisputeCrowdsourcer.forkAndRedeem);
      disputeCrowdsourcerRedeemSpy = sinon.spy(api().DisputeCrowdsourcer.redeem);
      feeWindowRedeemSpy = sinon.spy(api().FeeWindow.redeem);
      initialReporterForkAndRedeemSpy = sinon.spy(api().InitialReporter.forkAndRedeem);
      initialReporterRedeemSpy = sinon.spy(api().InitialReporter.disavowCrowdsourcers);
      marketDisavowCrowdsourcersSpy = sinon.spy(api().Market.disavowCrowdsourcers);
      marketMigrateThroughOneForkSpy = sinon.spy(api().Market.migrateThroughOneFork);
      claimReportingFees = proxyquire("../../../src/reporting/claim-reporting-fees", {
        "../api": api,
      });
      claimReportingFees(assign(params, {
        onSent: noop,
        onSuccess: noop,
        onFailed: noop,
      }));
    });

    describe("DisputeCrowdsourcer.forkAndRedeem", function () {
      it("should be called", function () {
        assert(disputeCrowdsourcerForkAndRedeemSpy.callCount === 0);
      });
    });

    describe("DisputeCrowdsourcer.redeem", function () {
      it("should be called", function () {
        assert(disputeCrowdsourcerRedeemSpy.callCount === 0);
      });
    });

    describe("FeeWindow.redeem", function () {
      it("should be called once", function () {
        assert(feeWindowRedeemSpy.callCount === 1);
      });
    });

    describe("InitialReporter.forkAndRedeem", function () {
      it("should be called", function () {
        assert(initialReporterForkAndRedeemSpy.callCount === 0);
      });
    });

    describe("InitialReporter.redeem", function () {
      it("should be called", function () {
        assert(initialReporterRedeemSpy.callCount === 0);
      });
    });

    describe("Market.disavowCrowdsourcers", function () {
      it("should be called", function () {
        assert(marketDisavowCrowdsourcersSpy.callCount === 0);
      });
    });

    describe("Market.migrateThroughOneFork", function () {
      it("should be called", function () {
        assert(marketMigrateThroughOneForkSpy.notCalled);
      });
    });
  });
});
