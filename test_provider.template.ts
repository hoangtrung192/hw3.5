import {
    BlockfrostProvider,
    MeshTxBuilder,
    MeshWallet,
    PlutusScript,
    serializePlutusScript,
    UTxO,
    resolvePlutusScriptAddress
} from "@meshsdk/core";
import { applyParamsToScript } from "@meshsdk/core-csl";
import { Script } from "node:vm";
   
export const blockchainProvider = new BlockfrostProvider('YOUR_BLOCKFROST_API_KEY');
   
// wallet for signing transactions
export const wallet = new MeshWallet({
    networkId: 0, // Cardano Network: 0 for Testnet (Preview, Preprod), 1 for Mainnet
    fetcher: blockchainProvider, // Provider for blockchain queries
    submitter: blockchainProvider, // Provider for submitting transactions
    key: {
        type: 'mnemonic',
        words: [
            // Add your 24 word seed phrase here
            // Example format:
            // "word1", "word2", "word3", ... "word24"
        ]
    },
});