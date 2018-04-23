"use strict";

var async = require("async");
var BigNumber = require("bignumber.js");
var immutableDelete = require("immutable-delete");
var assign = require("lodash.assign");
var api = require("../api");
var contractTypes = require("../constants").CONTRACT_TYPE;
var PARALLEL_LIMIT = require("../constants").PARALLEL_LIMIT;
var FORKED_MARKET_STATE = require("../constants").FORKED_MARKET_STATE;

function redeemNonForkedMarketFees(p, payload, successfulTransactions, failedTransactions, gasEstimates) {
  var redeemableContracts = [];
  var i = 0;
  for (i = 0; i < p.feeWindows.length; i++) {
    redeemableContracts.push({
      address: p.feeWindows[i],
      type: contractTypes.FEE_WINDOW,
    });
  }
  for (i = 0; i < p.nonForkedMarkets.length; i++) {
    for (var j = 0; j < p.nonForkedMarkets[i].crowdsourcers.length; j++) {
      redeemableContracts.push({
        address: p.nonForkedMarkets[i].crowdsourcers[j],
        type: contractTypes.DISPUTE_CROWDSOURCER,
      });
    }
    redeemableContracts.push({
      address: p.nonForkedMarkets[i].initialReporterAddress,
      type: contractTypes.INITIAL_REPORTER,
    });
  }

  async.eachLimit(redeemableContracts, PARALLEL_LIMIT, function (contract, nextContract) {
    switch (contract.type) {
      case contractTypes.FEE_WINDOW:
        api().FeeWindow.redeem(assign({}, payload, {
          _sender: p.redeemer,
          tx: {
            to: contract.address,
            estimateGas: p.estimateGas,
          },
          onSent: function () {},
          onSuccess: function (result) {
            if (p.estimateGas) {
              result = new BigNumber(result, 16);
              gasEstimates.feeWindowRedeem.push({address: contract.address, estimate: result });
              gasEstimates.totals.feeWindowRedeem = gasEstimates.totals.feeWindowRedeem.plus(result);
            } else {
              successfulTransactions.feeWindowRedeem.push(contract.address);
            }
            console.log("Redeemed feeWindow", contract.address);
            nextContract();
          },
          onFailed: function () {
            failedTransactions.feeWindowRedeem.push(contract.address);
            console.log("Failed to redeem feeWindow", contract.address);
            nextContract();
          },
        }));
        break;
      case contractTypes.DISPUTE_CROWDSOURCER:
        if (p.forkedMarket.state === FORKED_MARKET_STATE.NONE || p.forkedMarket.state === FORKED_MARKET_STATE.UNRESOLVED) {
          if (contract.marketIsForked) {
            console.log("Crowdsourcer " + contract.address + " with forked market should not be claimable when forkedMarket.state is none or not resolved.");
            failedTransactions.crowdsourcerRedeem.push(contract.address);
            nextContract();
          } else {
            api().DisputeCrowdsourcer.redeem(assign({}, payload, {
              _redeemer: p.redeemer,
              tx: {
                to: contract.address,
                estimateGas: p.estimateGas,
              },
              onSent: function () {},
              onSuccess: function (result) {
                if (p.estimateGas) {
                  result = new BigNumber(result, 16);
                  gasEstimates.crowdsourcerRedeem.push({address: contract.address, estimate: result });
                  gasEstimates.totals.crowdsourcerRedeem = gasEstimates.totals.crowdsourcerRedeem.plus(result);
                } else {
                  successfulTransactions.crowdsourcerRedeem.push(contract.address);
                }
                console.log("Redeemed crowdsourcer", contract.address);
                nextContract();
              },
              onFailed: function () {
                failedTransactions.crowdsourcerRedeem.push(contract.address);
                console.log("Failed to redeem crowdsourcer", contract.address);
                nextContract();
              },
            }));
          }
        } else {
          nextContract();
        }
        break;
      case contractTypes.INITIAL_REPORTER:
        if (p.forkedMarket.state === FORKED_MARKET_STATE.NONE || p.forkedMarket.state === FORKED_MARKET_STATE.UNRESOLVED) {
          if (contract.marketIsForked) {
            console.log("InitialReporter " + contract.address + " with forked market should not be claimable when forkedMarket.state is none or not resolved.");
            failedTransactions.initialReporterRedeem.push(contract.address);
            nextContract();
          } else {
            api().InitialReporter.redeem(assign({}, payload, {
              "": p.redeemer,
              tx: {
                to: contract.address,
                estimateGas: p.estimateGas,
              },
              onSent: function () {},
              onSuccess: function (result) {
                if (p.estimateGas) {
                  result = new BigNumber(result, 16);
                  gasEstimates.initialReporterRedeem.push({address: contract.address, estimate: result });
                  gasEstimates.totals.initialReporterRedeem = gasEstimates.totals.initialReporterRedeem.plus(result);
                } else {
                  successfulTransactions.initialReporterRedeem.push(contract.address);
                }
                console.log("Redeemed initialReporter", contract.address);
                nextContract();
              },
              onFailed: function () {
                failedTransactions.initialReporterRedeem.push(contract.address);
                console.log("Failed to redeemed initialReporter", contract.address);
                nextContract();
              },
            }));
          }
        } else {
          nextContract();
        }
        break;
      default:
        nextContract();
        break;
    }
  }, function () {
    var result = {
      successfulTransactions: successfulTransactions,
    };
    if (p.estimateGas) {
      gasEstimates.totals.all = gasEstimates.totals.disavowCrowdsourcers
                                .plus(gasEstimates.totals.migrateThroughOneFork)
                                .plus(gasEstimates.totals.crowdsourcerForkAndRedeem)
                                .plus(gasEstimates.totals.initialReporterForkAndRedeem)
                                .plus(gasEstimates.totals.feeWindowRedeem)
                                .plus(gasEstimates.totals.crowdsourcerRedeem)
                                .plus(gasEstimates.totals.initialReporterRedeem);
      result = {
        gasEstimates: gasEstimates,
      };
    }
    if (failedTransactions.disavowCrowdsourcers.length > 0 ||
        failedTransactions.migrateThroughOneFork.length > 0 ||
        failedTransactions.crowdsourcerForkAndRedeem.length > 0 ||
        failedTransactions.initialReporterForkAndRedeem.length > 0 ||
        failedTransactions.feeWindowRedeem.length > 0 ||
        failedTransactions.crowdsourcerRedeem > 0 ||
        failedTransactions.initialReporterRedeem > 0) {
      result.failedTransactions = failedTransactions;
      return p.onFailed(new Error("Not all transactions were successful.\n" + JSON.stringify(result)));
    }
    p.onSuccess(result);
  });
}

