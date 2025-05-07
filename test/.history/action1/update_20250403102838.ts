import {
    Asset,
    deserializeAddress,
    deserializeDatum,
    mConStr0,
    MeshTxBuilder, 
  } from "@meshsdk/core";
  import {
    blockchainProvider,
    getScript,
    getWalletInfoForTx,
    wallet,
  } from "./adapter";
  const doctorAddress = "addr_test1qqwkave5e46pelgysvg6mx0st5zhte7gn79srscs8wv2qp5qkfvca3f7kpx3v3rssm4j97f63v5whrj8yvsx6dac9xrqyqqef6";
  async function main(){
    try{
        const {utxos, walletAddress, collateral} = await getWalletInfoForTx(wallet);
        const {pubKeyHash: userPubKeyHash} = deserializeAddress(walletAddress);
        const {pubKeyHash: doctorPubKeyHash} = deserializeAddress(doctorAddress);
        const {scriptAddr, scriptCbor} = getScript();
        const txHashLock = "f6af1c944d65af95e48d4e94ba355e82c08f1d4936fad550f188cbad3801ed92";
        const utxoFetch = await blockchainProvider.fetchUTxOs(txHashLock);
        console.log("utxo fetch : ", utxoFetch);
        const utxo = utxoFetch[0];

        const datum = deserializeDatum(utxo.output.plutusData!);
        const UnitAsset = datum.fields[2].bytes;
        console.log("Unit Asset : ", UnitAsset);
        const newDatum = mConStr0([userPubKeyHash, [doctorPubKeyHash]]);
        const txBuilder = new MeshTxBuilder({
            fetcher: blockchainProvider,
            submitter: blockchainProvider
        })
        const assets: Asset[] = [
            {
                unit: UnitAsset,
                quantity: "1",
            },
        ];
        await txBuilder
        .spendingPlutusScriptV3()
        .txIn(
            utxo.input.txHash,
            utxo.input.outputIndex,
            utxo.output.amount,
            scriptAddr
        )
        .txInInlineDatumPresent()
        .txInRedeemerValue(mConStr0([]))
        .txInScript(scriptCbor)
        .txOut(walletAddress, [])
        .txInCollateral(
            collateral.input.txHash!,
            collateral.input.outputIndex!,
            collateral.output.amount!,
            collateral.output.address!,
        )
        .requiredSignerHash(userPubKeyHash)
        .txOut(scriptAddr, assets)
        .txOutInlineDatumValue(newDatum)
        .changeAddress(walletAddress)
        .selectUtxosFrom(utxos)
        .setNetwork("preprod")
        .complete();

       

        const unsignedTx = txBuilder.txHex;
        const signedTx =await wallet.signTx(unsignedTx, true);
        const txHash = await wallet.submitTx(signedTx);

        console.log("Transaction submitted successfully !");
        console.log("TxHash Transaction : ", txHash);
    }catch(error){
        throw error;
    }
  }
  main();
  