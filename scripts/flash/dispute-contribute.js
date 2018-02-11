#!/usr/bin/env node

"use strict";

var chalk = require("chalk");
var getTime = require("./get-timestamp");
const { getPrivateKeyFromString } = require("../dp/lib/get-private-key");
const repFaucet = require("../rep-faucet");
var BigNumber = require("bignumber.js");
var displayTime = require("./display-time");
var setTimestamp = require("./set-timestamp");

const day = 108000; // day

function disputeContributeInternal(augur, marketID, outcome, amount, disputerAuth, invalid, auth, callback) {
  repFaucet(augur, disputerAuth, function (err) {
    if (err) { console.log(chalk.red("Error"), chalk.red(err)); callback(err); }
    if (err) return console.error(err);
    if (!invalid) { invalid = false; } else { invalid = true; }
    augur.markets.getMarketsInfo({ marketIDs: [marketID] }, function (err, marketsInfo) {
      var market = marketsInfo[0];
      var marketPayload = { tx: { to: marketID } };
      augur.api.Market.getFeeWindow(marketPayload, function (err, feeWindowId) {
        var feeWindowPayload = { tx: { to: feeWindowId } };
        augur.api.FeeWindow.getStartTime(feeWindowPayload, function (err, feeWindowStartTime) {
          getTime(augur, auth, function (timeResult) {
            var setTime = parseInt(feeWindowStartTime, 10) + day;
            displayTime("Current timestamp", timeResult.timestamp);
            displayTime("Fee Window end time", feeWindowStartTime);
            displayTime("Set Time to", setTime);
            setTimestamp(augur, setTime, timeResult.timeAddress, auth, function () {
              var numTicks = market.numTicks;
              var payoutNumerators = Array(market.numOutcomes).fill(0);
              payoutNumerators[outcome] = numTicks;
              var bnAmount = new BigNumber(amount, 10).toFixed();
              console.log(chalk.yellow("sending amount REP"), chalk.yellow(bnAmount));
              augur.api.FeeWindow.isActive(feeWindowPayload, function (err, result) {
                console.log(chalk.green.dim("Few Window is active"), chalk.green(result));
                if (result) {
                  augur.api.Market.contribute({
                    meta: disputerAuth,
                    tx: { to: marketID  },
                    _payoutNumerators: payoutNumerators,
                    _invalid: invalid,
                    _amount: bnAmount,
                    onSent: function (result) {
                      console.log(chalk.yellow.dim("Sent Dispute:"), chalk.yellow(JSON.stringify(result)));
                      console.log(chalk.yellow.dim("Waiting for reply ...."));
                    },
                    onSuccess: function (result) {
                      console.log(chalk.green.dim("Success Dispute:"), chalk.green(JSON.stringify(result)));
                      callback(null);
                    },
                    onFailed: function (result) {
                      console.log(chalk.red.dim("Failed Dispute:"), chalk.red(JSON.stringify(result)));
                      callback(result);
                    },
                  });
                } else {
                  console.log(chalk.red("Fee Window isn't active"));
                }
              });
            });
          });
        });
      });
    });
  });
}

function help(callback) {
  console.log(chalk.red("params syntax -->  params=marketID,0,amount,<user priv key>,false"));
  console.log(chalk.red("parameter 1: marketID is needed"));
  console.log(chalk.red("parameter 2: outcome is needed"));
  console.log(chalk.red("parameter 3: amount of REP is needed"));
  console.log(chalk.red("parameter 4: user priv key is needed"));
  console.log(chalk.red("parameter 5: invalid is optional, default is false"));
  console.log(chalk.yellow("user will be give REP if balance is 0"));
  callback(null);
}

function disputeContribute(augur, params, auth, callback) {
  if (!params || params === "help" || params.split(",").length < 3) {
    help(callback);
  } else {
    console.log(params);
    var paramArray = params.split(",");
    var marketID = paramArray[0];
    var outcomeId = paramArray[1];
    var amount = paramArray[2];
    var userAuth = getPrivateKeyFromString(paramArray[3]);
    var invalid = paramArray.length === 5 ? paramArray[4] : false;
    console.log(chalk.yellow.dim("marketID"), marketID);
    console.log(chalk.yellow.dim("outcomeId"), outcomeId);
    console.log(chalk.yellow.dim("amount"), amount);
    console.log(chalk.yellow.dim("reporter"), userAuth.address);
    console.log(chalk.yellow.dim("owner"), auth.address);
    console.log(chalk.yellow.dim("invalid"), invalid);
    disputeContributeInternal(augur, marketID, outcomeId, amount, userAuth, invalid, auth, callback);
  }
}

module.exports = disputeContribute;