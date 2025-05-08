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
    const txHash = "11dc0bd0a6e730498b94f232e044fe0a58df2586ca07a358dc09058add0aac78";
    const utxo = await getUtxoByTxHash(txHash);
    console.log("UTXO : ", utxo);
    if(!utxo) {
        throw new Error("No UTXOs found for the given transaction hash.");
    }
    const datum =hexToString(getFieldsDatum(0, utxo, "bytes"));
    const datum =hexToString(getFieldsDatum(1, utxo, "bytes"));
    const datum =hexToString(getFieldsDatum(2, utxo, "bytes"));
    const datum =hexToString(getFieldsDatum(2, utxo, "bytes"));
    const datum =hexToString(getFieldsDatum(2, utxo, "bytes"));
    const datum =hexToString(getFieldsDatum(2, utxo, "bytes"));
    console.log("Datum : ", datum);
}
main();