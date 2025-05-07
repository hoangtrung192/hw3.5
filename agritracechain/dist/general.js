"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.submitTx = exports.getPubkeyHash = exports.getFieldsDatum = exports.getAddressUTXOAsset = exports.getUtxoForTx = exports.getWalletInfoForTx = exports.getUtxoByTxHash = exports.getTxBuilder = exports.getScripCborAndScriptAddr = exports.readValidator = exports.walletB = exports.walletA = exports.blockchainProvider = void 0;
var core_1 = require("@meshsdk/core");
var core_csl_1 = require("@meshsdk/core-csl");
var plutus_json_1 = require("./plutus.json");
exports.blockchainProvider = new core_1.BlockfrostProvider('preprod2DQWsQjqnzLW9swoBQujfKBIFyYILBiL');
exports.walletA = new core_1.MeshWallet({
    networkId: 0,
    fetcher: exports.blockchainProvider,
    submitter: exports.blockchainProvider,
    key: {
        type: 'mnemonic',
        words: [
            "illness", "tomato", "organ", "credit", "hybrid", "path", "slight", "bomb", "allow", "media", "credit", "virtual", "uncle", "blast", "type", "very", "certain", "join", "feed", "repeat", "elbow", "place", "aim", "oblige"
        ]
    }
});
exports.walletB = new core_1.MeshWallet({
    networkId: 0,
    fetcher: exports.blockchainProvider,
    submitter: exports.blockchainProvider,
    key: {
        type: 'mnemonic',
        words: [
            "spoil", "maid", "general", "expire", "kidney", "deal", "awful", "clip", "fragile", "kitchen", "reason", "crater", "attitude", "grain", "bitter", "bag", "mouse", "reform", "cactus", "spot", "vital", "sea", "same", "salon"
        ]
    }
});
function readValidator(title) {
    var validator = plutus_json_1["default"].validators.find(function (v) { return v.title === title; });
    if (!validator) {
        throw new Error(title + " validator not found.");
    }
    return validator.compiledCode;
}
exports.readValidator = readValidator;
function getScripCborAndScriptAddr(title) {
    var params = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        params[_i - 1] = arguments[_i];
    }
    var compiledCode = readValidator(title);
    var scriptCbor = core_csl_1.applyParamsToScript(compiledCode, params);
    var scriptAddr = core_1.serializePlutusScript({ code: scriptCbor, version: "V3" }, undefined, 0).address;
    return { scriptCbor: scriptCbor, scriptAddr: scriptAddr };
}
exports.getScripCborAndScriptAddr = getScripCborAndScriptAddr;
function getTxBuilder() {
    return new core_1.MeshTxBuilder({
        fetcher: exports.blockchainProvider,
        submitter: exports.blockchainProvider,
        verbose: true
    });
}
exports.getTxBuilder = getTxBuilder;
function getUtxoByTxHash(txHash) {
    return __awaiter(this, void 0, void 0, function () {
        var utxos, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exports.blockchainProvider.fetchUTxOs(txHash)];
                case 1:
                    utxos = _a.sent();
                    if (utxos.length === 0) {
                        throw new Error("UTxO not found");
                    }
                    for (i = 0; i <= 2; i++) {
                        if (utxos[i].output.plutusData !== undefined) {
                            return [2 /*return*/, utxos[i]];
                        }
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.getUtxoByTxHash = getUtxoByTxHash;
function getWalletInfoForTx(wallet) {
    return __awaiter(this, void 0, void 0, function () {
        var walletAddress, utxos, collateral;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, wallet.getUsedAddresses()];
                case 1:
                    walletAddress = (_a.sent())[0];
                    return [4 /*yield*/, exports.blockchainProvider.fetchAddressUTxOs(walletAddress)];
                case 2:
                    utxos = _a.sent();
                    return [4 /*yield*/, wallet.getCollateral()];
                case 3:
                    collateral = (_a.sent())[0];
                    return [2 /*return*/, { utxos: utxos, walletAddress: walletAddress, collateral: collateral }];
            }
        });
    });
}
exports.getWalletInfoForTx = getWalletInfoForTx;
function getUtxoForTx(address, txHash, wallet) {
    return __awaiter(this, void 0, void 0, function () {
        var utxos, utxo;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exports.blockchainProvider.fetchAddressUTxOs(address)];
                case 1:
                    utxos = _a.sent();
                    utxo = utxos.find(function (utxo) {
                        return utxo.input.txHash === txHash;
                    });
                    if (!utxo)
                        throw new Error("No UTXOs found in getUtxoForTx method.");
                    return [2 /*return*/, utxo];
            }
        });
    });
}
exports.getUtxoForTx = getUtxoForTx;
function getAddressUTXOAsset(address, unit, wallet) {
    return __awaiter(this, void 0, void 0, function () {
        var utxos;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exports.blockchainProvider.fetchAddressUTxOs(address, unit)];
                case 1:
                    utxos = _a.sent();
                    return [2 /*return*/, utxos[utxos.length - 1]];
            }
        });
    });
}
exports.getAddressUTXOAsset = getAddressUTXOAsset;
;
function getFieldsDatum(index, utxo, other) {
    var datum = core_1.deserializeDatum(utxo.output.plutusData);
    if (other == "bytes") {
        return datum.fields[index].bytes;
    }
    else {
        return datum.fields[index].int;
    }
}
exports.getFieldsDatum = getFieldsDatum;
function getPubkeyHash(addr) {
    return core_1.deserializeAddress(addr).pubKeyHash;
}
exports.getPubkeyHash = getPubkeyHash;
function submitTx(tx, wallet) {
    return __awaiter(this, void 0, void 0, function () {
        var signedTx, txId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, wallet.signTx(tx, true)];
                case 1:
                    signedTx = _a.sent();
                    return [4 /*yield*/, wallet.submitTx(signedTx)];
                case 2:
                    txId = _a.sent();
                    return [2 /*return*/, txId];
            }
        });
    });
}
exports.submitTx = submitTx;
