import {
    BlockfrostProvider,
    MeshTxBuilder,
    MeshWallet,
    PlutusScript,
    serializePlutusScript,
    UTxO
    ,resolvePlutusScriptAddress
  } from "@meshsdk/core";
  import { applyParamsToScript } from "@meshsdk/core-csl";

  import { Script } from "node:vm";
   
  export const blockchainProvider = new BlockfrostProvider('preprod2DQWsQjqnzLW9swoBQujfKBIFyYILBiL');
   
  // wallet for signing transactions
  export const wallet = new MeshWallet({
      networkId: 0, // Mạng Cardano: 0 là Testnet (Preview, PreprodPreprod)
      fetcher: blockchainProvider, // Provider để truy vấn blockchain
      submitter: blockchainProvider, // Provider để gửi giao dịch
      key: {
          type: 'mnemonic', // loai 24 ki tu
        //   words: [
        //     "illness", "tomato", "organ", "credit", "hybrid", "path", "slight", "bomb", "allow", "media", "credit", "virtual", "uncle", "blast", "type", "very", "certain", "join", "feed", "repeat", "elbow", "place", "aim", "oblige"
        //   ], // Danh sách các từ mnemonic - beneficiary
          words: [
            "spoil", "maid", "general", "expire", "kidney", "deal", "awful", "clip", "fragile", "kitchen", "reason", "crater", "attitude", "grain", "bitter", "bag", "mouse", "reform", "cactus", "spot", "vital", "sea", "same", "salon"
          ]
      },
  });
 
  