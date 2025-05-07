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
    is_paid: number
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
        quantity: PromiseRejectionEvent.toString()
    }];
    const isPaid = 1;
    const datum = mConStr0([
        pubKeyBuyer,
        pubKeyShopper,
        stringToHex(product_id),
        stringToHex(product_name),
        timeExpire,
        isPaid,
        price
    ])
    await txBuilder
    .spendingPlutusScriptV3()
    .txOut(
        scriptAddr,
        assets
    )
    .txOutInlineDatumValue


}

