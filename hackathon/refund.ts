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

  async function contributorRefund(txHash: string){
    try{
    const {utxos, walletAddress, collateral} = await getWalletInfoForTx(wallet);
    const pubkeyContributor = deserializeAddress(walletAddress).pubKeyHash;
    //Fetch Datum
    const scriptUtxos = await blockchainProvider.fetchUTxOs(txHash);
    if (!scriptUtxos || scriptUtxos.length === 0) {
      throw new Error("No UTXOs found for the given transaction hash.");
    }
    const scriptUtxo = scriptUtxos[0];
    
    const datum = deserializeDatum(scriptUtxo.output.plutusData!);
     console.log("Datum : ", datum);
    const contributeCompileCode = readValidator("contribute.contribute.spend");
    const constributeScriptCbor = applyParamsToScript(
      contributeCompileCode,
      [],
    );

    const scriptAddr = serializePlutusScript(
      { code: constributeScriptCbor, version: "V3" },
      undefined,
      0,
    ).address;
    const utxoScript = await blockchainProvider.fetchAddressUTxOs(scriptAddr);
    console.log("Script Address : ", scriptAddr);
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
    .txInRedeemerValue(mConStr0([stringToHex("long")]))
    .txInScript(constributeScriptCbor)
    .txOut(walletAddress, [])
    .txInCollateral(
        collateral.input.txHash,
        collateral.input.outputIndex,
        collateral.output.amount,
        collateral.output.address,
    )
    .changeAddress(walletAddress)
    .requiredSignerHash(pubkeyContributor)
    .selectUtxosFrom(utxos)
    .setNetwork("preprod")
    .addUtxosFromSelection();
    const completedTx = await txBuilder.complete();
    
    const signedTx = await wallet.signTx(completedTx, true);
    const txhash = await wallet.submitTx(signedTx);
    
    return txhash;
    }
    catch(error){
      console.log("Error : ", error);
      throw error;
    }
  }
  async function main(){
    const txHash = "87515028faf6499102a80fd41c7a686eccf545e0ef98d4ce07c43427ea6f04f0";
    const txRefund = await contributorRefund(txHash);
    console.log("txRefund: ", txRefund);
  }
  main();
  