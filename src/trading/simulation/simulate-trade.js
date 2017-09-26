"use strict";

/** Type definition for SingleOutcomeOrderBook.
 * @typedef {Object} SingleOutcomeOrderBook
 * @property {require("../order-book/get-order-book").SingleOutcomeOrderBookSide} buy Buy orders (bids) indexed by order ID.
 * @property {require("../order-book/get-order-book").SingleOutcomeOrderBookSide} sell Sell orders (asks) indexed by order ID.
 */

/** Type definition for MarketOrderBook.
 * @typedef {Object} MarketOrderBook
 * @property {SingleOutcomeOrderBook|undefined} 1 Full order book (buy and sell) for outcome 1 of this market.
 * @property {SingleOutcomeOrderBook|undefined} 2 Full order book (buy and sell) for outcome 2 of this market.
 * @property {SingleOutcomeOrderBook|undefined} 3 Full order book (buy and sell) for outcome 3 of this market.
 * @property {SingleOutcomeOrderBook|undefined} 4 Full order book (buy and sell) for outcome 4 of this market.
 * @property {SingleOutcomeOrderBook|undefined} 5 Full order book (buy and sell) for outcome 5 of this market.
 * @property {SingleOutcomeOrderBook|undefined} 6 Full order book (buy and sell) for outcome 6 of this market.
 * @property {SingleOutcomeOrderBook|undefined} 7 Full order book (buy and sell) for outcome 7 of this market.
 * @property {SingleOutcomeOrderBook|undefined} 8 Full order book (buy and sell) for outcome 8 of this market.
 */

/** Type definition for SimulatedTrade.
 * @typedef {Object} SimulatedTrade
 * @property {string} settlementFees Projected settlement fees paid on this trade, as a base-10 string.
 * @property {string} gasFees Projected gas fees paid on this trade, as a base-10 string.
 * @property {string} sharesDepleted Projected number of shares of the traded outcome spent on this trade, as a base-10 string.
 * @property {string} otherSharesDepleted Projected number of shares of the other (non-traded) outcomes spent on this trade, as a base-10 string.
 * @property {string} tokensDepleted Projected number of tokens spent on this trade, as a base-10 string.
 * @property {string[]} shareBalances Projected final balances after the trade is complete, as an array of base-10 strings.
 */

var BigNumber = require("bignumber.js");
var simulateBuy = require("./simulate-buy");
var simulateSell = require("./simulate-sell");

/**
 * Determine the sequence of makes/takes that will be executed to fill the specified order, and return the user's
 * projected balances and fees paid after this sequence is completed.
 * Note: simulateTrade automatically normalizes share prices, so "display prices" can be directly passed in
 * for minPrice, maxPrice, and price.
 * @param {Object} p Trade simulation parameters.
 * @param {number} p.orderType Order type (0 for "buy", 1 for "sell").
 * @param {number} p.outcome Outcome ID to trade, must be an integer value on [1, 8].
 * @param {string[]} p.shareBalances Number of shares the user owns of each outcome in ascending order, as an array of base-10 strings.
 * @param {string} p.tokenBalance Number of tokens (e.g., wrapped ether) the user owns, as a base-10 string.
 * @param {string} p.userAddress The user's Ethereum address, as a hexadecimal string.
 * @param {string} p.minPrice This market's minimum possible price, as a base-10 string.
 * @param {string} p.maxPrice This market's maximum possible price, as a base-10 string.
 * @param {string} p.price Limit price for this order (i.e. the worst price the user will accept), as a base-10 string.
 * @param {string} p.shares Number of shares to trade, as a base-10 string.
 * @param {string} p.marketCreatorFeeRate The fee rate charged by the market creator (e.g., pass in "0.01" if the fee is 1%), as a base-10 string.
 * @param {MarketOrderBook} p.marketOrderBook The full order book (buy and sell) for this market and outcome.
 * @param {boolean=} p.shouldCollectReportingFees False if reporting fees are not collected; this is rare and only occurs in disowned markets (default: true).
 * @return {SimulatedTrade} Projected fees paid, shares and tokens spent, and final balances after the trade is complete.
 */
function simulateTrade(p) {
  if (p.orderType !== 0 && p.orderType !== 1) throw new Error("Order type must be 1 (buy) or 2 (sell)");
  var sharesToCover = new BigNumber(p.shares, 10);
  var price = new BigNumber(p.price, 10);
  var tokenBalance = new BigNumber(p.tokenBalance, 10);
  var minPrice = new BigNumber(p.minPrice, 10);
  var maxPrice = new BigNumber(p.maxPrice, 10);
  var marketCreatorFeeRate = new BigNumber(p.marketCreatorFeeRate, 10);
  var reportingFeeRate = new BigNumber(p.reportingFeeRate, 10);
  var shouldCollectReportingFees = p.shouldCollectReportingFees === false ? 0 : 1;
  var shareBalances = p.shareBalances.map(function (shareBalance) { return new BigNumber(shareBalance, 10); });
  var simulatedTrade = p.orderType === 0 ?
    simulateBuy(p.outcome, sharesToCover, shareBalances, tokenBalance, p.userAddress, minPrice, maxPrice, price, marketCreatorFeeRate, reportingFeeRate, shouldCollectReportingFees, p.marketOrderBook.sell) :
    simulateSell(p.outcome, sharesToCover, shareBalances, tokenBalance, p.userAddress, minPrice, maxPrice, price, marketCreatorFeeRate, reportingFeeRate, shouldCollectReportingFees, p.marketOrderBook.buy);
  return {
    settlementFees: simulatedTrade.settlementFees.toFixed(),
    maxSettlementFees: simulatedTrade.maxSettlementFees.toFixed(),
    gasFees: simulatedTrade.gasFees.toFixed(),
    sharesDepleted: simulatedTrade.sharesDepleted.toFixed(),
    otherSharesDepleted: simulatedTrade.otherSharesDepleted.toFixed(),
    tokensDepleted: simulatedTrade.tokensDepleted.toFixed(),
    shareBalances: simulatedTrade.shareBalances.map(function (shareBalance) { return shareBalance.toFixed(); })
  };
}

module.exports = simulateTrade;
