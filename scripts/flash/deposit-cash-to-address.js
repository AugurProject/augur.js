#!/usr/bin/env node

"use strict";
var chalk = require("chalk");
var speedomatic = require("speedomatic");

function showCashBalance(augur, address, callback) {
  augur.api.Cash.balanceOf({ _owner: address }, function (err, cashBalance) {
    if (err) {
      console.log(chalk.red(err));
      return callback(err);
    }
    var bnCashBalance = speedomatic.bignum(cashBalance);
    var totalCashBalance = speedomatic.unfix(bnCashBalance, "string");
    console.log("Cash:", chalk.green(totalCashBalance));
    callback(null);
  });
}

function getNextFeeWindow(augur, universe, auth, callback) {
  augur.api.Universe.getOrCreateNextFeeWindow({
    meta: auth,
    tx: { to: universe },
    onSent: result => {
      console.log("Deposit Cash to address:", JSON.stringify(result));
    },
    onSuccess: function (result) {
      callback(null, result.callReturn);
    },
    onFailed: function (result) {
      console.log("Failed Deposit:", JSON.stringify(result));
      callback(result);
    },
  });
}

function getCurrentFeeWindow(augur, universe, callback) {
  augur.api.Universe.getCurrentFeeWindow({ tx: { to: universe } }, function (err, feeWindow) {
    if (err) {
      console.log(chalk.red(err));
      return callback(err);
    }
    callback(err, feeWindow);
  });
}

function help() {
  console.log(chalk.red("deposit-cash, will simply deposits the amount of CASH givn in ETH on the address provided"));
  console.log(chalk.red("default address is next fee window"));
  console.log(chalk.red("default amount is 1 ETH"));
}

function depositCashToAddress(augur, args, auth, callback) {
  if (args === "help" || args.opt.help) {
    help();
    return callback(null);
  }

  var address = args.opt.address;
  var amount = args.opt.amount || 1000000000000000000;
  var currentFeeWindowFlag = args.opt.current;
  var nextFeeWindowFlag = args.opt.next;
  var cash = augur.contracts.addresses[augur.rpc.getNetworkID()].Cash;
  var universe = augur.contracts.addresses[augur.rpc.getNetworkID()].Universe;

  getNextFeeWindow(augur, universe, auth, (err, nextFeeWindow) => {
    if (err) {
      console.log(chalk.red(err));
      return callback(err);
    }
    getCurrentFeeWindow(augur, universe, (err, currentFeeWindow) => {
      if (err) {
        console.log(chalk.red(err));
        return callback(err);
      }
      console.log("next fee window", nextFeeWindow);
      console.log("current fee window", currentFeeWindow);

      const fw = currentFeeWindowFlag ? currentFeeWindow : nextFeeWindow;
      const nfw = nextFeeWindowFlag ? nextFeeWindow : fw;
      const feeWindow = address ? address : nfw;

      console.log(chalk.green.dim("address:"), chalk.green(feeWindow));
      console.log(chalk.green.dim("amount:"), chalk.green(amount));

      var cashPayload = {
        meta: auth,
        tx: { to: cash, value: augur.utils.convertBigNumberToHexString(amount) },
        _to: feeWindow,
        onSent: result => {
          console.log(chalk.yellow.dim("Deposit Cash to address:"), chalk.yellow(JSON.stringify(result)));
          console.log(chalk.yellow.dim("Waiting for reply ...."));
        },
        onSuccess: function (result) {
          console.log(chalk.green.dim("Success Deposited:"), chalk.green(JSON.stringify(result)));
          showCashBalance(augur, feeWindow, function (err) {
            if (err) {
              console.log(chalk.red(err));
              return callback(JSON.stringify(err));
            }
            callback(null);
          });
        },
        onFailed: function (result) {
          console.log(chalk.red.dim("Failed Deposit:"), chalk.red(JSON.stringify(result)));
          callback(result);
        },
      };

      augur.api.Cash.depositEtherFor(cashPayload);
    });
  });
}

module.exports = depositCashToAddress;
