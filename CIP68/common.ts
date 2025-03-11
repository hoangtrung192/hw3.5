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
//   import blueprint from "./plutus.json";
  import { Script } from "node:vm";
  //script always success
  export const demoPlutusAlwaysSucceedScript = "4e4d01000033222220051200120011";
  export const oneTimeMintingPolicy =
  "5901e6010000323232323232322232322533300632323232533300a3007300b3754002264a666016601060186ea802454ccc02cc020c030dd519198008009bac3011300e375400844a6660200022980103d87a800013232533300f3375e01c601260226ea80084cdd2a40006602600497ae01330040040013014002301200114a229404c8cc004004c8cc004004c8cc004004dd59809980a180a180a180a18081baa00622533301200114bd6f7b630099191919299980999b9148900002153330133371e91010000210031005133017337606ea4008dd3000998030030019bab3014003375c6024004602c004602800244a666022002297ae01323332223233001001003225333017001100313233019374e660326ea4018cc064c058004cc064c05c0052f5c066006006603600460320026eb8c040004dd5980880099801801980a80118098009129998080008a51132533300e32533300f3371e6eb8c0240040144cdc41bad301430153015001480005289bac301300213300300300114a060260026eb8c03cc030dd50008a50300e300f002300d001300937540044601800229309b2b19299980298010008a99980418039baa00314985854ccc014cdc3a40040022a666010600e6ea800c5261616300537540046e1d20005734aae7555cf2ab9f5740ae855d101";


  export const blockchainProvider = new BlockfrostProvider('preprod2DQWsQjqnzLW9swoBQujfKBIFyYILBiL');
   
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
 // console.log(wallet.getChangeAddress());
//   export function getScript() {
//     const scriptCbor = applyParamsToScript(
//       blueprint.validators[0].compiledCode,
//       []
//     );
//     const script: PlutusScript = {
//       code : scriptCbor,
//       version: "V3"
//     }
   
//     const scriptAddr = serializePlutusScript(
//       { code: scriptCbor, version: "V3" },undefined, 0
//     ).address;;
    
   
//     return { scriptCbor, scriptAddr };
//   }
  
  // reusable function to get a transaction builder
  export function getTxBuilder() {
    return new MeshTxBuilder({
      fetcher: blockchainProvider,
      submitter: blockchainProvider,
      verbose:true,
    });
  }
   
  // reusable function to get a UTxO by transaction hash
  export async function getUtxoByTxHash(txHash: string): Promise<UTxO> {
    const utxos = await blockchainProvider.fetchUTxOs(txHash);
    if (utxos.length === 0) {
      throw new Error("UTxO not found");
    }
    return utxos[0];
  }
  
  
  
  export async function getWalletInfoForTx(wallet) {
    const utxos = await wallet.getUtxos();
    const walletAddress = (await wallet.getUsedAddresses())[0];
    const collateral = (await wallet.getCollateral())[0];
    return { utxos, walletAddress, collateral };
  }
  
  