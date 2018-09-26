"use strict";

var disconnectFromEthereum = require("./disconnect-from-ethereum");

/**
 * @param callback {function=} Callback function.
 */
function disconnect(callback) {
  disconnectFromEthereum(function (err) {
    if (err) {
      console.warn("could not disconnect from ethereum-node at", JSON.stringify(connectOptions.ethereumNode), err);
      return null;
    }
    console.log("disconnected from ethereum");
  });
}

module.exports = disconnect;
