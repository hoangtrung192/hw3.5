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
exports.SMCProduct = void 0;
var core_1 = require("@meshsdk/core");
var general_ts_1 = require("../general.ts");
function SMCProduct(walletA, data, price, next_handler, receiver) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, utxos, walletAddress, collateral, currentPubkey, pubkeyHandler, pubkeyReceiver, compileCode, scriptCbor, scriptAddr, txBuilder, assets, datum, tx, txHash;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, general_ts_1.getWalletInfoForTx(walletA)];
                case 1:
                    _a = _b.sent(), utxos = _a.utxos, walletAddress = _a.walletAddress, collateral = _a.collateral;
                    currentPubkey = general_ts_1.getPubkeyHash(walletAddress);
                    pubkeyHandler = general_ts_1.getPubkeyHash(next_handler);
                    pubkeyReceiver = general_ts_1.getPubkeyHash(receiver);
                    compileCode = general_ts_1.readValidator("agrtracechain.agritracechain.spend");
                    scriptCbor = core_1.applyParamsToScript(compileCode, [core_1.stringToHex("abc"), 123, pubkeyReceiver, 100]);
                    scriptAddr = core_1.serializePlutusScript({ code: scriptCbor, version: "V3" }, undefined, 0).address;
                    console.log("scriptAddr: ", scriptAddr);
                    console.log("scriptCbor: ", scriptCbor);
                    txBuilder = general_ts_1.getTxBuilder();
                    assets = [{
                            unit: "lovelace",
                            quantity: "1327480"
                        }];
                    datum = core_1.mConStr0([
                        pubkeyHandler,
                        pubkeyReceiver,
                        core_1.stringToHex(data)
                    ]);
                    return [4 /*yield*/, txBuilder
                            .spendingPlutusScriptV3()
                            .txOut(scriptAddr, assets)
                            .txOutInlineDatumValue(datum)
                            .changeAddress(walletAddress)
                            .requiredSignerHash(currentPubkey)
                            .selectUtxosFrom(utxos)
                            .setNetwork("preprod")];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, txBuilder.complete()];
                case 3:
                    tx = _b.sent();
                    return [4 /*yield*/, general_ts_1.submitTx(tx, walletA)];
                case 4:
                    txHash = _b.sent();
                    console.log("Transaction Hash: ", txHash);
                    return [2 /*return*/];
            }
        });
    });
}
exports.SMCProduct = SMCProduct;
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var wallet, data, price, next_handler, receiver;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wallet = general_ts_1.walletA;
                    data = "asjdhaksdhiashdiahsdiuashiduhaskjdha";
                    price = 200;
                    next_handler = "addr_test1qqwkave5e46pelgysvg6mx0st5zhte7gn79srscs8wv2qp5qkfvca3f7kpx3v3rssm4j97f63v5whrj8yvsx6dac9xrqyqqef6";
                    receiver = "addr_test1qrsv6r79uzuq0uwvj7jez8qy7pl308egptkvuf99p84n0rt7m2m2y4lpett6mh7pgv5lktq0ktcmgl87tufpstn5nxmqtyv065";
                    return [4 /*yield*/, SMCProduct(wallet, data, price, next_handler, receiver)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main();
