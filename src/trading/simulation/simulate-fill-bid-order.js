"use strict";

var BigNumber = require("bignumber.js");
var calculateSettlementFee = require("./calculate-settlement-fee");
var constants = require("../../constants");
var PRECISION = constants.PRECISION;
var ZERO = constants.ZERO;

function simulateFillBidOrder(sharesToCover, minPrice, maxPrice, marketCreatorFeeRate, reportingFeeRate, shouldCollectReportingFees, matchingSortedBids, outcome, shareBalances) {
  var numOutcomes = shareBalances.length;
  if (outcome < 0 || outcome >= numOutcomes) throw new Error("Invalid outcome ID");
  if (sharesToCover.lte(PRECISION.zero)) throw new Error("Number of shares is too small");
  var settlementFees = ZERO;
  var gasFees = ZERO;
  var makerSharesDepleted = ZERO;
  var makerTokensDepleted = ZERO;
  var takerSharesDepleted = ZERO;
  var takerTokensDepleted = ZERO;
  var tradesCompleted = 0;
  matchingSortedBids.forEach(function (matchingBid) {
    var takerDesiredSharesForThisOrder = BigNumber.min(new BigNumber(matchingBid.amount, 10), sharesToCover);
    var orderDisplayPrice = new BigNumber(matchingBid.fullPrecisionPrice, 10);
    var sharePriceShort = maxPrice.minus(orderDisplayPrice);
    var sharePriceLong = orderDisplayPrice.minus(minPrice);
    var makerSharesEscrowed = BigNumber.min(new BigNumber(matchingBid.sharesEscrowed, 10), sharesToCover);
    sharesToCover = sharesToCover.minus(takerDesiredSharesForThisOrder);
    var takerSharesAvailable = BigNumber.min(takerDesiredSharesForThisOrder, shareBalances[outcome]);

    // maker is closing a short, taker is closing a long: complete sets sold
    if (makerSharesEscrowed.gt(PRECISION.zero) && takerSharesAvailable.gt(PRECISION.zero)) {
      var completeSets = BigNumber.min(makerSharesEscrowed, takerSharesAvailable);
      settlementFees = settlementFees.plus(calculateSettlementFee(completeSets, marketCreatorFeeRate, maxPrice.minus(minPrice), shouldCollectReportingFees, reportingFeeRate, sharePriceLong));
      makerSharesDepleted = makerSharesDepleted.plus(completeSets);
      takerSharesDepleted = takerSharesDepleted.plus(completeSets);
      takerSharesAvailable = takerSharesAvailable.minus(completeSets);
      makerSharesEscrowed = makerSharesEscrowed.minus(completeSets);
      takerDesiredSharesForThisOrder = takerDesiredSharesForThisOrder.minus(completeSets);
      tradesCompleted++;
    }

    // maker is closing a short, taker is opening a short
    if (makerSharesEscrowed.gt(PRECISION.zero) && takerDesiredSharesForThisOrder.gt(PRECISION.zero)) {
      var tokensRequiredToCoverTaker = makerSharesEscrowed.times(sharePriceShort);
      makerSharesDepleted = makerSharesDepleted.plus(makerSharesEscrowed);
      takerTokensDepleted = takerTokensDepleted.plus(tokensRequiredToCoverTaker);
      takerDesiredSharesForThisOrder = takerDesiredSharesForThisOrder.minus(makerSharesEscrowed);
      makerSharesEscrowed = ZERO;
      tradesCompleted++;
    }

    // maker is opening a long, taker is closing a long
    if (takerSharesAvailable.gt(PRECISION.zero) && takerDesiredSharesForThisOrder.gt(PRECISION.zero)) {
      var tokensRequiredToCoverMaker = takerSharesAvailable.times(sharePriceLong);
      makerTokensDepleted = makerTokensDepleted.plus(tokensRequiredToCoverMaker);
      takerSharesDepleted = takerSharesDepleted.plus(takerSharesAvailable);
      takerDesiredSharesForThisOrder = takerDesiredSharesForThisOrder.minus(takerSharesAvailable);
      takerSharesAvailable = ZERO;
      tradesCompleted++;
    }

    // maker is opening a long, taker is opening a short
    if (takerDesiredSharesForThisOrder.gt(PRECISION.zero)) {
      var takerPortionOfCompleteSetCost = takerDesiredSharesForThisOrder.times(sharePriceShort);
      var makerPortionOfCompleteSetCost = takerDesiredSharesForThisOrder.times(sharePriceLong);
      makerTokensDepleted = makerTokensDepleted.plus(makerPortionOfCompleteSetCost);
      takerTokensDepleted = takerTokensDepleted.plus(takerPortionOfCompleteSetCost);
      takerDesiredSharesForThisOrder = ZERO;
      tradesCompleted++;
    }
  });
  shareBalances[outcome] = shareBalances[outcome].minus(takerSharesDepleted);
  return {
    sharesToCover: sharesToCover,
    settlementFees: settlementFees,
    worstCaseFees: settlementFees,
    gasFees: gasFees,
    sharesDepleted: takerSharesDepleted,
    tokensDepleted: takerTokensDepleted,
    shareBalances: shareBalances,
    tradesCompleted: tradesCompleted,
  };
}

module.exports = simulateFillBidOrder;
