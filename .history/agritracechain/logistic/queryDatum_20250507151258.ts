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
    const txHash = "a1319445a0e88825c6ab1e4036091757e1a65a01ab446635a3dbeae8302b5e10";
    const utxo = getUtxoByTxHash(txHash);
    console.log("UTXO : ", utxo);
    if(!utxo) {
        throw new Error("No UTXOs found for the given transaction hash.");
    }
    const datum =hexToString(getFieldsDatum(2, utxo, "bytes"));
    console.log("Datum : ", datum);
}
main();