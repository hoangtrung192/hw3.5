import {
    walletA,
    walletB,
    blockchainProvider,
    getTxBuilder,
    getWalletInfoForTx,
    submitTx,
    getFieldsDatum,
    getUtxoByTxHash,
    getPubkeyHash,
    getScripCborAndScriptAddr,
    readValidator,
} from "../general.ts";
function hexToString(hex: string): string {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      const charCode = parseInt(hex.substring(i, i + 2), 16);
      str += String.fromCharCode(charCode);
    }
    return str;
  }
async function main(){
    const txHash = "aad13f671829f4ab231a1c9353c07d320e6f359b576ac93f38af615a87d0ad25";
    const utxo = await getUtxoByTxHash(txHash);
    console.log("UTXO : ", utxo);
    if(!utxo) {
        throw new Error("No UTXOs found for the given transaction hash.");
    }
    const datum =hexToString(getFieldsDatum(2, utxo, "bytes"));
    console.log("Datum : ", datum);
}
main();