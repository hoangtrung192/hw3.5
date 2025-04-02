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
var plutus_json_1 = require("./plutus.json");
var common_1 = require("./common");
var TOKEN_NAME = "Portfolio";
var RECEIVER = "addr_test1qqwkave5e46pelgysvg6mx0st5zhte7gn79srscs8wv2qp5qkfvca3f7kpx3v3rssm4j97f63v5whrj8yvsx6dac9xrqyqqef6";
var POLICY_ID = "";
var REQUIRED_ADA = 0;
function readValidator(title) {
    var validator = plutus_json_1["default"].validators.find(function (v) { return v.title === title; });
    if (!validator) {
        throw new Error(title + " validator not found.");
    }
    return validator.compiledCode;
}
function unlock_nft(token_name, tx) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, utxos, walletAddress, collateral, userPubKeyHash, unlockUtxos, utxoUnlock, datum, nftAsset, hopistalTitle, _b, scriptCbor, scriptAddr, txBuilder, unsignedTx, completeTx, signTx, txHash, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, common_1.getWalletInfoForTx(common_1.wallet)];
                case 1:
                    _a = _c.sent(), utxos = _a.utxos, walletAddress = _a.walletAddress, collateral = _a.collateral;
                    userPubKeyHash = core_1.deserializeAddress(walletAddress).pubKeyHash;
                    console.log("Fetching UTXOs for transaction:", tx);
                    return [4 /*yield*/, common_1.blockchainProvider.fetchUTxOs(tx)];
                case 2:
                    unlockUtxos = _c.sent();
                    if (!unlockUtxos || unlockUtxos.length === 0) {
                        throw new Error("No UTXOs found for transaction " + tx);
                    }
                    utxoUnlock = unlockUtxos[0];
                    console.log("UTXO details:", JSON.stringify({
                        txHash: utxoUnlock.input.txHash,
                        outputIndex: utxoUnlock.input.outputIndex,
                        address: utxoUnlock.output.address
                    }));
                    datum = utxoUnlock.output.plutusData
                        ? core_1.deserializeDatum(utxoUnlock.output.plutusData)
                        : "No datum found";
                    console.log("Datum:", JSON.stringify(datum, null, 2));
                    nftAsset = utxoUnlock.output.amount.find(function (asset) { return asset.unit !== "lovelace"; });
                    if (!nftAsset) {
                        throw new Error("No NFT found in UTXO");
                    }
                    hopistalTitle = readValidator("hopistal.hopistal_management.spend");
                    console.log("Tái tạo script với tham số từ datum...");
                    _b = common_1.getScript(), scriptCbor = _b.scriptCbor, scriptAddr = _b.scriptAddr;
                    console.log("Script address tái tạo:", scriptAddr);
                    console.log("Script address từ UTXO:", utxoUnlock.output.address);
                    txBuilder = common_1.getTxBuilder();
                    unsignedTx = txBuilder.spendingPlutusScriptV3();
                    console.log("Building transaction...");
                    unsignedTx
                        .txIn(utxoUnlock.input.txHash, utxoUnlock.input.outputIndex, utxoUnlock.output.amount, scriptAddr)
                        // .spendingReferenceTxInInlineDatumPresent()
                        // .spendingReferenceTxInRedeemerValue(mConStr2([]))
                        .txInInlineDatumPresent()
                        .txInRedeemerValue(core_1.mConStr2([])) // Index 2 for "Unlock"
                        .txInScript(scriptCbor)
                        .txOut(walletAddress, [{
                            unit: "c3928d5f3308b9ac91b870c650e4d31d2222a26e34b8823b6d86e35d000de140506f7274666f6c696f",
                            quantity: "1"
                        },
                        {
                            unit: "lovelace",
                            quantity: "10000000"
                        }])
                        .txInCollateral(collateral.input.txHash, collateral.input.outputIndex, collateral.output.amount, collateral.output.address)
                        .requiredSignerHash(userPubKeyHash)
                        .changeAddress(walletAddress)
                        .selectUtxosFrom(utxos)
                        .setNetwork("preprod")
                        .addUtxosFromSelection();
                    console.log("Transaction built, completing...");
                    return [4 /*yield*/, unsignedTx.complete()];
                case 3:
                    completeTx = _c.sent();
                    console.log("Signing transaction...");
                    return [4 /*yield*/, common_1.wallet.signTx(completeTx, true)];
                case 4:
                    signTx = _c.sent();
                    console.log("Submitting transaction...");
                    return [4 /*yield*/, common_1.wallet.submitTx(signTx)];
                case 5:
                    txHash = _c.sent();
                    console.log("Transaction submitted! TxHash:", txHash);
                    return [2 /*return*/, txHash];
                case 6:
                    error_1 = _c.sent();
                    console.error("Error in unlock_nft:", error_1);
                    throw error_1;
                case 7: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var txHash, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, unlock_nft(TOKEN_NAME, "67592e383f382ab21b96cc6435e5a53da5a9d7b29573ac2b3678499085c8796e")];
                case 1:
                    txHash = _a.sent();
                    console.log("TxHash : " + txHash);
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error("Error in main function:");
                    console.error("Message:", error_2.message);
                    console.error("Stack:", error_2.stack);
                    // Nếu có thông tin blockchain error
                    if (error_2.data) {
                        console.error("Blockchain error data:", JSON.stringify(error_2.data, null, 2));
                    }
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
main();
