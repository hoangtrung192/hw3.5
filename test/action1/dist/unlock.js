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
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, utxos, walletAddress, collateral, userPubKeyHash, _b, scriptAddr, scriptCbor, txHashLock, utxoFetch, utxo, datum, txBuilder, unsignedTx, signedTx, txHash, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, adapter_1.getWalletInfoForTx(adapter_1.wallet)];
                case 1:
                    _a = _c.sent(), utxos = _a.utxos, walletAddress = _a.walletAddress, collateral = _a.collateral;
                    userPubKeyHash = core_1.deserializeAddress(walletAddress).pubKeyHash;
                    _b = adapter_1.getScript(), scriptAddr = _b.scriptAddr, scriptCbor = _b.scriptCbor;
                    txHashLock = "171ab71ab501efd5c73eb28a8a6fa6fe02357cf0af69c7158fa71c1c9b93ac96";
                    return [4 /*yield*/, adapter_1.blockchainProvider.fetchUTxOs(txHashLock)];
                case 2:
                    utxoFetch = _c.sent();
                    utxo = utxoFetch[0];
                    datum = core_1.deserializeDatum(utxo.output.plutusData);
                    txBuilder = new core_1.MeshTxBuilder({
                        fetcher: adapter_1.blockchainProvider,
                        submitter: adapter_1.blockchainProvider
                    });
                    return [4 /*yield*/, txBuilder
                            .spendingPlutusScriptV3()
                            .txIn(utxo.input.txHash, utxo.input.outputIndex, utxo.output.amount, scriptAddr)
                            .txInInlineDatumPresent()
                            .txInRedeemerValue(core_1.mConStr0([]))
                            .changeAddress(walletAddress)
                            .txInScript(scriptCbor)
                            .txOut(walletAddress, [])
                            .txInCollateral(collateral.input.txHash, collateral.input.outputIndex, collateral.output.amount, collateral.output.address)
                            .requiredSignerHash(userPubKeyHash)
                            .selectUtxosFrom(utxos)
                            .setNetwork("preprod")
                            .complete()];
                case 3:
                    _c.sent();
                    unsignedTx = txBuilder.txHex;
                    return [4 /*yield*/, adapter_1.wallet.signTx(unsignedTx, true)];
                case 4:
                    signedTx = _c.sent();
                    return [4 /*yield*/, adapter_1.wallet.submitTx(signedTx)];
                case 5:
                    txHash = _c.sent();
                    console.log("Transaction submitted successfully !");
                    console.log("TxHash Transaction : ", txHash);
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _c.sent();
                    throw error_1;
                case 7: return [2 /*return*/];
            }
        });
    });
}
main();
