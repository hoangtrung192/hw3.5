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
        "payment.payment.spend", pubKeyShopper, product_id, product_name, timeExpire, is_paid);


}

