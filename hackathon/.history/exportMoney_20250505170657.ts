import {
  deserializeAddress,
  mConStr0,
  stringToHex,
  BrowserWallet,
  deserializeDatum
} from "@meshsdk/core";
import {
  blockchainProvider,
  getWalletInfoForTx,
  getTxBuilder,
} from "./adapter";
export async function exportMoney(
  txHash: string[],
  wallet: BrowserWallet, 
  amount: number,
  scriptAddr: string,
  constributeScriptCbor: string,
  addrReceiver: string,
  admin: string
  ){
    try {
  const {utxos, walletAddress, collateral} = await getWalletInfoForTx(wallet);
  const pubkeyContributor = deserializeAddress(walletAddress).pubKeyHash;
  const pubkeyAdmin = deserializeAddress(admin).pubKeyHash;
  const txBuilder = getTxBuilder();
  let amountSelect = 0;
  for(const tx of txHash){
    const txUtxos = await blockchainProvider.fetchUTxOs(tx);
    console.log("txUtxos", txUtxos);
   
    let scriptUtxo = null;
    for (let i = 0; i < txUtxos.length; i++) {
      if (txUtxos[i].output.plutusData !== undefined) {
        scriptUtxo = txUtxos[i];
        console.log("scriptUtxo", scriptUtxo);
        break;
      }
    }

    if (!scriptUtxo || !scriptUtxo.output.plutusData) {
      throw new Error(`No UTxO with Plutus data found in transaction ${tx}`);
    }
    const datumfetch = deserializeDatum(scriptUtxo.output.plutusData!);
    const amountfetch = Number(datumfetch.fields[0].int);
    amountSelect += amountfetch;    
    if (!scriptUtxo.output.plutusData) throw new Error('Plutus data not found');
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
    .txOut(
      walletAddress
      , 
      [])
    .txInCollateral(
        collateral.input.txHash,
        collateral.input.outputIndex,
        collateral.output.amount,
        collateral.output.address,
    )
  }
  const datum = mConStr0([amountSelect - amount, pubkeyContributor, pubkeyAdmin])
    if (amountSelect - amount > 1200000) {
    await txBuilder
    .spendingPlutusScriptV3()
    .txOut(
      addrReceiver,
      [{
        unit: "lovelace",
        quantity: amount.toString(),
      }]
    ) 
    .txOut(
      scriptAddr,
      [{
        unit: "lovelace",
        quantity: (amountSelect - amount).toString(),
      }]
    )
    .txOutInlineDatumValue(datum)
    .changeAddress(walletAddress)
    .requiredSignerHash(pubkeyContributor)
    .selectUtxosFrom(utxos)
    .setNetwork("preview")
    .addUtxosFromSelection();
  }
  else{
    await txBuilder
    .spendingPlutusScriptV3()
    .txOut(
      addrReceiver,
      [{
        unit: "lovelace",
        quantity: amount.toString(),
      }]
    ) 
    //.txOutInlineDatumValue(datum)
    .changeAddress(walletAddress)
    .requiredSignerHash(pubkeyContributor)
    .selectUtxosFrom(utxos)
    .setNetwork("preview")
    .addUtxosFromSelection();

    const completedTx = await txBuilder.complete();     
    const signedTx = await wallet.signTx(completedTx, true);
    const txhash = await wallet.submitTx(signedTx);
    console.log("txhash", txhash);
    return txhash;
  }
  } catch (error) {
    console.error("Error in exportMoney function:", error);
    throw new Error("Error in exportMoney function: " + error);
  }
}

async function main(){
  
    


}
main();
