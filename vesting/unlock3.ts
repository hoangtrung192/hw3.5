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
    const txBuilder = new MeshTxBuilder({
      fetcher: blockchainProvider,
      submitter: blockchainProvider,
    });

    // Fetch tất cả UTXOs liên quan đến script address
    const utxosForScript = await blockchainProvider.fetchAddressUTxOs(scriptAddr);
    if (!utxosForScript || utxosForScript.length === 0) {
      throw new Error("No UTXOs found for the script address.");
    }

    console.log(`Found ${utxosForScript.length} UTXOs. Processing from last to first...`);
    const savedUtxos: UTxO[] = [];
    for (let i = utxosForScript.length - 1; i >= 0; i--) {
    const utxo = utxosForScript[i];
    console.log(`Saving UTXO: ${utxo.input.txHash}`);
    savedUtxos.push(utxo);
     }
     console.log(savedUtxos[0].input.txHash);
     
     const utxo = (await blockchainProvider.fetchUTxOs(savedUtxos[0].input.txHash))[0];
     const datum = deserializeDatum(utxo.output.plutusData!);
     const invalidBefore = Math.max(unixTimeToEnclosingSlot(Math.min(
        (datum.fields[0].int as number), Date.now() - 15000),
        SLOT_CONFIG_NETWORK.preprod,
      ) + 1, 1);

      txBuilder
        .spendingPlutusScriptV3()
        .txIn(
          utxo.input.txHash,
          utxo.input.outputIndex,
          utxo.output.amount,
          scriptAddr
        )
        .spendingReferenceTxInInlineDatumPresent()
        .spendingReferenceTxInRedeemerValue("")
        .txInScript(scriptCbor)
        .txOut(walletAddress, [])
        .invalidBefore(invalidBefore)
      .txInCollateral(
        collateralInput.txHash,
        collateralInput.outputIndex,
        collateralOutput.amount,
        collateralOutput.address
      )
      .requiredSignerHash(userPubKeyHash)
      .changeAddress(walletAddress)
      .selectUtxosFrom(utxos)
      .setNetwork("preprod");

    console.log("Building transaction...");
    const completeTx = await txBuilder.complete();
    console.log("Signing transaction...");
    const signedTx = await wallet.signTx(completeTx, true);
    console.log("Submitting transaction...");
    const txHash = await wallet.submitTx(signedTx);
    console.log("Transaction submitted successfully! TxHash:", txHash);

    return txHash;
  }

  async function main() {
    try {
      const txHash = await unlock();
      console.log("Final TxHash:", txHash);
    } catch (error) {
      console.error("Error during unlock:", error);
    }
  }

  main();