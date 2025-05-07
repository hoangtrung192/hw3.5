import {
    applyParamsToScript,
    Asset,
    BrowserWallet,
    deserializeAddress,
    mConStr0,
    MeshTxBuilder,
    serializePlutusScript,
    stringToHex,
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
    getScripCborAndScriptAddr
  } from "../general.ts";
export async function buyerBuyProduct(
    walletA: any,
    buyer: string,
    shopper: string,
    product_id: string,
    product_name: string,
    timeExpire: number,
    is_paid: number,
    price: number
){
    const {utxos, walletAddress, collateral} = await getWalletInfoForTx(walletA);
    const pubKeyBuyer = getPubkeyHash(walletAddress);
    const pubKeyShopper = getPubkeyHash(shopper);
    const {scriptCbor, scriptAddr} = getScripCborAndScriptAddr(
        "payment.payment.spend", 
        []);
    console.log("scriptAddr: ", scriptAddr);
    console.log("scriptCbor: ", scriptCbor);
    const txBuilder = getTxBuilder();
    const assets: Asset[] = [{
        unit: "lovelace",
        quantity: price.toString()
    }];
    const datum = mConStr0([
        pubKeyBuyer,
        pubKeyShopper,
        stringToHex(product_id),
        stringToHex(product_name),
        timeExpire,
        is_paid,
        price
    ])
    await txBuilder
    .spendingPlutusScriptV3()
    .txOut(
        scriptAddr,
        assets
    )
    .txOutInlineDatumValue(datum)
    .changeAddress(walletAddress)
    .requiredSignerHash(pubKeyBuyer)
    .selectUtxosFrom(utxos)
    .setNetwork("preprod")
    
    const tx = await txBuilder.complete();
    const txHash = await submitTx(tx);
    console.log("Transaction Hash: ", txHash);

}

