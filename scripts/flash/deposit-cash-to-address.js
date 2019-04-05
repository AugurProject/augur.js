#!/usr/bin/env node

"use strict";

var chalk = require("chalk");

function help() {
  console.log(chalk.red("deposit-cash, will simply deposits the amount of CASH givn in ETH on the address provided"));
}

function depositCashToAddress(augur, args, auth, callback) {
  if (args === "help" || args.opt.help) {
    help();
    return callback(null);
  }

  var address = args.opt.address;
  var amount = args.opt.amount;
  var cash = augur.contracts.addresses[augur.rpc.getNetworkID()].Cash;
  console.log(chalk.green.dim("address:"), chalk.green(address));
  var cashPayload = {
    meta: auth,
    tx: { to: cash, value: augur.utils.convertBigNumberToHexString(amount) },
    _to: address,
    onSent: result => {
      console.log(chalk.yellow.dim("Deposit Cash to address:"), chalk.yellow(JSON.stringify(result)));
      console.log(chalk.yellow.dim("Waiting for reply ...."));
    },
    onSuccess: function (result) {
      console.log(chalk.green.dim("Success Deposited:"), chalk.green(JSON.stringify(result)));
      callback(null);
    },
    onFailed: function (result) {
      console.log(chalk.red.dim("Failed Deposit:"), chalk.red(JSON.stringify(result)));
      callback(result);
    },
  };

  augur.api.Cash.depositEtherFor(cashPayload);
}

module.exports = depositCashToAddress;
