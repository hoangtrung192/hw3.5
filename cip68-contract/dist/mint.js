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
// Configuration constants
var BLOCKFROST_API_KEY = 'preprod2DQWsQjqnzLW9swoBQujfKBIFyYILBiL';
var NETWORK_ID = 0; // 0 = Testnet (Preview, Preprod), 1 = Mainnet
var PLATFORM_FEE = '1000000'; // 1 ADA in lovelace
var TOKEN_NAME = 'meshjs';
var MIN_ADA_WITH_TOKEN = '1500000'; // 1.5 ADA
var IMAGE_IPFS_HASH = 'ipfs://bafkreibktdoly7abv5gqg6xn7gskjliyxw3sqflqldznehbh4r3p522p6a';
// Initialize blockchain provider
var blockchainProvider = new core_1.BlockfrostProvider('preprod2DQWsQjqnzLW9swoBQujfKBIFyYILBiL');
// Initialize wallet for transaction signing
/**
 * Gets a validator's compiled code from the blueprint file
 * @param title The validator title to search for
 * @returns The compiled code for the validator
 */
function readValidator(title) {
    var validator = plutus_json_1["default"].validators.find(function (v) { return v.title === title; });
    if (!validator) {
        throw new Error(title + " validator not found.");
    }
    return validator.compiledCode;
}
/**
 * Mint a new CIP68 token with reference and user tokens
 */
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, utxos, walletAddress, collateral, _b, scriptCbor, scriptAddr, userPubKeyHash, exChange, pubkeyExchange, tokenMetadata, assets, mintCompilecode, storeCompilecode, storeScriptCbor, storeScript, storeAddress, txBuilder, storeScriptHash, mintScriptCbor, mintScript, policyId, hexAssetName, unsignedTx, completedTx, signedTx, txHash, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
                    console.log("Starting mint process...");
                    return [4 /*yield*/, common_1.getWalletInfoForTx(common_1.wallet)];
                case 1:
                    _a = _c.sent(), utxos = _a.utxos, walletAddress = _a.walletAddress, collateral = _a.collateral;
                    console.log("Collateral : " + collateral);
                    console.log("utxos : " + utxos);
                    _b = common_1.getScript(), scriptCbor = _b.scriptCbor, scriptAddr = _b.scriptAddr;
                    console.log("scriptAddr : " + scriptAddr);
                    userPubKeyHash = core_1.deserializeAddress(walletAddress).pubKeyHash;
                    exChange = "addr_test1qqwkave5e46pelgysvg6mx0st5zhte7gn79srscs8wv2qp5qkfvca3f7kpx3v3rssm4j97f63v5whrj8yvsx6dac9xrqyqqef6";
                    pubkeyExchange = core_1.deserializeAddress(exChange).pubKeyHash;
                    console.log("Wallet address:", walletAddress);
                    tokenMetadata = {
                        name: TOKEN_NAME,
                        image: IMAGE_IPFS_HASH,
                        mediaType: "image/jpg",
                        description: "My second  CIP68 token DID",
                        _pk: userPubKeyHash,
                        hex: "kasjdiuopwipodpeoiwopioeewppoife"
                    };
                    assets = blockchainProvider.fetchAssetAddresses(walletAddress);
                    console.log("asset : " + assets);
                    // Get validator scripts
                    console.log("Reading validators from blueprint...");
                    mintCompilecode = readValidator("mint.mint.mint");
                    storeCompilecode = readValidator("store.store.spend");
                    console.log("read oke");
                    storeScriptCbor = core_1.applyParamsToScript(storeCompilecode, [pubkeyExchange, BigInt(1), userPubKeyHash]);
                    storeScript = {
                        code: storeScriptCbor,
                        version: "V3"
                    };
                    storeAddress = core_1.serializeAddressObj(core_1.scriptAddress(core_1.deserializeAddress(core_1.serializePlutusScript(storeScript, undefined, 0, false).address).scriptHash, core_1.deserializeAddress(exChange).stakeCredentialHash, false), 0);
                    txBuilder = new core_1.MeshTxBuilder({
                        fetcher: blockchainProvider,
                        submitter: blockchainProvider,
                        verbose: true
                    });
                    storeScriptHash = core_1.deserializeAddress(storeAddress).scriptHash;
                    mintScriptCbor = core_1.applyParamsToScript(mintCompilecode, [
                        pubkeyExchange,
                        BigInt(1),
                        storeScriptHash,
                        core_1.deserializeAddress(exChange).stakeCredentialHash,
                        userPubKeyHash,
                    ]);
                    mintScript = {
                        code: mintScriptCbor,
                        version: "V3"
                    };
                    policyId = core_1.resolveScriptHash(mintScriptCbor, "V3");
                    hexAssetName = core_1.stringToHex(TOKEN_NAME);
                    console.log("policyid : ", policyId);
                    // Start building transaction
                    console.log("Building mint transaction...");
                    unsignedTx = txBuilder.mintPlutusScriptV3();
                    // Mint reference and user tokens
                    unsignedTx
                        // Mint user token (CIP68_222)
                        //.mintPlutusScriptV3()
                        .mint("1", policyId, core_1.CIP68_222(hexAssetName))
                        .mintingScript(mintScriptCbor)
                        .mintRedeemerValue(core_1.mConStr0([]))
                        // Mint reference token (CIP68_100)
                        .mintPlutusScriptV3()
                        .mint("1", policyId, core_1.CIP68_100(hexAssetName))
                        .mintingScript(mintScriptCbor)
                        .mintRedeemerValue(core_1.mConStr0([]))
                        // Store reference token with metadata at store address
                        .txOut(storeAddress, [
                        {
                            unit: policyId + core_1.CIP68_100(hexAssetName),
                            quantity: "1"
                        }
                    ])
                        .txOutInlineDatumValue(core_1.metadataToCip68(tokenMetadata))
                        // Send user token to wallet
                        .txOut(walletAddress, [
                        {
                            unit: policyId + core_1.CIP68_222(hexAssetName),
                            quantity: "1"
                        },
                    ])
                        // Add platform fee payment
                        .txOut(exChange, [
                        {
                            unit: "lovelace",
                            quantity: PLATFORM_FEE
                        }
                    ])
                        .changeAddress(walletAddress)
                        .requiredSignerHash(userPubKeyHash)
                        .selectUtxosFrom(utxos)
                        .txInCollateral(collateral.input.txHash, collateral.input.outputIndex, collateral.output.amount, collateral.output.address)
                        .setNetwork("preprod")
                        .addUtxosFromSelection();
                    return [4 /*yield*/, unsignedTx.complete()];
                case 2:
                    completedTx = _c.sent();
                    signedTx = common_1.wallet.signTx(completedTx, true);
                    console.log("Submitting transaction...");
                    return [4 /*yield*/, common_1.wallet.submitTx(signedTx)];
                case 3:
                    txHash = _c.sent();
                    console.log("Transaction submitted successfully!");
                    console.log("Transaction hash:", txHash);
                    console.log("Check explorer: https://preprod.cexplorer.io/tx/" + txHash);
                    return [2 /*return*/, txHash];
                case 4:
                    error_1 = _c.sent();
                    console.error("Error in mint process:", error_1);
                    throw error_1;
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Execute the mint function
main()
    .then(function (txHash) { return console.log("Mint completed with hash:", txHash); })["catch"](function (err) { return console.error("Mint failed:", err); });
// Run with: npx tsx mint.ts