function redeemForkedMarketFees(p, payload, successfulTransactions, failedTransactions, gasEstimates) {
  var reportingParticipants =[];
  for (var i = 0; i < p.forkedMarket.crowdsourcers.length; i++) {
    reportingParticipants.push({
      address: p.forkedMarket.crowdsourcers[i].address,
      isForked: p.forkedMarket.crowdsourcers[i].isForked,
      type: contractTypes.DISPUTE_CROWDSOURCER,
    });
  }
  reportingParticipants.push({
    address: p.forkedMarket.initialReporter.address,
    isForked: p.forkedMarket.initialReporter.isForked,
    type: contractTypes.INITIAL_REPORTER,
  });

  async.eachLimit(reportingParticipants, PARALLEL_LIMIT, function (reportingParticipant, nextReportingParticipant) {
    if (reportingParticipant.type === contractTypes.DISPUTE_CROWDSOURCER) {
      if (!reportingParticipant.isForked) {
        api().DisputeCrowdsourcer.forkAndRedeem(assign({}, payload, {
          tx: {
            to: reportingParticipant.address,
            estimateGas: p.estimateGas,
          },
          onSent: function () {},
          onSuccess: function (result) {
            if (p.estimateGas) {
              result = new BigNumber(result, 16);
              gasEstimates.crowdsourcerForkAndRedeem.push({address: reportingParticipant.address, estimate: result });
              gasEstimates.totals.crowdsourcerForkAndRedeem = gasEstimates.totals.crowdsourcerForkAndRedeem.plus(result);
            } else {
              successfulTransactions.crowdsourcerForkAndRedeem.push(reportingParticipant.address);
            }
            console.log("Called forkAndRedeem on crowdsourcer", reportingParticipant.address);
            nextReportingParticipant();
          },
          onFailed: function () {
            failedTransactions.crowdsourcerForkAndRedeem.push(reportingParticipant.address);
            console.log("Failed to forkAndRedeem crowdsourcer", reportingParticipant.address);
            nextReportingParticipant();
          },
        }));
      } else {
        api().DisputeCrowdsourcer.redeem(assign({}, payload, {
          _redeemer: p.redeemer,
          tx: {
            to: reportingParticipant.address,
            estimateGas: p.estimateGas,
          },
          onSent: function () {},
          onSuccess: function (result) {
            if (p.estimateGas) {
              result = new BigNumber(result, 16);
              gasEstimates.crowdsourcerRedeem.push({address: reportingParticipant.address, estimate: result });
              gasEstimates.totals.crowdsourcerRedeem = gasEstimates.totals.crowdsourcerRedeem.plus(result);
            } else {
              successfulTransactions.crowdsourcerRedeem.push(reportingParticipant.address);
            }
            console.log("Redeemed crowdsourcer", reportingParticipant.address);
            nextReportingParticipant();
          },
          onFailed: function () {
            failedTransactions.crowdsourcerRedeem.push(reportingParticipant.address);
            console.log("Failed to redeem crowdsourcer", reportingParticipant.address);
            nextReportingParticipant();
          },
        }));
      }
    } else if (reportingParticipant.type === contractTypes.INITIAL_REPORTER) {
      if (!reportingParticipant.isForked) {
        api().InitialReporter.forkAndRedeem(assign({}, payload, {
          tx: {
            to: reportingParticipant.address,
            estimateGas: p.estimateGas,
          },
          onSent: function () {},
          onSuccess: function (result) {
            if (p.estimateGas) {
              result = new BigNumber(result, 16);
              gasEstimates.initialReporterForkAndRedeem.push({address: reportingParticipant.address, estimate: result });
              gasEstimates.totals.initialReporterForkAndRedeem = gasEstimates.totals.initialReporterForkAndRedeem.plus(result);
            } else {
              successfulTransactions.initialReporterForkAndRedeem.push(reportingParticipant.address);
            }
            console.log("Called forkAndRedeem on initialReporter", reportingParticipant.address);
            nextReportingParticipant();
          },
          onFailed: function () {
            failedTransactions.initialReporterForkAndRedeem.push(reportingParticipant.address);
            console.log("Failed to forkAndRedeem initialReporter", reportingParticipant.address);
            nextReportingParticipant();
          },
        }));
      } else {
        api().InitialReporter.redeem(assign({}, payload, {
          "": p.redeemer,
          tx: {
            to: reportingParticipant.address,
            estimateGas: p.estimateGas,
          },
          onSent: function () {},
          onSuccess: function (result) {
            if (p.estimateGas) {
              result = new BigNumber(result, 16);
              gasEstimates.initialReporterRedeem.push({address: reportingParticipant.address, estimate: result });
              gasEstimates.totals.initialReporterRedeem = gasEstimates.totals.initialReporterRedeem.plus(result);
            } else {
              successfulTransactions.initialReporterRedeem.push(reportingParticipant.address);
            }
            console.log("Redeemed initialReporter", reportingParticipant.address);
            nextReportingParticipant();
          },
          onFailed: function () {
            failedTransactions.initialReporterRedeem.push(reportingParticipant.address);
            console.log("Failed to redeemed initialReporter", reportingParticipant.address);
            nextReportingParticipant();
          },
        }));
      }
    }
  }, function () {
    redeemNonForkedMarketFees(p, payload, successfulTransactions, failedTransactions, gasEstimates);
  });
}

