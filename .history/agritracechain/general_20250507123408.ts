import {
    BlockfrostProvider,
    MeshTxBuilder,
    MeshWallet,
    PlutusScript,
    serializePlutusScript,
    UTxO
    ,resolvePlutusScriptAddress,
    BrowserWallet,
  } from "@meshsdk/core";
  import { applyParamsToScript } from "@meshsdk/core-csl";
  import blueprint from "./plutus.json";
  import { Script } from "node:vm";
   import plutus from './plutus.json';
  export const blockchainProvider = new BlockfrostProvider('preprod2DQWsQjqnzLW9swoBQujfKBIFyYILBiL');
   
  export const walletA = new MeshWallet({
      networkId: 0,
      fetcher: blockchainProvider, 
      submitter: blockchainProvider, 
      key: {
          type: 'mnemonic', 
          words: [
            "illness", "tomato", "organ", "credit", "hybrid", "path", "slight", "bomb", "allow", "media", "credit", "virtual", "uncle", "blast", "type", "very", "certain", "join", "feed", "repeat", "elbow", "place", "aim", "oblige"
          ], // beneficiary
          
      },
  });
  export const walletB = new MeshWallet({
    networkId: 0, 
    fetcher: blockchainProvider, 
    submitter: blockchainProvider, 
    key: {
        type: 'mnemonic', 
        words: [
          "spoil", "maid", "general", "expire", "kidney", "deal", "awful", "clip", "fragile", "kitchen", "reason", "crater", "attitude", "grain", "bitter", "bag", "mouse", "reform", "cactus", "spot", "vital", "sea", "same", "salon"
        ], 
      }
  });

  function readValidator(title: string): string {
      const validator = plutus.validators.find(v => v.title === title);
      if (!validator) {
        throw new Error(`${title} validator not found.`);
      }
      return validator.compiledCode;
    }
  
  export function getScripCborAndScriptAddr(title: string, ...params: any[]){
    const compiledCode = readValidator(title);
    const scriptCbor = applyParamsToScript(
        compiledCode,
        [
            params
        ]
    );
    const scriptAddr = serializePlutusScript(
        { code: scriptCbor, version: "V3" },
        undefined,
        0,
      ).address;
      return {scriptCbor, scriptAddr};
  }
  
  export function getTxBuilder() {
    return new MeshTxBuilder({
      fetcher: blockchainProvider,
      submitter: blockchainProvider,
      verbose:true,
    });
  }
   
 
  export async function getUtxoByTxHash(txHash: string): Promise<UTxO> {
    const utxos = await blockchainProvider.fetchUTxOs(txHash);
    if (utxos.length === 0) {
      throw new Error("UTxO not found");
    }
    if()
  }
  
  
  
  export async function getWalletInfoForTx(wallet: BrowserWallet) {
    const walletAddress = (await wallet.getUsedAddresses())[0];
    const utxos = await blockchainProvider.fetchAddressUTxOs(walletAddress);
    const collateral = (await wallet.getCollateral())[0];
    return { utxos, walletAddress, collateral };
  }
  export async function getUtxoForTx(address: string, txHash: string, wallet){
    const utxos: UTxO[] = await blockchainProvider.fetchAddressUTxOs(address);
    const utxo = utxos.find(function (utxo: UTxO) {
      return utxo.input.txHash === txHash;
    });
  
    if (!utxo) throw new Error("No UTXOs found in getUtxoForTx method.");
    return utxo;
  }
  
  export async function getAddressUTXOAsset(address: string, unit: string, wallet)  {
    const utxos = await blockchainProvider.fetchAddressUTxOs(address, unit);
    return utxos[utxos.length - 1];
  };