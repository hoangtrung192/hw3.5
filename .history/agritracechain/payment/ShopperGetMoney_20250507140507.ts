import {
    applyParamsToScript,
    mConStr0,
    serializePlutusScript,
    stringToHex,
  } from "@meshsdk/core";
  
  import {
    walletB,

    getTxBuilder,
    getWalletInfoForTx,
    submitTx,
    getUtxoByTxHash,
    getPubkeyHash,
    readValidator
  } from "../general.ts";
export async function shopperGetMoney(
    walletB: any,
    txHash: string
){
    const {utxos, walletAddress, collateral} = await getWalletInfoForTx(walletB);
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
    .txInRedeemerValue(mConStr0([stringToHex("getPaid")]))
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
    const txId = await submitTx(tx, walletB);
    console.log("Transaction  Successfully !, txID: ", txId);
}
async function main(){
    const wallet = walletB;
    const txHash = "351f58c3c259566d17b5339d531128dab88831c88b4161b7982b2ad6577f3f15";
    await shopperGetMoney(wallet, txHash);
}
main();