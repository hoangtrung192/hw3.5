import fs from "node:fs";
import {
  BlockfrostProvider,
  MeshTxBuilder,
  MeshWallet,
  serializePlutusScript,
  UTxO,
} from "@meshsdk/core";
import { applyParamsToScript } from "@meshsdk/core-csl";
import blueprint from "./plutus.json";
 
export const blockchainProvider = new BlockfrostProvider('previewHZApug3UnrJRVchVYzOu57hKu8PucW5o');
 
// wallet for signing transactions
export const wallet = new MeshWallet({
    networkId: 0, // Mạng Cardano: 0 là Testnet (Preview)
    fetcher: blockchainProvider, // Provider để truy vấn blockchain
    submitter: blockchainProvider, // Provider để gửi giao dịch
    key: {
        type: 'mnemonic', // loai 24 ki tu
        words: [
            "heart", "outdoor", "element", "clinic", "mushroom", 
            "clap", "undo", "author", "clip", "upper", "silk", 
            "combine", "trade", "illegal", "ship", "shoe", 
            "woman", "witness", "green", "ketchup", "blame", 
            "choice", "spice", "promote"
        ], // Danh sách các từ mnemonic
    },
});
 
export function getScript() {
  const scriptCbor = applyParamsToScript(
    blueprint.validators[0].compiledCode,
    []
  );
 
  const scriptAddr = serializePlutusScript(
    { code: scriptCbor, version: "V3" },
  ).address;
 
  return { scriptCbor, scriptAddr };
}
export async function getWalletInfoForTx(){
  const utxos = await wallet.getUtxos();
  const walletAddress = await wallet.getAddresses();
  const collateral = await wallet.getCollateral();
  return {utxos, walletAddress, collateral};
}
// reusable function to get a transaction builder
export function getTxBuilder() {
  return new MeshTxBuilder({
    fetcher: blockchainProvider,
    submitter: blockchainProvider,
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