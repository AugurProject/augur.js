"use strict";

var BigNumber = require("bignumber.js");

var ten = new BigNumber(10, 10);
var decimals = new BigNumber(18, 10);
var multiple = ten.exponentiatedBy(18);

var SECONDS_PER_DAY = 3600 * 24;

// Used to calculate how large a WebSocket frame we need to allow. This is a theoretical limit based on a block
// being completely filled with Transfer transactions
var MAX_LOG_BYTES_PER_BLOCK = 160000;

var SubscriptionEventNames;
(function (SubscriptionEventNames) {
  SubscriptionEventNames.FeeWindowOpened = "FeeWindowOpened";
  SubscriptionEventNames.CompleteSetsPurchased = "CompleteSetsPurchased";
  SubscriptionEventNames.CompleteSetsSold = "CompleteSetsSold";
  SubscriptionEventNames.DisputeCrowdsourcerCompleted = "DisputeCrowdsourcerCompleted";
  SubscriptionEventNames.DisputeCrowdsourcerContribution = "DisputeCrowdsourcerContribution";
  SubscriptionEventNames.DisputeCrowdsourcerCreated = "DisputeCrowdsourcerCreated";
  SubscriptionEventNames.DisputeCrowdsourcerRedeemedLog = "DisputeCrowdsourcerRedeemedLog";
  SubscriptionEventNames.FeeWindowClosed = "FeeWindowClosed";
  SubscriptionEventNames.FeeWindowCreated = "FeeWindowCreated";
  SubscriptionEventNames.FeeWindowRedeemed = "FeeWindowRedeemed";
  SubscriptionEventNames.InitialReportSubmitted = "InitialReportSubmitted";
  SubscriptionEventNames.InitialReporterRedeemed = "InitialReporterRedeemed";
  SubscriptionEventNames.InitialReporterTransferred = "InitialReporterTransferred";
  SubscriptionEventNames.MarketCreated = "MarketCreated";
  SubscriptionEventNames.MarketState = "MarketState";
  SubscriptionEventNames.OrderCanceled = "OrderCanceled";
  SubscriptionEventNames.OrderCreated = "OrderCreated";
  SubscriptionEventNames.OrderFilled = "OrderFilled";
  SubscriptionEventNames.ReportingParticipantDisavowed = "ReportingParticipantDisavowed";
  SubscriptionEventNames.SyncFinished = "SyncFinished";
  SubscriptionEventNames.TokensTransferred = "TokensTransferred";
  SubscriptionEventNames.TradingProceedsClaimed = "TradingProceedsClaimed";
  SubscriptionEventNames.UniverseCreated = "UniverseCreated";
}(SubscriptionEventNames || (SubscriptionEventNames = {})));

module.exports = {
  AUGUR_UPLOAD_BLOCK_NUMBER: "0x1",

  BLOCKS_PER_CHUNK: 5760, // 1 days worth. 60*60*24/15 (seconds*minutes*hours/blocks_per_second)

  CANCEL_ORDER_GAS: "0xC9860",

  CONTRACT_INTERVAL: {
    DESIGNATED_REPORTING_DURATION_SECONDS: 3 * SECONDS_PER_DAY,
    DISPUTE_ROUND_DURATION_SECONDS: 7 * SECONDS_PER_DAY,
    CLAIM_PROCEEDS_WAIT_TIME: 3 * SECONDS_PER_DAY,
    FORK_DURATION_SECONDS: 60 * SECONDS_PER_DAY,
  },

  CONTRACT_TYPE: {
    DISPUTE_CROWDSOURCER: 0,
    INITIAL_REPORTER: 1,
    FEE_WINDOW: 2,
  },

  DEFAULT_CONNECTION_TIMEOUT: 60000,

  DEFAULT_GASPRICE: 20000000000,

  DEFAULT_MAX_GAS: "0x5e3918",

  DEFAULT_NETWORK_ID: "3",

  DEFAULT_NUM_TICKS: {
    2: 10000,
    3: 10002,
    4: 10000,
    5: 10000,
    6: 10002,
    7: 10003,
    8: 10000,
  },

  DEFAULT_SCALAR_TICK_SIZE: "0.0001",

  ETERNAL_APPROVAL_VALUE: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", // 2^256 - 1

  GET_LOGS_DEFAULT_FROM_BLOCK: "0x1",

  GET_LOGS_DEFAULT_TO_BLOCK: "latest",

  MAX_FILLS_PER_TX: new BigNumber("3", 10),

  MAX_GAS_LIMIT_FOR_TRADE: new BigNumber("3500000", 10),

  MAX_WEBSOCKET_FRAME_SIZE: 5760 * MAX_LOG_BYTES_PER_BLOCK, // Works out to under 1GB, extreme case but prevents error

  MINIMUM_TRADE_SIZE: new BigNumber("0.0001", 10),

  MINIMUM_TRADE_VALUE: new BigNumber(1, 10).dividedBy(10000),

  ORDER_STATE: {
    ALL: "ALL",
    OPEN: "OPEN",
    CLOSED: "CLOSED",
    CANCELED: "CANCELED",
  },

  // maximum number of transactions to auto-submit in parallel
  PARALLEL_LIMIT: 10,

  PLACE_ORDER_NO_SHARES: {
    2: new BigNumber("547694", 10),
    3: new BigNumber("562138", 10),
    4: new BigNumber("576582", 10),
    5: new BigNumber("591026", 10),
    6: new BigNumber("605470", 10),
    7: new BigNumber("619914", 10),
    8: new BigNumber("634358", 10),
  },

  PLACE_ORDER_WITH_SHARES: {
    2: new BigNumber("695034", 10),
    3: new BigNumber("794664", 10),
    4: new BigNumber("894294", 10),
    5: new BigNumber("993924", 10),
    6: new BigNumber("1093554", 10),
    7: new BigNumber("1193184", 10),
    8: new BigNumber("1292814", 10),
  },

  PRECISION: {
    decimals: decimals.toNumber(),
    limit: ten.dividedBy(multiple),
    zero: new BigNumber(1, 10).dividedBy(multiple),
    multiple: multiple,
  },

  REPORTING_STATE: {
    PRE_REPORTING: "PRE_REPORTING",
    DESIGNATED_REPORTING: "DESIGNATED_REPORTING",
    OPEN_REPORTING: "OPEN_REPORTING",
    CROWDSOURCING_DISPUTE: "CROWDSOURCING_DISPUTE",
    AWAITING_NEXT_WINDOW: "AWAITING_NEXT_WINDOW",
    AWAITING_FINALIZATION: "AWAITING_FINALIZATION",
    FINALIZED: "FINALIZED",
    FORKING: "FORKING",
    AWAITING_NO_REPORT_MIGRATION: "AWAITING_NO_REPORT_MIGRATION",
    AWAITING_FORK_MIGRATION: "AWAITING_FORK_MIGRATION",
  },

  STAKE_TOKEN_STATE: {
    ALL: "ALL",
    UNCLAIMED: "UNCLAIMED",
    UNFINALIZED: "UNFINALIZED",
  },

  TRADE_GAS_BUFFER: new BigNumber("100000", 10),

  TRADE_GROUP_ID_NUM_BYTES: 32,

  WORST_CASE_FILL: {
    2: new BigNumber("933495", 10),
    3: new BigNumber("1172245", 10),
    4: new BigNumber("1410995", 10),
    5: new BigNumber("1649744", 10),
    6: new BigNumber("1888494", 10),
    7: new BigNumber("2127244", 10),
    8: new BigNumber("2365994", 10),
  },

  ZERO: new BigNumber(0),
};
