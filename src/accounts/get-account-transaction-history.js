"use strict";

/**
 * @typedef {Object} AccountTransfer
 * @property {string} transactionHash Hash returned by token transfer.
 * @property {number} logIndex Number of the log index position in the Ethereum block containing the transfer.
 * @property {number} creationBlockNumber Number of the Ethereum block containing the transfer.
 * @property {string} blockHash Hash of the Ethereum block containing the transfer.
 * @property {number} creationTime Timestamp, in seconds, when the Ethereum block containing the transfer was created.
 * @property {string|null} sender Ethereum address of the token sender. If null, this indicates that new tokens were minted and sent to the user.
 * @property {string|null} recipient Ethereum address of the token recipient. If null, this indicates that tokens were burned (i.e., destroyed).
 * @property {string} token Contract address of the contract for the sent token, as a hexadecimal string.
 * @property {number} value Quantity of tokens sent.
 * @property {string|null} symbol Token symbol (if any).
 * @property {number|null} outcome Market outcome with which the token is associated (if any).
 * @property {string|null} marketId Contract address of the market in which the tranfer took place, as a hexadecimal string (if any).
 */

var augurNode = require("../augur-node");

/**
 * Returns the transaction history for a specific Ethereum account address. Requires an Augur Node connection.
 * @param {Object} p Parameters object.
 * @param {string} p.universe Universe contract address by which to limit the transaction history results, as a hexadecimal string.
 * @param {string} p.account Ethereum address of the account for which to get transaction history, as a hexadecimal string.
 * @param {number} p.earliestTransactionTime Earliest timestamp, in seconds, at which to truncate history results. (This timestamp is when the block on the Ethereum blockchain containing the transaction was created.)
 * @param {number} p.latestTransactionTime Latest timestamp, in seconds, at which to truncate history results. (This timestamp is when the block on the Ethereum blockchain containing the transaction was created.)
 * @param {Denomination} p.denomination Cryptocurrency denomination by which to restrict history results.
 * @param {ActionType=} p.actionType Transaction type by which to restrict history results.
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
