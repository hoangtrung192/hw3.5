import {
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
        const txHashLock = "c0721f2b189cdd36aa77a4f1b4e1c3b2e20c2ac0d4c27036cfdee96302605c01";
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
        .txOut(
            "addr_test1qp32dhvj6nmhn8qjce8vsv3s0x70rrth7udxy32a7lm5yl7vchlp2ahqwyyfpv4l7fszccrngx2vcmmu5x3d3t3cy2uqpd7ewx",
            [{
                unit: "lovelace",
                quantity: "20000000"
            }]
        )
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
        //console.log("signTx : ", signedTx);
        //console.log("submitting ...")
        
        const txHash = await wallet.submitTx(signedTx);

        //console.log("Transaction submitted successfully !");
        //console.log("TxHash Transaction : ", txHash);
    }catch(error){
        throw error;
    }
  }
  main();
  