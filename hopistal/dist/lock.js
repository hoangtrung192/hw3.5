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
function lock_nft(token_name, metadata) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, utxos, walletAddress, collateral, userPubKeyHash, receiverPubKeyHash, AssetName, assets, policyId, metaData, hopistalTitle, _b, scriptCbor, scriptAddr, txBuilder, unsignedTx, completeTx, signTx, txHash;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, common_1.getWalletInfoForTx(common_1.wallet)];
                case 1:
                    _a = _c.sent(), utxos = _a.utxos, walletAddress = _a.walletAddress, collateral = _a.collateral;
                    userPubKeyHash = core_1.deserializeAddress(walletAddress).pubKeyHash;
                    receiverPubKeyHash = core_1.deserializeAddress(RECEIVER).pubKeyHash;
                    AssetName = core_1.stringToHex(token_name);
                    assets = [
                        {
                            unit: "c3928d5f3308b9ac91b870c650e4d31d2222a26e34b8823b6d86e35d000de140506f7274666f6c696f",
                            quantity: "1"
                        }
                    ];
                    console.log("read validator ...");
                    policyId = "c3928d5f3308b9ac91b870c650e4d31d2222a26e34b8823b6d86e35d";
                    return [4 /*yield*/, common_1.blockchainProvider.fetchAssetMetadata("c3928d5f3308b9ac91b870c650e4d31d2222a26e34b8823b6d86e35d000de140506f7274666f6c696f")];
                case 2:
                    metaData = _c.sent();
                    hopistalTitle = readValidator("hopistal.hopistal_management.spend");
                    _b = common_1.getScript(), scriptCbor = _b.scriptCbor, scriptAddr = _b.scriptAddr;
                    console.log("scriptAddr : " + scriptAddr);
                    txBuilder = common_1.getTxBuilder();
                    unsignedTx = txBuilder.spendingPlutusScriptV3();
                    unsignedTx
                        .txOut(scriptAddr, assets)
                        .txOutInlineDatumValue(core_1.mConStr0([userPubKeyHash, [receiverPubKeyHash], policyId, AssetName, "10000000", core_1.metadataToCip68(metaData)]))
                        .changeAddress(walletAddress)
                        .selectUtxosFrom(utxos)
                        .setNetwork("preprod");
                    return [4 /*yield*/, unsignedTx.complete()];
                case 3:
                    completeTx = _c.sent();
                    console.log("signing ...");
                    return [4 /*yield*/, common_1.wallet.signTx(completeTx, true)];
                case 4:
                    signTx = _c.sent();
                    console.log("signed, submitting ...");
                    return [4 /*yield*/, common_1.wallet.submitTx(signTx)];
                case 5:
                    txHash = _c.sent();
                    console.log("submit complete ..., txHash : " + txHash);
                    return [2 /*return*/, txHash];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var txHash;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, lock_nft(TOKEN_NAME, {
                        name: 'Test',
                        image: 'ipfs://bafkreibktdoly7abv5gqg6xn7gskjliyxw3sqflqldznehbh4r3p522p6a',
                        mediaType: 'image/jpg',
                        description: 'My second  CIP68 token DID',
                        _pk: '581c62a6dd92d4f7799c12c64ec8323079bcf18d77f71a62455df7f7427f',
                        hex: '58206b61736a6469756f707769706f6470656f69776f70696f65657770706f696665',
                        fingerprint: 'asset1630cmjzramsxppx9l94c48nzskwgucqy33tlzm',
                        totalSupply: '3',
                        mintingTxHash: 'e060123954173a99fda64bb302023d8b0426709ad064aaa410d1faa3e2eb4403',
                        mintCount: 3
                    })];
                case 1:
                    txHash = _a.sent();
                    console.log("TxHash : " + txHash);
                    return [2 /*return*/];
            }
        });
    });
}
main();
