/**
 * Augur JavaScript API
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var BigNumber = require("bignumber.js");
var clone = require("clone");
var abi = require("augur-abi");
var utils = require("../utilities");

module.exports = {

    collectFees: function (branch, sender, periodLength, onSent, onSuccess, onFailed) {
        var self = this;
        if (branch && branch.branch) {
            sender = branch.sender;
            periodLength = branch.periodLength;
            onSent = branch.onSent;
            onSuccess = branch.onSuccess;
            onFailed = branch.onFailed;
            branch = branch.branch;
        }
        if (this.getCurrentPeriodProgress(periodLength) < 50) {
            return onFailed({"-2": "needs to be second half of reporting period to claim rep"});
        }
        var tx = clone(this.tx.CollectFees.collectFees);
        tx.params = [branch, sender];
        var prepare = function (res, cb) {
            if (res && (res.callReturn === "1" || res.callReturn === "2")) {
                return cb(res);
            }
            self.Branches.getVotePeriod(branch, function (period) {
                self.ConsensusData.getFeesCollected(branch, sender, period - 1, function (feesCollected) {
                    if (feesCollected !== "1") {
                        res.callReturn = "2";
                        return cb(res);
                    }
                    self.ExpiringEvents.getAfterRep(branch, period - 1, sender, function (afterRep) {
                        if (parseInt(afterRep, 10) <= 1) {
                            res.callReturn = "2";
                            return cb(res);
                        }
                        res.callReturn = "1";
                        return cb(res);
                    });
                });
            });
        };
        return this.transact(tx, onSent, utils.compose(prepare, onSuccess), onFailed);
    }
};
