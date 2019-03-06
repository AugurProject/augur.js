"use strict";

var augurNodeState = require("./state");
var dispatchJsonRpcResponse = require("./dispatch-json-rpc-response");
var AugurNodeHttpTransport = require("./AugurNodeHttpTransport");
var WsTransport = require("../rpc-interface").WsTransport;
function connect(augurNodeUrl, callback, useWebsocketToConnectAugurNode) {


  var innerCallback = function (err, transport) {
    if (err) return callback(err);
    augurNodeState.setTransport(transport);
    callback(null, transport);
  };

  if (typeof useWebsocketToConnectAugurNode === "undefined" || useWebsocketToConnectAugurNode) {
    new WsTransport(augurNodeUrl, 100, 0, {}, dispatchJsonRpcResponse, innerCallback);
  } else {
    new AugurNodeHttpTransport(augurNodeUrl, 100, 0, dispatchJsonRpcResponse, innerCallback);
  }
}

module.exports = connect;
