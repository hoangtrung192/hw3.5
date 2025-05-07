import {
    applyParamsToScript,
   mConStr0,
    serializePlutusScript,
    stringToHex,
  } from "@meshsdk/core";
  
  import {
    walletA,

    getTxBuilder,
    getWalletInfoForTx,
    submitTx,
    getUtxoByTxHash,
    getPubkeyHash,
    readValidator
  } from "../general.ts";
export async function buyerRefund(
    walletA: any,
    txHash: string
){
    const {utxos, walletAddress, collateral} = await getWalletInfoForTx(walletA);
    const pubKeyBuyer = getPubkeyHash(walletAddress);
    const txBuilder = getTxBuilder();
    const scriptUtxo = await getUtxoByTxHash(txHash);
    if (!scriptUtxo) {
        throw new Error("No UTXOs found for the given transaction hash.");
    }
    const compileCode = readValidator("payment.payment.spend");
        const scriptCbor = applyParamsToScript(
            compileCode,
            []
        );
        const scriptAddr = serializePlutusScript(
            { code: scriptCbor, version: "V3" },
            undefined,
            0,
          ).address;
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
    .txInRedeemerValue(mConStr0([stringToHex("refund")]))
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
    const txHash = "a2e2620f2283feea8f0ec1a148989519a0353848f47ad430869aa19e59ae679c";
    await buyerRefund(wallet, txHash);
}
main();