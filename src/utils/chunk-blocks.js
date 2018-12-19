"use strict";

function chunkBlocks(fromBlock, toBlock, blocksPerChunk) {
  var toBlockChunk, fromBlockChunk, chunks;
  if (fromBlock < 1) fromBlock = 1;
  if (toBlock < fromBlock) return [];
  toBlockChunk = toBlock;
  fromBlockChunk = toBlock - blocksPerChunk;
  chunks = [];
  while (toBlockChunk >= fromBlock) {
    if (fromBlockChunk < fromBlock) {
      fromBlockChunk = fromBlock;
    }
    chunks.push({ fromBlock: fromBlockChunk, toBlock: toBlockChunk });
    fromBlockChunk -= blocksPerChunk;
    toBlockChunk -= blocksPerChunk;
    if (toBlockChunk === toBlock - blocksPerChunk) {
      toBlockChunk--;
    }
  }
  return chunks;
}

module.exports = chunkBlocks;
