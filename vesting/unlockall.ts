
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
    slotToBeginUnixTime
  } from "@meshsdk/core";
  import { MeshVestingContract, VestingDatum } from "@meshsdk/contract";
  import {
    blockchainProvider,
    getScript,
    getTxBuilder,
    getUtxoByTxHash,
    getWalletInfoForTx,
    wallet,
  } from "./common";
  import { isEmpty, isNil } from "lodash";


  async function unlock() {
    const { scriptAddr, scriptCbor } = getScript();
    const { utxos, walletAddress, collateral } = await getWalletInfoForTx(wallet);
    const { pubKeyHash: userPubKeyHash } = deserializeAddress(walletAddress);
    const { input: collateralInput, output: collateralOutput } = collateral;
  
    // Fetch tất cả UTXOs của script
    // const utxosForScript = await blockchainProvider.fetchAddressUTxOs(scriptAddr);
    // if (!utxosForScript || utxosForScript.length === 0) {
    //   throw new Error("No UTXOs found for the script address.");
    // }
  
    // console.log(`Found ${utxosForScript.length} UTXOs. Processing in batches of 10...`);
  const txBuilder = new MeshTxBuilder({
        fetcher: blockchainProvider,
        submitter: blockchainProvider,
        verbose: true
      });
      
      const utxo1 = (await blockchainProvider.fetchUTxOs("314e1c0236f6796af9bb7576f4afd22441c3b9be17a061020c4e29f4fdaaf81d"))[0];
      const utxo2 = (await blockchainProvider.fetchUTxOs("0d2b8bae02c3fcfe2c10ee739ab3acaa606ac5f5e8962edc147c813a4473a104"))[0];

      const datum1 = deserializeDatum(utxo1.output.plutusData!);
      const datum2 = deserializeDatum(utxo2.output.plutusData!);

      const invalidBefore1 = Math.max(unixTimeToEnclosingSlot(Math.min(
        (datum1.fields[0].int as number), Date.now() - 15000),
        SLOT_CONFIG_NETWORK.preprod,
      ) + 1, 1);
      const invalidBefore2 = Math.max(unixTimeToEnclosingSlot(Math.min(
        (datum2.fields[0].int as number), Date.now() - 15000),
        SLOT_CONFIG_NETWORK.preprod,
      ) + 1, 1);
      console.log("Building Transaction !");
      
      await txBuilder
          .spendingPlutusScriptV3()
          .txIn(
            utxo1.input.txHash,
            utxo1.input.outputIndex,
            utxo1.output.amount,
            scriptAddr,
          )
          .spendingReferenceTxInInlineDatumPresent()
          .spendingReferenceTxInRedeemerValue("")
          .txInScript(scriptCbor)
          .txOut(walletAddress, [])
          .invalidBefore(invalidBefore1) ;
        
    await txBuilder
          .spendingPlutusScriptV3()
          .txIn(
            utxo2.input.txHash,
            utxo2.input.outputIndex,
            utxo2.output.amount,
            scriptAddr,
          )
          .spendingReferenceTxInInlineDatumPresent()
          .spendingReferenceTxInRedeemerValue("")
          .txInScript(scriptCbor)
          .txOut(walletAddress, [])
          .invalidBefore(invalidBefore2) ;

       await txBuilder
      .txInCollateral(
        collateralInput.txHash,
        collateralInput.outputIndex,
        collateralOutput.amount,
        collateralOutput.address
      )
      .requiredSignerHash(userPubKeyHash)
      .changeAddress(walletAddress)
      .selectUtxosFrom(utxos)
      .setNetwork("preprod")
      
      console.log('Oke');
      const completeTx = await txBuilder.complete();
      console.log("Signing ...");
      const signedTx = await wallet.signTx(completeTx, true);
      console.log("Submiting");
      const txHash = await wallet.submitTx(signedTx);
      return txHash;
  }

async function main() {
  const txHash = await unlock();
  console.log("TxHash Transaction : ", txHash);
}

main();