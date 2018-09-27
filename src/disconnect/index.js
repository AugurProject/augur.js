"use strict";

var ethrpc = require("ethrpc");
var disconnectFromEthereum = require("./disconnect-from-ethereum");

/**
 * @param callback {function=} Callback function.
 */
function disconnect(callback) {
  disconnectFromEthereum(ethrpc, function (err) {
    if (err) return callback(err);
    console.log("disconnected from ethereum");
    callback(null);
  });
}

module.exports = disconnect;
