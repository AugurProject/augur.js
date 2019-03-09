var HttpTransport = require("../rpc-interface").HttpTransport;

function AugurNodeHttpTransport(address, timeout, maxRetries, messageHandler, initialConnectCallback) {
  HttpTransport.call(this, address, timeout, maxRetries, messageHandler, initialConnectCallback);

  this.timeout = 60000;
}

AugurNodeHttpTransport.prototype = Object.create(HttpTransport.prototype);
AugurNodeHttpTransport.prototype.constructor = AugurNodeHttpTransport;
AugurNodeHttpTransport.prototype.connect = function (callback) {
  callback(null);
};

module.exports = AugurNodeHttpTransport;
