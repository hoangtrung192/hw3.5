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
var adapter_1 = require("./adapter");
function contribute(receiver, assets, amount) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, utxos, walletAddress, collateral, pubkeyContributor, pubkeyReceiver, contributeCompileCode, constributeScriptCbor, scriptAddr, txBuilder, datum, tx, signedTx, TxHash, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, adapter_1.getWalletInfoForTx(adapter_1.wallet)];
                case 1:
                    _a = _c.sent(), utxos = _a.utxos, walletAddress = _a.walletAddress, collateral = _a.collateral;
                    pubkeyContributor = core_1.deserializeAddress(walletAddress).pubKeyHash;
                    pubkeyReceiver = core_1.deserializeAddress(receiver).pubKeyHash;
                    contributeCompileCode = adapter_1.readValidator("contribute.contribute.spend");
                    constributeScriptCbor = core_1.applyParamsToScript(contributeCompileCode, []);
                    scriptAddr = core_1.serializePlutusScript({ code: constributeScriptCbor, version: "V3" }, undefined, 0).address;
                    console.log("Script Address : ", scriptAddr);
                    txBuilder = new core_1.MeshTxBuilder({
                        fetcher: adapter_1.blockchainProvider,
                        submitter: adapter_1.blockchainProvider
                    });
                    datum = core_1.mConStr0([pubkeyContributor, pubkeyReceiver, amount]);
                    return [4 /*yield*/, txBuilder
                            .spendingPlutusScriptV3()
                            .txOut(scriptAddr, assets)
                            .txOutInlineDatumValue(datum)
                            .changeAddress(walletAddress)
                            .selectUtxosFrom(utxos)
                            .complete()];
                case 2:
                    _c.sent();
                    tx = txBuilder.txHex;
                    return [4 /*yield*/, adapter_1.wallet.signTx(tx, true)];
                case 3:
                    signedTx = _c.sent();
                    return [4 /*yield*/, adapter_1.wallet.submitTx(signedTx)];
                case 4:
                    TxHash = _c.sent();
                    return [2 /*return*/, TxHash];
                case 5:
                    _b = _c.sent();
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var receiver, assets, amount, txHash;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    receiver = "addr_test1qqwkave5e46pelgysvg6mx0st5zhte7gn79srscs8wv2qp5qkfvca3f7kpx3v3rssm4j97f63v5whrj8yvsx6dac9xrqyqqef6";
                    assets = [
                        {
                            unit: "lovelace",
                            quantity: "30000000"
                        }
                    ];
                    amount = 30;
                    return [4 /*yield*/, contribute(receiver, assets, amount)];
                case 1:
                    txHash = _a.sent();
                    console.log("Transaction Hash: ", txHash);
                    return [2 /*return*/];
            }
        });
    });
}
main();
