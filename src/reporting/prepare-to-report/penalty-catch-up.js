"use strict";

var async = require("async");
var BigNumber = require("bignumber.js");
var closeEventMarkets = require("./close-event-markets");
var getCurrentPeriodProgress = require("../get-current-period-progress");
var api = require("../../api");
var noop = require("../../utils/noop");

// TODO break this monster up into multiple functions
function penaltyCatchUp(branch, periodLength, periodToCheck, sender, callback) {
  api().ConsensusData.getPenalizedUpTo(branch, sender, function (lastPeriodPenalized) {
    lastPeriodPenalized = parseInt(lastPeriodPenalized, 10);
    if (lastPeriodPenalized === 0 || lastPeriodPenalized >= periodToCheck) {
      return callback(null);
    } else if (lastPeriodPenalized < periodToCheck - 1) {
      if (getCurrentPeriodProgress(periodLength) >= 50) {
        return callback(null);
      }
      return api().PenalizationCatchup.penalizationCatchup({
        branch: branch,
        sender: sender,
        onSent: noop,
        onSuccess: function () { callback(null); },
        onFailed: callback
      });
    }
    api().ExpiringEvents.getEvents(branch, periodToCheck, function (events) {
      if (!Array.isArray(events) || !events.length) {
        // console.log("[penaltyCatchUp] No events found in period", periodToCheck);
        api().Consensus.penalizeWrong({
          branch: branch,
          event: 0,
          onSent: noop,
          onSuccess: function () { callback(null); },
          onFailed: callback
        });
      } else {
        // console.log("[penaltyCatchUp] Events in period " + periodToCheck + ":", events);
        async.eachSeries(events, function (event, nextEvent) {
          if (!event || !parseInt(event, 16)) return nextEvent(null);
          api().ExpiringEvents.getNumReportsEvent(branch, periodToCheck, event, function (numReportsEvent) {
            // console.log("[penaltyCatchUp] getNumReportsEvent:", numReportsEvent);
            if (parseInt(numReportsEvent, 10) === 0) {
              // check to make sure event hasn't been moved forward already
              api().Events.getExpiration(event, function (expiration) {
                if (!new BigNumber(expiration, 10).dividedBy(periodLength).floor().eq(periodToCheck)) {
                  return nextEvent(null);
                }
                api().ExpiringEvents.moveEvent({
                  branch: branch,
                  event: event,
                  onSent: noop,
                  onSuccess: function () { nextEvent(null); },
                  onFailed: nextEvent
                });
              });
            } else {
              api().ExpiringEvents.getReport(branch, periodToCheck, event, sender, function (report) {
                console.log("[penaltyCatchUp] ExpiringEvents.getReport:", report);
                if (parseInt(report, 10) === 0) {
                  return closeEventMarkets(branch, event, sender, nextEvent);
                }
                api().Consensus.penalizeWrong({
                  branch: branch,
                  event: event,
                  onSent: noop,
                  onSuccess: function () {
                    closeEventMarkets(branch, event, sender, nextEvent);
                  },
                  onFailed: nextEvent
                });
              });
            }
          });
        }, callback);
      }
    });
  });
}

module.exports = penaltyCatchUp;