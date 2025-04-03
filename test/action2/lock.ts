import {
    Asset,
    BlockfrostProvider,
    deserializeAddress,
    mConStr0,
    MeshTxBuilder
  } from "@meshsdk/core";
  import {
    getScript,
    getTxBuilder,
    wallet,
    getWalletInfoForTx,
  } from "./adapter";
  const patientAddress1 = "addr_test1qqwkave5e46pelgysvg6mx0st5zhte7gn79srscs8wv2qp5qkfvca3f7kpx3v3rssm4j97f63v5whrj8yvsx6dac9xrqyqqef6";
  const blockchainProvider = new BlockfrostProvider("preprod2DQWsQjqnzLW9swoBQujfKBIFyYILBiL");
  async function main(){
    try{
      
        const {utxos, walletAddress, collateral} = await getWalletInfoForTx(wallet);
        const {pubKeyHash: doctorPubKeyHash} = deserializeAddress(walletAddress);
        const {pubKeyHash: patientPubKeyHash1} = deserializeAddress(patientAddress1);
        const assets: Asset[] = [
            {
                unit: "lovelace",
                quantity: "10000000",
            },
        ];

        const datum = mConStr0([patientPubKeyHash1, doctorPubKeyHash, 20000000]);

        const {scriptAddr, scriptCbor} = getScript();

        const txBuilder = new MeshTxBuilder({
            fetcher: blockchainProvider,
            submitter: blockchainProvider,
          });
        
        await txBuilder
        .spendingPlutusScriptV3()
        .txOut(scriptAddr, assets)
        .txOutInlineDatumValue(datum)
        .changeAddress(walletAddress)
        .selectUtxosFrom(utxos)
        .setNetwork("preprod")
        .complete();

        const unsignedTx = txBuilder.txHex;
        const signTx = wallet.signTx(unsignedTx, true);
        const txHash = await wallet.submitTx(signTx);
        
        console.log("Transaction submitted successfully!");
        console.log("Transaction hash: " + txHash);
        return txHash;
    }catch(error){
        throw error;
    }
  }
  

  main();