/**
 * TODO: Add updated JSDoc info for input/returned values.
 *
 * Claims all reporting fees for a user as follows:
 *
 * If no Fork has occurred in the Universe:
 *   Call `augur.api.DisputeCrowdsourcer.redeem` on all non-Forked Market DisputeCrowdsourcers.
 *   Call `augur.api.InitialReporter.redeem` on all non-Forked Market InitialReporters.
 *
 * If the Universe has a Forked Market that has not been resolved:
 *   Call `augur.api.Market.disavowCrowdsourcers` on all non-Forked Markets that have not been disavowed.
 *   Call `augur.api.DisputeCrowdsourcer.redeem` on all DisputeCrowdsourcers for non-Forked Markets.
 *   Call `augur.api.InitialReporter.redeem` on all InitialReporters for non-Forked Markets.
 *   Do not attempt to redeem DisputeCrowdsourcers or InitialReporter for Forked Market.
 *
 * If a Forked Market exists in the Universe and has been resolved:
 *   Call `augur.api.Market.migrateThroughOneFork` on all non-Forked Markets.
 *   Call `augur.api.DisputeCrowdsourcer.forkAndRedeem` on Forked Market's Crowdsourcers.
 *   Call `augur.api.InitialReporter.forkAndRedeem` on Forked Market's InitialReporter.
 */
