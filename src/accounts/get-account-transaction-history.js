"use strict";

/**
 * @typedef {Object} AccountTransaction
 * @property {Action} action
 * @property {string} coin
 * @property {string} details
 * @property {string} fee
 * @property {string} marketDescription
 * @property {string} outcomeDescription
 * @property {string} quantity
 * @property {number} timestamp
 * @property {string} total
 * @property {string} transactionHash
 */

var augurNode = require("../augur-node");

/**
 * Returns the transaction history for a specific Ethereum account address. Requires an Augur Node connection.
 * @param {Object} p Parameters object.
 * @param {string} p.universe Universe contract address by which to limit the transaction history results, as a hexadecimal string.
 * @param {string} p.account Ethereum address of the account for which to get transaction history, as a hexadecimal string.
 * @param {number} p.earliestTransactionTime Earliest timestamp, in seconds, at which to truncate history results. (This timestamp is when the block on the Ethereum blockchain containing the transaction was created.)
 * @param {number} p.latestTransactionTime Latest timestamp, in seconds, at which to truncate history results. (This timestamp is when the block on the Ethereum blockchain containing the transaction was created.)
 * @param {Coin} p.coin Cryptocurrency denomination by which to restrict history results.
 * @param {Action=} p.action Transaction type by which to restrict history results.
 * @param {string=} p.sortBy Field name by which to sort transaction history.
 * @param {boolean=} p.isSortDescending Whether to sort transactions in descending order by sortBy field.
 * @param {string=} p.limit Maximum number of transactions to return.
 * @param {string=} p.offset Number of transactions to truncate from the beginning of the history results.
 * @param {function} callback Called after the account transfer history has been retrieved.
 * @return {AccountTransfer[]} Array representing the account's transfer history.
 */
function getAccountTransactionHistory(p, callback) {
  augurNode.submitRequest("getAccountTransactionHistory", p, callback);
}

module.exports = getAccountTransactionHistory;
