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

async function main() {
  try {
    const meshTxBuilder = new MeshTxBuilder({
      fetcher: blockchainProvider,
      submitter: blockchainProvider,
    });

    const txHash =
      "eb80b8f4300406d694109551ab2344373018e7e07ea7cbfb350d2ebb52d21d7c";
     //process.argv[2];
    const contractutxos = await blockchainProvider.fetchUTxOs(txHash);
    //console.log("Contract UTXOs:", contractutxos);

    if (!contractutxos || contractutxos.length === 0) {
      throw new Error("No UTXOs found for the given transaction hash.");
    }
    const assets: Asset[] = [
      {
        unit: "lovelace",
        quantity: "20000000",
      },
      // {
      //   unit: "e517dddf607a2dca4a28223885af5af423618f3c512930043563b885",
  
      //   quantity: "1",
      // },
    ];
    // Tìm UTXO hợp lệ
    const vestingUtxo = contractutxos[0];

    // if (!vestingUtxo || !vestingUtxo.input || !vestingUtxo.output) {
    //   console.error("Invalid UTXO data:", vestingUtxo);
    //   throw new Error("Invalid UTXO data.");
    // }

    // console.log("Vesting UTXO:", vestingUtxo);

    const { utxos, walletAddress, collateral } = await getWalletInfoForTx(wallet);
    const { input: collateralInput, output: collateralOutput } = collateral;
    // if (!collateral || collateral.length === 0) {
    //   throw new Error("No collateral UTXO found in the wallet.");
    // }

    //const collateralInput = collateral[0].input;
    //const collateralOutput = collateral[0].output;

    // console.log("Collateral Input:", collateralInput);
    // console.log("Collateral Output:", collateralOutput);

    const { scriptAddr, scriptCbor } = getScript();
    const { pubKeyHash } = deserializeAddress(walletAddress);
    
    const datum = deserializeDatum(vestingUtxo.output.plutusData!);
   // console.log("Datum:", datum);
    const pubkeyCurrent = datum.fields[2].bytes;
    const invalidBefore1 =
      unixTimeToEnclosingSlot(Math.min(
        (datum.fields[0].int as number), Date.now() - 15000),
        SLOT_CONFIG_NETWORK.preprod,
      ) + 1;
      
    const txBuilder = new MeshTxBuilder({
      fetcher: blockchainProvider,
      submitter: blockchainProvider,
    });
    await txBuilder
      .spendingPlutusScriptV3()
      .txIn(
        vestingUtxo.input.txHash,
        vestingUtxo.input.outputIndex,
        vestingUtxo.output.amount,
        scriptAddr
      )
      .spendingReferenceTxInInlineDatumPresent()
      
      .spendingReferenceTxInRedeemerValue("")
      //.txInInlineDatumPresent()
      //.txInDatumValue(mConStr0([invalidBefore, ownerPubKeyHash, beneficiaryPubKeyHash]))  
      //.txInRedeemerValue(mConStr1([]))
     //.txInDatumValue(mConStr0([signerHash]))
      .txInScript(scriptCbor)
      .txOut(walletAddress, [])
      .txInCollateral(
        collateralInput.txHash,
        collateralInput.outputIndex,
        collateralOutput.amount,
        collateralOutput.address
      )
      
      .invalidBefore(invalidBefore1)     
      .requiredSignerHash(pubKeyHash)
      .changeAddress(walletAddress)
      .selectUtxosFrom(utxos)
      .setNetwork("preprod")
      .complete();

    console.log("Transaction built successfully.");

    const unsignedTx = txBuilder.txHex;
    console.log("Unsigned Transaction:", unsignedTx);
  
    const signedTx = await wallet.signTx(unsignedTx, true);
    console.log("Signed Transaction:", signedTx);

    const txhash = await wallet.submitTx(signedTx);
    console.log("Transaction Hash:", txhash);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main().catch(error => {
  console.error("Unhandled error:", error);
});