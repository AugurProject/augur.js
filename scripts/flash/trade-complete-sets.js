#!/usr/bin/env node

"use strict";

var chalk = require("chalk");
var speedomatic = require("speedomatic");

function help() {
  console.log(chalk.red("Puts cash on the next fee window"));
  console.log(chalk.red("Shows balances on the next fee window"));
}

function showCashBalance(augur, address, callback) {
  augur.api.Cash.balanceOf({ _owner: address }, function (err, cashBalance) {
    if (err) {
      console.log(chalk.red(err));
      return callback(err);
    }
    var bnCashBalance = speedomatic.bignum(cashBalance);
    var totalCashBalance = speedomatic.unfix(bnCashBalance, "string");
    console.log(chalk.green.dim("Total Cash balance:"), chalk.green(totalCashBalance));
    callback(null);
  });
}

function publicSellCompleteSets(augur, contract, marketId, amount, auth, callback) {
  augur.rpc.eth.getBalance([address, "latest"], function (err, attoEthBalance) {
    if (err) {
      console.log(chalk.red(err));
      return callback(err);
    }
    var bnCashBalance = speedomatic.bignum(attoEthBalance);
    var totalCashBalance = speedomatic.unfix(bnCashBalance, "string");
    console.log(chalk.green.dim("Total ETH balance:"), chalk.green(totalCashBalance));
    callback(null);
  });
}

function publicBuyCompleteSets(augur, contract, marketId, amount, auth, callback) {
  augur.api.CompleteSets.publicBuyCompleteSets({ tx: { to: universe } }, function (err, reputationTokenAddress) {
  showCashBalance(augur, address, label, function (err) {
    if (err) {
      console.log(chalk.red(err));
    }
    showEthBalance(augur, address, label, callback);
  });
}

function getFirstMarket(augur, universe, marketId, callback) {
  augur.markets.getMarkets({ universe: universe, limit: 1 }, function (err, marketIds) {
    if (marketIds.length === 0) return callback("No markets found");
    var getMarketId = marketId || marketIds[0];
    augur.markets.getMarketsInfo({ marketIds: [getMarketId] }, function (err, marketsInfo) {
      if (err) {
        console.log(chalk.red(err));
        return callback(err);
      }
      if (marketsInfo.length === 0) return callback("Market Info not found");
      return callback(marketsInfo[0]);
    });
  });
}

function tradeCompleteSets(augur, args, auth, callback) {
  if (args === "help" || args.opt.help) {
    help();
    return callback(null);
  }
  var universe = augur.contracts.addresses[augur.rpc.getNetworkID()].Universe;
  var completeSets = augur.contracts.addresses[augur.rpc.getNetworkID()].CompleteSets;
  var amount = args.opt.amount;
  var marketId = args.opt.marketId;
  console.log(chalk.cyan.dim("universe:"), chalk.green(universe));
  console.log(chalk.cyan.dim("marketId:"), chalk.green(marketId));
  console.log(chalk.cyan.dim("amount:"), chalk.green(amount));

  getFirstMarket(augur, universe, marketId, function (err, market) {
    if (err) {
      console.log(chalk.red(err));
      return callback(err);
    }
    var numTicks = market.numTicks;
    publicBuyCompleteSets(augur, completeSets, market.id, amount, auth, function (err, result) {
      if (err) {
        console.log(chalk.red(err));
        return callback(err);
      }
      if (!result) callback("Complete Sets Buy failed");
      publicSellCompleteSets(augur, completeSets, market.id, amount, auth, function (err, result) {
        if (err) {
          console.log(chalk.red(err));
          return callback(err);
        }
        if (!result) callback("Complete Sets Sell failed");
        augur.api.Universe.getNextFeeWindow({ tx: { to: universe } }, function (err, nextFeeWindow) {
          if (err) {
            console.log(chalk.red(err));
            return callback(err);
          }
          showCashBalance(augur, nextFeeWindow, callback);
        });
      });
    });
  });
}

module.exports = tradeCompleteSets;
