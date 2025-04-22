import {
    Asset,
    deserializeAddress,
    deserializeDatum,
    mConStr0,
    mConStr1,
    MeshTxBuilder,
    MeshValue,
    pubKeyAddress,
    pubKeyHash,
    signData,
    SLOT_CONFIG_NETWORK,
    unixTimeToEnclosingSlot,
    UTxO,
    Transaction,
    slotToBeginUnixTime,
    scriptAddress,
    applyParamsToScript,
    serializePlutusScript,
    stringToHex,
  } from "@meshsdk/core";
  import { MeshVestingContract, VestingDatum } from "@meshsdk/contract";
  import {
    blockchainProvider,
    readValidator,
    getTxBuilder,
    getUtxoByTxHash,
    getWalletInfoForTx,
    wallet,
  } from "./adapter";
async function exportMoney(txHash: string){
    const walletAddr = "addr_test1qqhey3pqmmfr45d33f3nj0enwsmswhqkhtm3pkm2nzatqyvxj3cwzvwg9fn3mx4h2vc6tt84ch55kdcp04eeeqgdnd0s6wrjxx";
    const {utxos, walletAddress, collateral} = await getWalletInfoForTx(wallet);
    const pubkeyAdmin = deserializeAddress(walletAddress).pubKeyHash;
    const scriptUtxos = await blockchainProvider.fetchUTxOs(txHash);
    if (!scriptUtxos || scriptUtxos.length === 0) {
      throw new Error("No UTXOs found for the given transaction hash.");
    }
    const scriptUtxo = scriptUtxos[0];
    const datum = deserializeDatum(scriptUtxo.output.plutusData!);
   //  console.log("Datum : ", datum);
    const contributeCompileCode = readValidator("contribute.contribute.spend");
    const constributeScriptCbor = applyParamsToScript(
      contributeCompileCode,
      [pubkeyAdmin],
    );
    const scriptAddr = serializePlutusScript(
      { code: constributeScriptCbor, version: "V3" },
      undefined,
      0,
    ).address;

    const txBuilder = new MeshTxBuilder({
        fetcher: blockchainProvider,
        submitter: blockchainProvider,
      });

      await txBuilder
      .spendingPlutusScriptV3()
      .txIn(
          scriptUtxo.input.txHash,
          scriptUtxo.input.outputIndex,
          scriptUtxo.output.amount,
          scriptAddr
      )
      .txInInlineDatumPresent()
      .txInRedeemerValue(mConStr0([stringToHex("ExportMoney")]))
      
      .txInScript(constributeScriptCbor)
      .txOut(walletAddr, [])
      .txInCollateral(
          collateral.input.txHash,
          collateral.input.outputIndex,
          collateral.output.amount,
          collateral.output.address,
      )
      .changeAddress(walletAddress)
      .requiredSignerHash(pubkeyAdmin)
      .selectUtxosFrom(utxos)
      .setNetwork("preprod")
      .addUtxosFromSelection();
      const completedTx = await txBuilder.complete();
      
      const signedTx = await wallet.signTx(completedTx, true);
      const txhash = await wallet.submitTx(signedTx);
      
      return txhash;

    

}
async function main(){
    const txHash = await exportMoney("118ca36996eabeacb6e62bad4e96f77ac94558b0f64f436cb348516023d912fe");
    console.log("Transaction Hash : ", txHash);
}
main();
