"use strict";

var assign = require("lodash.assign");
var immutableDelete = require("immutable-delete");

function splitExtraInfo(p) {
  var extraInfoKeys = ["longDescription", "tags", "_scalarDenomination", "resolutionSource", "outcomeNames"];
  var extraInfo = extraInfoKeys.reduce(function (prev, extraInfoKey) {
    if (p.hasOwnProperty(extraInfoKey) && !prev.hasOwnProperty(extraInfoKey)) prev[extraInfoKey] = p[extraInfoKey];
    return prev;
  }, assign({}, p._extraInfo));
  return assign({},
    immutableDelete(p, extraInfoKeys),
    { _extraInfo: extraInfo }
  );
}

module.exports = splitExtraInfo;
