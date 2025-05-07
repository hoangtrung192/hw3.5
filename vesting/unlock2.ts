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
  async function getUtxoForTx(address: string, txHash: string): Promise<UTxO> {
    const utxos = await blockchainProvider.fetchAddressUTxOs(address);
    const utxo = utxos.find(utxo => utxo.input.txHash === txHash);
    if (!utxo) throw new Error(`No UTXOs found for txHash: ${txHash}`);
    return utxo;
  }

  async function unlock(params: {txHash?: string }[]){
      const {scriptAddr, scriptCbor} = getScript();
      const {utxos, walletAddress, collateral} = await getWalletInfoForTx(wallet);
      const {pubKeyHash: userPubKeyHash} = deserializeAddress(walletAddress);
      const { input: collateralInput, output: collateralOutput } = collateral;
      const txBuilder = new MeshTxBuilder({
        fetcher: blockchainProvider,
        submitter: blockchainProvider,
      });

    // const utxosForScript = await blockchainProvider.fetchAddressUTxOs(scriptAddr);
    
      await Promise.all(
        params.map(async ({txHash})=>{
          
          if( !isNil(txHash)){
            const utxo =  await getUtxoForTx(scriptAddr, txHash)
            console.log(utxo.input.txHash);
          if (!utxo) throw new Error("Store UTXO not found");
          const utxouse = utxo[0];
          const datum = deserializeDatum(utxouse.output.plutus)
          const invalidBefore1 = Math.max(
          unixTimeToEnclosingSlot(Math.min(
          (datum.fields[0].int as number), Date.now() - 15000),
        SLOT_CONFIG_NETWORK.preprod,
          ) + 1, 1);
          txBuilder
          .spendingPlutusScriptV3()
          .txIn(
            utxouse.input.txHash,
            utxouse.input.outputIndex,
            utxouse.output.amount,
            scriptAddr,
          )
          .spendingReferenceTxInInlineDatumPresent()
          .spendingReferenceTxInRedeemerValue("")
          .txInScript(scriptCbor)
          .txOut(walletAddress, [])
          .invalidBefore(invalidBefore1) 
        }

        })
      
      );
      txBuilder
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
      

      const completeTx = await txBuilder.complete();
      const signedTx = await wallet.signTx(completeTx, true);
      const txHash = await wallet.submitTx(signedTx);
      return txHash;


  }

  async function main(){
    const txHash =  await unlock([]);
    console.log("TxHash : " + txHash);
  }

  main();