#!/usr/bin/env node
var options = require("options-parser");
var fs = require("fs");

function mergeJsonFiles(existingAddresses, newNetworkIdAddresses) {
  return JSON.stringify(Object.assign(JSON.parse(existingAddresses), JSON.parse(newNetworkIdAddresses)), null, " ");
}

function errorOccurred(err, opts) {
  if (err) {
    options.help(opts);
    console.error("ERROR:", err);
    process.exit();
  }
}
var fileType = "utf8";

var opts = {
  primary: { required: true, short: "p", help: "Existing Nework addresses.json file"},
  secondary: { required: true, short: "s", help: "Addresses.json file to merge into main addresses.json file"},
};
var args = options.parse(opts, process.argv, function (error) {
  errorOccurred(error, opts);
});
var primaryFile = args.opt.primary;
var secondaryFile = args.opt.secondary;
fs.readFile(primaryFile, fileType, function (err, primaryContent) {
  errorOccurred(err, opts);
  if (!primaryContent || primaryContent.length === 0) return console.error("existing addresses.json file has no content");
  fs.readFile(secondaryFile, fileType, function (err, secondaryContent) {
    errorOccurred(err, opts);
    if (!secondaryContent || secondaryContent.length === 0) return console.error("new addresses.json file has no content");
    console.log(mergeJsonFiles(primaryContent, secondaryContent));
  });
});


