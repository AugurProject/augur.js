"use strict";

var augurNodeState = require("./state");
var dispatchJsonRpcResponse = require("./dispatch-json-rpc-response");
var WsTransport = require("../rpc-interface").WsTransport;

function disconnect() {
  if (augurNodeState.getTransport() !== null) augurNodeState.getTransport().close();
}


module.exports = connect;
