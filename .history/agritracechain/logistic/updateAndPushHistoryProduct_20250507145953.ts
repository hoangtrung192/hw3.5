import {
    applyParamsToScript,
    Asset,
    BrowserWallet,
    deserializeAddress,
    mConStr0,
    MeshTxBuilder,
    serializePlutusScript,
    stringToHex,
    deserializeDatum
} from "@meshsdk/core";

import {
    walletA,
    walletB,
    blockchainProvider,
    getTxBuilder,
    getWalletInfoForTx,
    submitTx,
    getFieldsDatum,
    getUtxoByTxHash,
    getPubkeyHash,
    getScripCborAndScriptAddr,
    readValidator,
} from "../general.ts";
  
  async function updateAndPushHistoryProduct(walletB: any, txHash: string, newData: string, nextHandler: string, receiver: string) {
    try {
      const { utxos, walletAddress, collateral } = await getWalletInfoForTx(
        walletB
      );
  
      const pubkeyCurrent = deserializeAddress(walletAddress).pubKeyHash;
      const pubkeyHandlerNext = deserializeAddress(nextHandler).pubKeyHash;
      const pubkeyReceiver = deserializeAddress(receiver).pubKeyHash;
      const compileCode = readValidator("agrtracechain.agritracechain.spend");
      const scriptCbor = applyParamsToScript(
        compileCode,
        [stringToHex("abc"), 123, pubkeyReceiver, 100]
    );
  
      const scriptAddr = serializePlutusScript(
        { code: scriptCbor, version: "V3" },
        undefined,
        0,
      ).address;
     const utxo = await getUtxoByTxHash(txHash);
     if(!utxo) {
        throw new Error("No UTXOs found for the given transaction hash.");
     }
     const datum_current = deserializeDatum(utxo.output.plutusData!);
     const datum = getFieldsDatum(2, utxo, "bytes");
     const newdata = datum + newData;
      const txBuilder = getTxBuilder();
      const newDatum = mConStr0([pubkeyHandlerNext, pubkeyReceiver, stringToHex(newdata)] );
     
      await txBuilder
        .spendingPlutusScriptV3()
        .txIn(
            utxo.input.txHash,
            utxo.input.outputIndex,
            utxo.output.amount,
            scriptAddr
        )
        .txInInlineDatumPresent()
        .txInRedeemerValue(mConStr0([stringToHex("UpdateHistory")]))
        .txInScript(scriptCbor)
        .txOut(walletAddress, [])
        .txInCollateral(
            collateral.input.txHash!,
            collateral.input.outputIndex!,
            collateral.output.amount!,
            collateral.output.address!,
        )
        .requiredSignerHash(pubkeyCurrent)
        .txOut(scriptAddr, assets)
        .txOutInlineDatumValue(newDatum)
        .changeAddress(walletAddress)
        .selectUtxosFrom(utxos)
        .setNetwork("preprod")
        .complete();

      
  
      const tx =  await txBuilder.complete();
      const signedTx = await wallet.signTx(tx, true);
      const TxHash = await wallet.submitTx(signedTx);
      
      return TxHash;
    } catch(error) {
      throw new Error("Error in contribute function: " + error);
    }
  }
  async function main() {
    const admin =
      "addr_test1qqwkave5e46pelgysvg6mx0st5zhte7gn79srscs8wv2qp5qkfvca3f7kpx3v3rssm4j97f63v5whrj8yvsx6dac9xrqyqqef6";
      const assets: Asset[] = [
        {
          unit: "lovelace",
          quantity: "1100000",
        }
      ];
      const txHash = "4d795aa9f5e3fcda087b3e144691f01bf6a2fc15ae0fb9f4ae1aff05cc1538e1";
      const vote = "no";
    const amount = 3;
    const TxHash = await contribute(txHash, admin, assets, amount, vote);
    console.log("Transaction Hash: ", TxHash);
  }
  main();
  function requiredSignerHash(pubkeyContributor: string) {
    throw new Error("Function not implemented.");
  }
  
  