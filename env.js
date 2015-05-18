GLOBAL.BigNumber = require('bignumber.js');
GLOBAL.keccak_256 = require('js-sha3').keccak_256;
GLOBAL.XHR2 = require('xhr2');
GLOBAL.httpsync = require('http-sync');
GLOBAL.crypto = require('crypto');
GLOBAL._ = require('lodash');
GLOBAL.Augur = require('./augur');
GLOBAL.constants = require('./test/constants');

Augur.connect();

GLOBAL.infotx = { 
    from: '0x63524e3fe4791aefce1e932bbfb3fdf375bfad89',
    to: Augur.contracts.info,
    method: 'setInfo',
    signature: 'isii',
    gas: '0x2dc6c0',
    params: 
     [ '0x4b12b5a51882ce7e69a625f9364e4982d94d40946a8b27d7d02e98ca63e0d9b7',
       'many lulz',
       '0x63524e3fe4791aefce1e932bbfb3fdf375bfad89',
       5 ]
};

GLOBAL.cmtx = {
    from: Augur.coinbase,
    to: Augur.contracts.createMarket,
    method: "createMarket",
    signature: "isiiia",
    params: [
        "0x38a820692912b5f7a3bfefc2a1d4826e1da6beaed5fac6de3d22b18132133991",
        "lolmarket",
        "0x205bc01a36e2eb2",
        "0x13880000000000000000",
        "0x7ae147ae147ae14",
        ["0x0919ce53f2c2c2a5422c2aacafdede55a3795ce4f6e4a4034e37e44bc054d13b"]
    ]
};

GLOBAL.initmarket = {
    from: Augur.coinbase,
    to: Augur.contracts.markets,
    method: "initializeMarket",
    signature: "iaiii",
    params: [
        "0xd50e4822813d47e22cedc94565b5cbb2921a9a5d330883019626d46e17f3a49a",
        ["0x0919ce53f2c2c2a5422c2aacafdede55a3795ce4f6e4a4034e37e44bc054d13b"],
        150000,
        "0x7ae147ae147ae14",
        "0x38a820692912b5f7a3bfefc2a1d4826e1da6beaed5fac6de3d22b18132133991"
    ]
};
