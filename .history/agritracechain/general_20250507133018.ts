import {
    BlockfrostProvider,
    MeshTxBuilder,
    MeshWallet,
    serializePlutusScript,
    UTxO,
    deserializeDatum,
    BrowserWallet,
    deserializeAddress

  } from "@meshsdk/core";
  import { applyParamsToScript } from "@meshsdk/core-csl";
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
    const scriptCbor = 59013101010032323232323225333002323232323253330073370e900118041baa0011323232533300a3370e900018059baa00513232533300f30110021533300c3370e900018069baa00313232323232323253330133371e91106726566756e6400002133001004375c6006602a6ea801c54ccc04ccdc7a45076765745061696400002133001004375c602e6030602a6ea801c5888c8cc00400400c894ccc064004528099299980b99b8f375c603600400829444cc00c00c004c06c004dd7180098099baa00c2301500137586026602800460240026024602460246024602460246024601e6ea8028c040c038dd50018b0b1bae300f001300c375400a2c601a601c004601800260126ea800458c028c02c008c024004c024008c01c004c010dd50008a4c26cacae6955ceaab9e5573eae855d11";
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
   
 
  export async function getUtxoByTxHash(txHash: string) {
    const utxos = await blockchainProvider.fetchUTxOs(txHash);
    if (utxos.length === 0) {
      throw new Error("UTxO not found");
    }
    for(let i = 0; i <= 2; i++){
        if(utxos[i].output.plutusData !== undefined){
            return utxos[i];
        }
    }
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
  export function getFieldsDatum(index: number, utxo: any, other: string){
    const datum = deserializeDatum(utxo.output.plutusData!);
    if(other == "bytes"){
        return datum.fields[index].bytes;
    }
    else{
        return datum.fields[index].int as number;
    }
  }
  export function getPubkeyHash(addr: string){
    return deserializeAddress(addr).pubKeyHash;
  }
  export async function submitTx(tx: string, wallet: any){
    const signedTx = await wallet.signTx(tx, true);
    const txId = await wallet.submitTx(signedTx);
    return txId;
  }