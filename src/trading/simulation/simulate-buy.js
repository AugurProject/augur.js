"use strict";

var simulateMakeBidOrder = require("./simulate-make-bid-order");
var simulateTakeAskOrder = require("./simulate-take-ask-order");
var sumSimulatedResults = require("./sum-simulated-results");
var filterByPriceAndOutcomeAndUserSortByPrice = require("../order-book/filter-by-price-and-outcome-and-user-sort-by-price");
var calculateSettlementFee = require("./calculate-settlement-fee");
var constants = require("../../constants");
var PRECISION = constants.PRECISION;
var ZERO = constants.ZERO;

function simulateBuy(outcome, sharesToCover, shareBalances, tokenBalance, userAddress, minPrice, maxPrice, price, marketCreatorFeeRate, reportingFeeRate, shouldCollectReportingFees, sellOrderBook) {
  var simulatedBuy = {
    maxSettlementFees: ZERO,
    settlementFees: ZERO,
    gasFees: ZERO,
    sharesDepleted: ZERO,
    otherSharesDepleted: ZERO,
    tokensDepleted: ZERO,
    shareBalances: shareBalances
  };
  var matchingSortedAsks = filterByPriceAndOutcomeAndUserSortByPrice(sellOrderBook, 0, price, userAddress);

  // if no matching asks, then user is bidding: no settlement fees
  if (!matchingSortedAsks.length) {
    simulatedBuy = sumSimulatedResults(simulatedBuy, simulateMakeBidOrder(sharesToCover, price, minPrice, outcome, shareBalances));

  // if there are matching asks, user is buying
  } else {
    var simulatedTakeAskOrder = simulateTakeAskOrder(sharesToCover, minPrice, maxPrice, marketCreatorFeeRate, reportingFeeRate, shouldCollectReportingFees, matchingSortedAsks, outcome, shareBalances);
    simulatedBuy = sumSimulatedResults(simulatedBuy, simulatedTakeAskOrder);
    if (simulatedTakeAskOrder.sharesToCover.gt(PRECISION.zero)) {
      simulatedBuy = sumSimulatedResults(simulatedBuy, simulateMakeBidOrder(simulatedTakeAskOrder.sharesToCover, price, minPrice, outcome, shareBalances));
    }
  }


  // Worst-case settlement fee for the buyer is if they buy at minPrice
  simulatedBuy.maxSettlementFees = calculateSettlementFee(sharesToCover, marketCreatorFeeRate, maxPrice.minus(minPrice), shouldCollectReportingFees, reportingFeeRate, minPrice);

  return simulatedBuy;
}

module.exports = simulateBuy;
