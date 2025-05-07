import {
    applyParamsToScript,
    Asset,
    BrowserWallet,
    deserializeAddress,
    mConStr0,
    MeshTxBuilder,
    serializePlutusScript,
    stringToHex,
  } from "@meshsdk/core";
  
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
    getScripCborAndScriptAddr
  } from "../general.ts";
export async function buyerRefund(
    walletA: any,
    txHash: string
){
    const {utxos, walletAddress, collateral} = await getWalletInfoForTx(walletA);
    const pubKeyBuyer = getPubkeyHash(walletAddress);

    const {scriptCbor, scriptAddr} = getScripCborAndScriptAddr(
        "payment.payment.spend", 
        []);
    console.log("scriptAddr: ", scriptAddr);
    console.log("scriptCbor: ", scriptCbor);
    const txBuilder = getTxBuilder();
    const scriptUtxo = await getUtxoByTxHash(txHash);
    if (!scriptUtxo) {
        throw new Error("No UTXOs found for the given transaction hash.");
    }
    console.log("scriptUtxo: ", scriptUtxo);
    await txBuilder
    .spendingPlutusScriptV3()
    .txIn(
        scriptUtxo.input.txHash,
        scriptUtxo.input.outputIndex,
        scriptUtxo.output.amount,
        scriptAddr
    )
    .txInInlineDatumPresent()
    .txInRedeemerValue(mConStr0[])
    
    .txInScript(scriptCbor)
    .txOut(walletAddress, [])
    .txInCollateral(
        collateral.input.txHash,
        collateral.input.outputIndex,
        collateral.output.amount,
        collateral.output.address,
    )
    .changeAddress(walletAddress)
    .requiredSignerHash(pubKeyBuyer)
    .selectUtxosFrom(utxos)
    .setNetwork("preprod")
    .addUtxosFromSelection();

    const tx = await txBuilder.complete();
    const txId = await submitTx(tx, walletA);
    console.log("Transaction Refund Successfully !, txID: ", txId);
}
async function main(){
    const wallet = walletA;
    const txHash = "28fd8613a36cdba120efc9919de1412e2abce8be2da305e2350484ece8ac224b";
    await buyerRefund(wallet, txHash);
}
main();