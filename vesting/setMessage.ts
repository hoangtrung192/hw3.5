import { Transaction } from '@meshsdk/core';
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
const axios = require('axios');

// Thay thế bằng khóa API Blockfrost của bạn
const blockfrostApiKey = 'preprod2DQWsQjqnzLW9swoBQujfKBIFyYILBiL';

export const blockchainProvider = new BlockfrostProvider(blockfrostApiKey);

// wallet for signing transactions
export const wallet = new MeshWallet({
    networkId: 0, // Mạng Cardano: 0 là Testnet (Preview, PreprodPreprod)
    fetcher: blockchainProvider, // Provider để truy vấn blockchain
    submitter: blockchainProvider, // Provider để gửi giao dịch
    key: {
        type: 'mnemonic', // loai 24 ki tu
        words: [
          "illness", "tomato", "organ", "credit", "hybrid", "path", "slight", "bomb", "allow", "media", "credit", "virtual", "uncle", "blast", "type", "very", "certain", "join", "feed", "repeat", "elbow", "place", "aim", "oblige"
        ], // Danh sách các từ mnemonic - beneficiary
        // words: [
        //   "spoil", "maid", "general", "expire", "kidney", "deal", "awful", "clip", "fragile", "kitchen", "reason", "crater", "attitude", "grain", "bitter", "bag", "mouse", "reform", "cactus", "spot", "vital", "sea", "same", "salon"
        // ]
    },
});

const txHash = 'b3e70a7c8764eecefe4ddd0b13683156c6dbc7d5d4f7bc8f439063e9612d32f8'; // Thay thế bằng mã băm giao dịch của bạn

axios.get(`https://cardano-preprod.blockfrost.io/api/v0/txs/${txHash}/metadata`, {
  headers: {
    project_id: blockfrostApiKey,
  },
})
.then(response => {
  console.log(response.data);
})
.catch(error => {
  console.error(error);
});