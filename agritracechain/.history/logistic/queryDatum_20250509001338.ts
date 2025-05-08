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
    const txHash = "f7f5f45be6d125798bda5b95c6ff552069b210417b51f61107e250c653eb29dd";
    const utxo = await getUtxoByTxHash(txHash);
    console.log("UTXO : ", utxo);
    if(!utxo) {
        throw new Error("No UTXOs found for the given transaction hash.");
    }
    const datum =hexToString(getFieldsDatum(0, utxo, "bytes"));
    const datum1 =getFieldsDatum(1, utxo, "bytes");
    const datum2 =getFieldsDatum(2, utxo, "bytes");
    const datum3 =getFieldsDatum(3, utxo, "bytes");
    const datum4 =hexToString(getFieldsDatum(4, utxo, "bytes"));
    const datum5 =getFieldsDatum(5, utxo, "int");
    console.log("Datum : ", datum);
    console.log("Datum : ", datum1);
    console.log("Datum : ", datum2);
    console.log("Datum : ", datum3);
    console.log("Datum : ", datum4);
    console.log("Datum : ", datum5);
 //   console.log("Datum : ", datum);
}
main();