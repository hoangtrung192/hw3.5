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

  async function main(){
    try{
        const {utxos, walletAddress, collateral} = await getWalletInfoForTx(wallet);
        const {pubKeyHash: userPubKeyHash} = deserializeAddress(walletAddress);     
        const {scriptAddr, scriptCbor} = getScript();
        const txHashLock = "535150993027f32dfb7f593aa93d8832e25f712daaf2bec612709d30fa2b83fc"; 
        const utxoFetch = await blockchainProvider.fetchUTxOs(txHashLock);
        const utxo = utxoFetch[0];
        const datum = deserializeDatum(utxo.output.plutusData!);
        const txBuilder = new MeshTxBuilder({
            fetcher: blockchainProvider,
            submitter: blockchainProvider
        })
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
        .changeAddress(walletAddress)
        .txInScript(scriptCbor)
        .txOut(walletAddress, [])
        .txInCollateral(
            collateral.input.txHash!,
            collateral.input.outputIndex!,
            collateral.output.amount!,
            collateral.output.address!,
        )
        .requiredSignerHash(userPubKeyHash)
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
  