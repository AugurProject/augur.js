"use strict";

module.exports = {
  getReportingHistory: require("./get-reporting-history"),
  getReportingSummary: require("./get-reporting-summary"),
  getFeeWindows: require("./get-fee-windows"),
  getFeeWindowCurrent: require("./get-fee-window-current"),
  getDisputeInfo: require("./get-dispute-info"),
  getStakeRequiredForDesignatedReporter: require("./get-stake-required-for-designated-reporter"),
  getCurrentPeriodProgress: require("./get-current-period-progress"),
  finalizeMarket: require("./finalize-market"),
};
