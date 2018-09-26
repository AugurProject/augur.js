"use strict";

var isFunction = require("../utils/is-function");
var noop = require("../utils/noop");

function disconnectFromEthereum(ethrpc, callback) {
  if (!isFunction(callback)) callback = noop;
  ethrpc.disconnect(function (err) {
    if (err) return callback(err);
    callback(null);
  });
}

module.exports = disconnectFromEthereum;
