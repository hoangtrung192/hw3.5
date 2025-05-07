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
var common_1 = require("./common");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var meshTxBuilder, txHash, contractutxos, assets, vestingUtxo, _a, utxos, walletAddress, collateral, collateralInput, collateralOutput, _b, scriptAddr, scriptCbor, pubKeyHash_1, datum, pubkeyCurrent, invalidBefore1, invalidBefore2, txBuilder, unsignedTx, signedTx, txhash, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 6, , 7]);
                    meshTxBuilder = new core_1.MeshTxBuilder({
                        fetcher: common_1.blockchainProvider,
                        submitter: common_1.blockchainProvider
                    });
                    txHash = "8c276720b920b20714709bc96a942ceade319bf43a5b0020014405914be0d592";
                    return [4 /*yield*/, common_1.blockchainProvider.fetchUTxOs(txHash)];
                case 1:
                    contractutxos = _c.sent();
                    //console.log("Contract UTXOs:", contractutxos);
                    if (!contractutxos || contractutxos.length === 0) {
                        throw new Error("No UTXOs found for the given transaction hash.");
                    }
                    assets = [
                        {
                            unit: "lovelace",
                            quantity: "20000000"
                        },
                    ];
                    vestingUtxo = contractutxos[0];
                    return [4 /*yield*/, common_1.getWalletInfoForTx(common_1.wallet)];
                case 2:
                    _a = _c.sent(), utxos = _a.utxos, walletAddress = _a.walletAddress, collateral = _a.collateral;
                    collateralInput = collateral.input, collateralOutput = collateral.output;
                    _b = common_1.getScript(), scriptAddr = _b.scriptAddr, scriptCbor = _b.scriptCbor;
                    pubKeyHash_1 = core_1.deserializeAddress(walletAddress).pubKeyHash;
                    datum = core_1.deserializeDatum(vestingUtxo.output.plutusData);
                    pubkeyCurrent = datum.fields[2].bytes;
                    invalidBefore1 = core_1.unixTimeToEnclosingSlot(Math.min(datum.fields[0].int, Date.now() - 15000), core_1.SLOT_CONFIG_NETWORK.preprod) + 1;
                    invalidBefore2 = core_1.slotToBeginUnixTime(invalidBefore1, core_1.SLOT_CONFIG_NETWORK.preprod);
                    console.log("time : " + invalidBefore1);
                    console.log("time datum : " + datum.fields[0].int);
                    console.log("time 2 : ", invalidBefore2);
                    console.log("preprod : " + core_1.SLOT_CONFIG_NETWORK.preprod);
                    console.log("min : " + (Date.now() - 15000));
                    txBuilder = new core_1.MeshTxBuilder({
                        fetcher: common_1.blockchainProvider,
                        submitter: common_1.blockchainProvider
                    });
                    console.log("Network : ", core_1.SLOT_CONFIG_NETWORK);
                    console.log("Building transaction...");
                    console.log("1. : " + pubKeyHash_1);
                    console.log("2. : " + pubkeyCurrent);
                    //const signerHash = deserializeAddress(walletAddress).pubKeyHash;
                    return [4 /*yield*/, txBuilder
                            .spendingPlutusScriptV3()
                            .txIn(vestingUtxo.input.txHash, vestingUtxo.input.outputIndex, vestingUtxo.output.amount, scriptAddr)
                            .spendingReferenceTxInInlineDatumPresent()
                            .spendingReferenceTxInRedeemerValue("")
                            //.txInInlineDatumPresent()
                            //.txInDatumValue(mConStr0([invalidBefore, ownerPubKeyHash, beneficiaryPubKeyHash]))  
                            //.txInRedeemerValue(mConStr1([]))
                            //.txInDatumValue(mConStr0([signerHash]))
                            .txInScript(scriptCbor)
                            .txOut(walletAddress, [])
                            .txInCollateral(collateralInput.txHash, collateralInput.outputIndex, collateralOutput.amount, collateralOutput.address)
                            .invalidBefore(invalidBefore1)
                            .requiredSignerHash(pubKeyHash_1)
                            .changeAddress(walletAddress)
                            .selectUtxosFrom(utxos)
                            .setNetwork("preprod")
                            .complete()];
                case 3:
                    //const signerHash = deserializeAddress(walletAddress).pubKeyHash;
                    _c.sent();
                    console.log("Transaction built successfully.");
                    unsignedTx = txBuilder.txHex;
                    console.log("Unsigned Transaction:", unsignedTx);
                    return [4 /*yield*/, common_1.wallet.signTx(unsignedTx, true)];
                case 4:
                    signedTx = _c.sent();
                    console.log("Signed Transaction:", signedTx);
                    return [4 /*yield*/, common_1.wallet.submitTx(signedTx)];
                case 5:
                    txhash = _c.sent();
                    console.log("Transaction Hash:", txhash);
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _c.sent();
                    console.error("An error occurred:", error_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
main()["catch"](function (error) {
    console.error("Unhandled error:", error);
});
