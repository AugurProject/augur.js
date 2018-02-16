#!/usr/bin/env node

"use strict";

var chalk = require("chalk");
var Augur = require("../../src");
var approveAugurEternalApprovalValue = require("../dp/lib/approve-augur-eternal-approval-value");
var getPrivateKey = require("../dp/lib/get-private-key").getPrivateKey;
var connectionEndpoints = require("../connection-endpoints");
var createOrder = require("../dp/lib/create-order");

var marketID = process.argv[2];

var augur = new Augur();

getPrivateKey(null, function (err, auth) {
  if (err) {
    console.error("getPrivateKey failed:", err);
    process.exit(1);
  }
  augur.connect(connectionEndpoints, function (err) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(chalk.cyan.dim("networkID:"), chalk.cyan(augur.rpc.getNetworkID()));
    var universe = augur.contracts.addresses[augur.rpc.getNetworkID()].Universe;
    console.log(chalk.green.dim("universe:"), chalk.green(universe));
    approveAugurEternalApprovalValue(augur, auth.address, auth, function (err) {
      if (err) {
        console.error("Could not approve ...", err);
        process.exit(1);
      }
      augur.markets.getMarketsInfo({ marketIDs: [marketID] }, function (err, marketsInfo) {
        if (err) {
          console.error("Could not get markets Info", err);
          process.exit(1);
        }
        if (!marketsInfo || marketsInfo.length === 0) return console.error("Market not found");
        var marketInfo = marketsInfo[0];
        if (!marketInfo) {
          console.error("Could not get markets Info", err);
          process.exit(1);
        }
        console.log(chalk.yellow.dim("Market:"), chalk.yellow(marketInfo.id));
        console.log(chalk.yellow.dim("outcomes:"), chalk.yellow(marketInfo.numOutcomes));

        // Create bids/asks on each outcome around a midpoint
        for (var outcomeI = 0; outcomeI < marketInfo.numOutcomes; outcomeI++) {
          console.log(chalk.yellow.dim("outcome:"), chalk.yellow(outcomeI));
          console.log(chalk.yellow.dim("max price:"), chalk.yellow(marketInfo.maxPrice));
          console.log(chalk.yellow.dim("min price:"), chalk.yellow(marketInfo.minPrice));

          var numberOfOrders = 50;
          var sharesPerOrder = 10;

          // Get these to numbers
          var tickSize = parseFloat(marketInfo.tickSize, 10);
          var numTicks = parseFloat(marketInfo.numTicks, 10);

          var midPoint = (Math.random() * (marketInfo.maxPrice - marketInfo.minPrice) + marketInfo.minPrice);
          midPoint = Math.ceil((midPoint - (midPoint % tickSize)) * numTicks) / numTicks;

          // Create Bids
          var bidPriceIncrease = (midPoint - marketInfo.minPrice) / numberOfOrders;
          bidPriceIncrease = Math.abs(bidPriceIncrease < tickSize ? tickSize : Math.ceil((bidPriceIncrease - (bidPriceIncrease % tickSize)) * numTicks) / numTicks);

          var bidPrice = marketInfo.minPrice === 0 ? marketInfo.minPrice + bidPriceIncrease : marketInfo.minPrice;

          while (bidPrice < midPoint) {
            var order = {
              price: bidPrice,
              shares: sharesPerOrder
            };

            console.log(chalk.yellow.dim("bid:"), chalk.yellow(JSON.stringify(order)));
            createOrder(augur, marketID, outcomeI, marketInfo.numOutcomes, marketInfo.maxPrice, marketInfo.minPrice, marketInfo.numTicks, "buy", order, auth, function (err, res) {
              if (err) console.error("create-orders failed:", err);
              console.log(chalk.green.dim("Order Created"), chalk.green(JSON.stringify(res)));
            });
            bidPrice += bidPriceIncrease
            bidPrice = Math.ceil((bidPrice - (bidPrice % tickSize)) * numTicks) / numTicks
          }

          // Create Asks
          var askPriceIncrease = (marketInfo.maxPrice - midPoint) / numberOfOrders;
          askPriceIncrease = Math.abs(askPriceIncrease < tickSize ? tickSize : Math.ceil((askPriceIncrease - (askPriceIncrease % tickSize)) * numTicks) / numTicks);

          var askPrice = midPoint + tickSize

          while (askPrice < marketInfo.maxPrice) {
            var order = {
              price: askPrice,
              shares: sharesPerOrder
            };
            console.log(chalk.yellow.dim("ask:"), chalk.yellow(JSON.stringify(order)));
            createOrder(augur, marketID, outcomeI, marketInfo.numOutcomes, marketInfo.maxPrice, marketInfo.minPrice, marketInfo.numTicks, "sell", order, auth, function (err, res) {
              if (err) console.error("create-orders failed:", err);
              console.log(chalk.green.dim("Order Created"), chalk.green(JSON.stringify(res)));
            });
            askPrice += askPriceIncrease
            askPrice = Math.ceil((askPrice - (askPrice % tickSize)) * numTicks) / numTicks;
          }
        }
      });
    });
  });
});
