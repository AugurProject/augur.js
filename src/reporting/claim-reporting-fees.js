"use strict";

var async = require("async");
var BigNumber = require("bignumber.js");
var immutableDelete = require("immutable-delete");
var assign = require("lodash.assign");
var api = require("../api");
var contractTypes = require("../constants").CONTRACT_TYPE;
var PARALLEL_LIMIT = require("../constants").PARALLEL_LIMIT;

function redeemContractFees(p, payload, successfulTransactions, failedTransactions, gasEstimates) {
  var redeemableContracts = [];
  var i;
  for (i = 0; i < p.feeWindows.length; i++) {
    redeemableContracts.push({
      address: p.feeWindows[i],
      type: contractTypes.FEE_WINDOW,
    });
  }
  if (p.forkedMarket) {
    if (p.forkedMarket.crowdsourcers) {
      for (i = 0; i < p.forkedMarket.crowdsourcers.length; i++) {
        redeemableContracts.push({
          address: p.forkedMarket.crowdsourcers[i].address,
          isForked: p.forkedMarket.crowdsourcers[i].isForked,
          marketIsForked: true,
          type: contractTypes.DISPUTE_CROWDSOURCER,
        });
      }
    }
    if (p.forkedMarket.initialReporter && p.forkedMarket.initialReporter.address) {
      redeemableContracts.push({
        address: p.forkedMarket.initialReporter.address,
        isForked: p.forkedMarket.initialReporter.isForked,
        marketIsForked: true,
        type: contractTypes.INITIAL_REPORTER,
      });
    }
  }
  for (i = 0; i < p.nonforkedMarkets.length; i++) {
    for (var j = 0; j < p.nonforkedMarkets[i].crowdsourcers.length; j++) {
      redeemableContracts.push({
        address: p.nonforkedMarkets[i].crowdsourcers[j],
        isFinalized: p.nonforkedMarkets[i].isFinalized,
        marketIsForked: false,
        type: contractTypes.DISPUTE_CROWDSOURCER,
      });
    }
    redeemableContracts.push({
      address: p.nonforkedMarkets[i].initialReporterAddress,
      isFinalized: p.nonforkedMarkets[i].isFinalized,
      marketIsForked: false,
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
        if (contract.marketIsForked && !contract.isForked) {
          api().DisputeCrowdsourcer.forkAndRedeem(assign({}, payload, {
            tx: {
              to: contract.address,
              estimateGas: p.estimateGas,
            },
            onSent: function () {},
            onSuccess: function (result) {
              if (p.estimateGas) {
                result = new BigNumber(result, 16);
                gasEstimates.crowdsourcerForkAndRedeem.push({address: contract.address, estimate: result });
                gasEstimates.totals.crowdsourcerForkAndRedeem = gasEstimates.totals.crowdsourcerForkAndRedeem.plus(result);
              } else {
                successfulTransactions.crowdsourcerForkAndRedeem.push(contract.address);
              }
              console.log("Forked and redeemed crowdsourcer", contract.address);
              nextContract();
            },
            onFailed: function () {
              failedTransactions.crowdsourcerForkAndRedeem.push(contract.address);
              console.log("Failed to forkAndRedeem crowdsourcer", contract.address);
              nextContract();
            },
          }));
        } else if ((contract.marketIsForked && contract.isForked) ||
                  (p.forkedMarket.isFinalized && !contract.marketIsForked && contract.isFinalized) ||
                  !p.forkedMarket.isFinalized) {
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
        } else {
          nextContract();
        }
        break;
      case contractTypes.INITIAL_REPORTER:
        if (contract.marketIsForked && !contract.isForked) {
          api().InitialReporter.forkAndRedeem(assign({}, payload, {
            tx: {
              to: contract.address,
              estimateGas: p.estimateGas,
            },
            onSent: function () {},
            onSuccess: function (result) {
              if (p.estimateGas) {
                result = new BigNumber(result, 16);
                gasEstimates.initialReporterForkAndRedeem.push({address: contract.address, estimate: result });
                gasEstimates.totals.initialReporterForkAndRedeem = gasEstimates.totals.initialReporterForkAndRedeem.plus(result);
              } else {
                successfulTransactions.initialReporterForkAndRedeem.push(contract.address);
              }
              console.log("Forked and redeemed initialReporter", contract.address);
              nextContract();
            },
            onFailed: function () {
              failedTransactions.initialReporterForkAndRedeem.push(contract.address);
              console.log("Failed to forkAndRedeem initialReporter", contract.address);
              nextContract();
            },
          }));
        } else if ((contract.marketIsForked && contract.isForked) ||
                  (p.forkedMarket.isFinalized && !contract.marketIsForked && contract.isFinalized) ||
                  !p.forkedMarket.isFinalized) {
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
              console.log("Failed to redeem initialReporter", contract.address);
              nextContract();
            },
          }));
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

/**
 * TODO: Add updated JSDoc info for input/returned values.
 *
 * Claims all reporting fees for a user as follows:
 *
 * If the specified universe has a forked market:
 *   Call `augur.api.DisputeCrowdsourcer.redeem` on redeemable DisputeCrowdsourcers of the forked market that have had their `fork` function called.
 *   Call `augur.api.DisputeCrowdsourcer.forkAndRedeem` on redeemable DisputeCrowdsourcers of the forked market that have not had their `fork` function called.
 *   Call `augur.api.InitialReporter.redeem` on the InitialReporter of the forked market if the InitialReporter is redeemable by the specified user address and has had its `fork` function called.
 *   Call `augur.api.InitialReporter.forkAndRedeem` on the InitialReporter of the forked market if the InitialReporter is redeemable by the specified user address and has not had its `fork` function called.
 *   If the forked market has been finalized:
 *     Call `augur.api.Market.migrateThroughOneFork` on all non-forked, non-finalized non-migrated markets.
 *     Call `augur.api.DisputeCrowdsourcer.redeem` on all redeemable DisputeCrowdsourcers for finalized non-forked markets.
 *     Call `augur.api.InitialReporter.redeem` on all redeemable InitialReporters for finalized non-forked markets.
 *   Else:
 *     Call `augur.api.Market.disavowCrowdsourcers` on all non-forked, non-finalized, non-disavowed markets.
 *     Call `augur.api.DisputeCrowdsourcer.redeem` on all redeemable DisputeCrowdsourcers for finalized/finalizable non-forked markets.
 *     Call `augur.api.InitialReporter.redeem` on all redeemable InitialReporters for finalized/finalizable non-forked markets.
 * Else:
 *   Call `augur.api.DisputeCrowdsourcer.redeem` on all redeemable DisputeCrowdsourcers for finalized/finalizable markets.
 *   Call `augur.api.InitialReporter.redeem` on all redeemable InitialReporters for finalized/finalizable markets.
 */
function claimReportingFees(p) {
  var payload = immutableDelete(p, ["redeemer", "feeWindows", "forkedMarket", "nonforkedMarkets", "estimateGas", "onSent", "onSuccess", "onFailed"]);
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

  if (p.forkedMarket && p.forkedMarket.address) {
    async.eachLimit(p.nonforkedMarkets, PARALLEL_LIMIT, function (nonforkedMarket, nextNonforkedMarket) {
      if (p.forkedMarket.isFinalized) {
        if (nonforkedMarket.isFinalized || nonforkedMarket.isMigrated) {
          nextNonforkedMarket();
        } else {
          api().Market.migrateThroughOneFork({
            tx: {
              to: nonforkedMarket.address,
              estimateGas: p.estimateGas,
            },
            onSent: function () {},
            onSuccess: function (result) {
              if (p.estimateGas) {
                result = new BigNumber(result, 16);
                gasEstimates.migrateThroughOneFork.push({address: nonforkedMarket.address, estimate: result });
                gasEstimates.totals.migrateThroughOneFork = gasEstimates.totals.migrateThroughOneFork.plus(result);
              }
              successfulTransactions.migrateThroughOneFork.push(nonforkedMarket.address);
              console.log("Migrated market through one fork:", nonforkedMarket.address);
              nextNonforkedMarket();
            },
            onFailed: function () {
              failedTransactions.migrateThroughOneFork.push(nonforkedMarket.address);
              console.log("Failed to migrate market through one fork:", nonforkedMarket.address);
              nextNonforkedMarket();
            },
          });
        }
      } else {
        if (nonforkedMarket.isFinalized || nonforkedMarket.crowdsourcersAreDisavowed) {
          nextNonforkedMarket();
        } else {
          api().Market.disavowCrowdsourcers(assign({}, payload, {
            tx: {
              to: nonforkedMarket.address,
              estimateGas: p.estimateGas,
            },
            onSent: function () {},
            onSuccess: function (result) {
              if (p.estimateGas) {
                result = new BigNumber(result, 16);
                gasEstimates.disavowCrowdsourcers.push({address: nonforkedMarket.address, estimate: result });
                gasEstimates.totals.disavowCrowdsourcers = gasEstimates.totals.disavowCrowdsourcers.plus(result);
              }
              successfulTransactions.disavowCrowdsourcers.push(nonforkedMarket.address);
              console.log("Disavowed crowdsourcers for market", nonforkedMarket.address);
              nextNonforkedMarket();
            },
            onFailed: function () {
              failedTransactions.disavowCrowdsourcers.push(nonforkedMarket.address);
              console.log("Failed to disavow crowdsourcers for", nonforkedMarket.address);
              nextNonforkedMarket();
            },
          }));
        }
      }
    }, function () {
      redeemContractFees(p, payload, successfulTransactions, failedTransactions, gasEstimates);
    });
  } else {
    redeemContractFees(p, payload, successfulTransactions, failedTransactions, gasEstimates);
  }
}

module.exports = claimReportingFees;
