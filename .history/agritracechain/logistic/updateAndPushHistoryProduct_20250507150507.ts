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
     const datum = getFieldsDatum(2, utxo, "bytes");
     console.log("Datum : ", datum)
     const newdata = datum + newData;
      const txBuilder = getTxBuilder();
      const newDatum = mConStr0([pubkeyHandlerNext, pubkeyReceiver, stringToHex(newdata)] );
      const assets: Asset[] = [{
        unit: "lovelace",
        quantity: "1427480"
    }];
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
     const txId = await submitTx(tx, walletB);
      
      console.log("Transaction Hash: ", txId);
    } catch(error) {
      throw new Error("Error in contribute function: " + error);
    }
  }
  async function main() {
    const wallet = walletB;
    const txHash = "d8bfe676c6b9c1bbfc2ee3149be05c2771f162c5beb0986ec455c6da2ce84570";
    const newData = "newData";
    const nextHandler = "addr_test1qp32dhvj6nmhn8qjce8vsv3s0x70rrth7udxy32a7lm5yl7vchlp2ahqwyyfpv4l7fszccrngx2vcmmu5x3d3t3cy2uqpd7ewx";
    const receiver = "addr_test1qrsv6r79uzuq0uwvj7jez8qy7pl308egptkvuf99p84n0rt7m2m2y4lpett6mh7pgv5lktq0ktcmgl87tufpstn5nxmqtyv065";
    await updateAndPushHistoryProduct(
        wallet,
        txHash,
        newData,
        nextHandler,
        receiver
    )
  }
  main();
  function requiredSignerHash(pubkeyContributor: string) {
    throw new Error("Function not implemented.");
  }
  //addr_test1wr6sdyafvwvg0qcp9pds8pyd7pxcnmwkptfyuzv2lychvag76nd9s
  