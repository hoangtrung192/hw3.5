import {
    Asset,
    BlockfrostProvider,
    deserializeAddress,
    mConStr0,
    MeshTxBuilder
  } from "@meshsdk/core";
  import {
    getScript,
    wallet,
    getWalletInfoForTx,
  } from "./adapter";
  const doctorAddress1 = "addr_test1qqwkave5e46pelgysvg6mx0st5zhte7gn79srscs8wv2qp5qkfvca3f7kpx3v3rssm4j97f63v5whrj8yvsx6dac9xrqyqqef6";
  const doctorAddress2 = "addr_test1qqhey3pqmmfr45d33f3nj0enwsmswhqkhtm3pkm2nzatqyvxj3cwzvwg9fn3mx4h2vc6tt84ch55kdcp04eeeqgdnd0s6wrjxx";
  const blockchainProvider = new BlockfrostProvider("preprod2DQWsQjqnzLW9swoBQujfKBIFyYILBiL");
  async function main(){
    try{
      
        const {utxos, walletAddress, collateral} = await getWalletInfoForTx(wallet);
        const {pubKeyHash: patientPubKeyHash} = deserializeAddress(walletAddress);
        const {pubKeyHash: doctorPubKeyHash1} = deserializeAddress(doctorAddress1);
        const {pubKeyHash: doctorPubKeyHash2} = deserializeAddress(doctorAddress2);
        const assets: Asset[] = [
            {
                unit: "c3928d5f3308b9ac91b870c650e4d31d2222a26e34b8823b6d86e35d000de14052656420426f6f6b",
                quantity: "1",
            },
        ];

        const datum = mConStr0([patientPubKeyHash, [doctorPubKeyHash1, doctorPubKeyHash2]]);
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