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
var core_1 = require("@meshsdk/core");
var general_ts_1 = require("../general.ts");
function hexToString(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2) {
        var charCode = parseInt(hex.substring(i, i + 2), 16);
        str += String.fromCharCode(charCode);
    }
    return str;
}
function updateAndPushHistoryProduct(walletB, txHash, newData, nextHandler, receiver) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, utxos, walletAddress, collateral, pubkeyCurrent, pubkeyHandlerNext, pubkeyReceiver, compileCode, scriptCbor, scriptAddr, utxo, datum, newdata, txBuilder, newDatum, assets, tx, txId, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, general_ts_1.getWalletInfoForTx(walletB)];
                case 1:
                    _a = _b.sent(), utxos = _a.utxos, walletAddress = _a.walletAddress, collateral = _a.collateral;
                    pubkeyCurrent = core_1.deserializeAddress(walletAddress).pubKeyHash;
                    pubkeyHandlerNext = core_1.deserializeAddress(nextHandler).pubKeyHash;
                    pubkeyReceiver = core_1.deserializeAddress(receiver).pubKeyHash;
                    compileCode = general_ts_1.readValidator("agrtracechain.agritracechain.spend");
                    scriptCbor = core_1.applyParamsToScript(compileCode, [core_1.stringToHex("abc"), 123, pubkeyReceiver, 100]);
                    scriptAddr = core_1.serializePlutusScript({ code: scriptCbor, version: "V3" }, undefined, 0).address;
                    console.log("scriptAddr: ", scriptAddr);
                    return [4 /*yield*/, general_ts_1.getUtxoByTxHash(txHash)];
                case 2:
                    utxo = _b.sent();
                    if (!utxo) {
                        throw new Error("No UTXOs found for the given transaction hash.");
                    }
                    datum = hexToString(general_ts_1.getFieldsDatum(2, utxo, "bytes"));
                    console.log("Datum : ", datum);
                    newdata = datum + newData;
                    console.log("new data : ", newdata);
                    txBuilder = general_ts_1.getTxBuilder();
                    newDatum = core_1.mConStr0([pubkeyHandlerNext, pubkeyReceiver, core_1.stringToHex(newdata)]);
                    assets = [{
                            unit: "lovelace",
                            quantity: "1427480"
                        }];
                    return [4 /*yield*/, txBuilder
                            .spendingPlutusScriptV3()
                            .txIn(utxo.input.txHash, utxo.input.outputIndex, utxo.output.amount, scriptAddr)
                            .txInInlineDatumPresent()
                            .txInRedeemerValue(core_1.mConStr0([core_1.stringToHex("UpdateHistory")]))
                            .txInScript(scriptCbor)
                            .txOut(walletAddress, [])
                            .txInCollateral(collateral.input.txHash, collateral.input.outputIndex, collateral.output.amount, collateral.output.address)
                            .requiredSignerHash(pubkeyCurrent)
                            .txOut(scriptAddr, assets)
                            .txOutInlineDatumValue(newDatum)
                            .changeAddress(walletAddress)
                            .selectUtxosFrom(utxos)
                            .setNetwork("preprod")
                            .complete()];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, txBuilder.complete()];
                case 4:
                    tx = _b.sent();
                    return [4 /*yield*/, general_ts_1.submitTx(tx, walletB)];
                case 5:
                    txId = _b.sent();
                    console.log("Transaction Hash: ", txId);
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _b.sent();
                    throw new Error("Error in contribute function: " + error_1);
                case 7: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var wallet, txHash, newData, nextHandler, receiver;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wallet = general_ts_1.walletA;
                    txHash = "a1319445a0e88825c6ab1e4036091757e1a65a01ab446635a3dbeae8302b5e10";
                    newData = "newData new new";
                    nextHandler = "addr_test1qp32dhvj6nmhn8qjce8vsv3s0x70rrth7udxy32a7lm5yl7vchlp2ahqwyyfpv4l7fszccrngx2vcmmu5x3d3t3cy2uqpd7ewx";
                    receiver = "addr_test1qrsv6r79uzuq0uwvj7jez8qy7pl308egptkvuf99p84n0rt7m2m2y4lpett6mh7pgv5lktq0ktcmgl87tufpstn5nxmqtyv065";
                    return [4 /*yield*/, updateAndPushHistoryProduct(wallet, txHash, newData, nextHandler, receiver)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main();
function requiredSignerHash(pubkeyContributor) {
    throw new Error("Function not implemented.");
}
//addr_test1wr6sdyafvwvg0qcp9pds8pyd7pxcnmwkptfyuzv2lychvag76nd9s