function claimReportingFees(p) {
  var payload = immutableDelete(p, ["redeemer", "feeWindows", "forkedMarket", "nonForkedMarkets", "estimateGas", "onSent", "onSuccess", "onFailed"]);
  var successfulTransactions = {
    disavowCrowdsourcers: [],
    migrateThroughOneFork: [],
    crowdsourcerForkAndRedeem: [],
    initialReporterForkAndRedeem: [],
    feeWindowRedeem: [],
    crowdsourcerRedeem: [],
    initialReporterRedeem: [],
  };
  var failedTransactions = {
    disavowCrowdsourcers: [],
    migrateThroughOneFork: [],
    crowdsourcerForkAndRedeem: [],
    initialReporterForkAndRedeem: [],
    feeWindowRedeem: [],
    crowdsourcerRedeem: [],
    initialReporterRedeem: [],
  };
  var gasEstimates = {
    disavowCrowdsourcers: [],
    migrateThroughOneFork: [],
    crowdsourcerForkAndRedeem: [],
    initialReporterForkAndRedeem: [],
    feeWindowRedeem: [],
    crowdsourcerRedeem: [],
    initialReporterRedeem: [],
    totals: {
      disavowCrowdsourcers: new BigNumber(0),
      migrateThroughOneFork: new BigNumber(0),
      crowdsourcerForkAndRedeem: new BigNumber(0),
      initialReporterForkAndRedeem: new BigNumber(0),
      feeWindowRedeem: new BigNumber(0),
      crowdsourcerRedeem: new BigNumber(0),
      initialReporterRedeem: new BigNumber(0),
      all: new BigNumber(0),
    },
  };

  if (p.forkedMarket.state === FORKED_MARKET_STATE.UNRESOLVED || p.forkedMarket.state === FORKED_MARKET_STATE.RESOLVED) {
    async.eachLimit(p.nonForkedMarkets, PARALLEL_LIMIT, function (nonForkedMarket, nextNonforkedMarket) {
      if (p.forkedMarket.state === FORKED_MARKET_STATE.UNRESOLVED) {
        if (!nonForkedMarket.disavowed) {
          api().Market.disavowCrowdsourcers(assign({}, payload, {
            tx: {
              to: nonForkedMarket.address,
              estimateGas: p.estimateGas,
            },
            onSent: function () {},
            onSuccess: function (result) {
              if (p.estimateGas) {
                result = new BigNumber(result, 16);
                gasEstimates.disavowCrowdsourcers.push({address: nonForkedMarket.address, estimate: result });
                gasEstimates.totals.disavowCrowdsourcers = gasEstimates.totals.disavowCrowdsourcers.plus(result);
              }
              successfulTransactions.disavowCrowdsourcers.push(nonForkedMarket.address);
              console.log("Disavowed crowdsourcers for market", nonForkedMarket.address);
              nextNonforkedMarket();
            },
            onFailed: function () {
              failedTransactions.disavowCrowdsourcers.push(nonForkedMarket.address);
              console.log("Failed to disavow crowdsourcers for", nonForkedMarket.address);
              nextNonforkedMarket();
            },
          }));
        } else {
          nextNonforkedMarket();
        }
      } else if (p.forkedMarket.state === FORKED_MARKET_STATE.RESOLVED) {
        if (!nonForkedMarket.isMigrated) {
          api().Market.migrateThroughOneFork({
            tx: {
              to: nonForkedMarket.address,
              estimateGas: p.estimateGas,
            },
            onSent: function () {},
            onSuccess: function (result) {
              if (p.estimateGas) {
                result = new BigNumber(result, 16);
                gasEstimates.migrateThroughOneFork.push({address: nonForkedMarket.address, estimate: result });
                gasEstimates.totals.migrateThroughOneFork = gasEstimates.totals.migrateThroughOneFork.plus(result);
              }
              successfulTransactions.migrateThroughOneFork.push(nonForkedMarket.address);
              console.log("Migrated market through one fork:", nonForkedMarket.address);
              nextNonforkedMarket();
            },
            onFailed: function () {
              failedTransactions.migrateThroughOneFork.push(nonForkedMarket.address);
              console.log("Failed to migrate market through one fork:", nonForkedMarket.address);
              nextNonforkedMarket();
            },
          });
        }
      }
    }, function () {
      if (p.forkedMarket.state === FORKED_MARKET_STATE.RESOLVED) {
        redeemForkedMarketFees(p, payload, successfulTransactions, failedTransactions, gasEstimates);
      } else {
        redeemNonForkedMarketFees(p, payload, successfulTransactions, failedTransactions, gasEstimates);
      }
    });
  } else {
    redeemNonForkedMarketFees(p, payload, successfulTransactions, failedTransactions, gasEstimates);
  }
}

module.exports = claimReportingFees;
