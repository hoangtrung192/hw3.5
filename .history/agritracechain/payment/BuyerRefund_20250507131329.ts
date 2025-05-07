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
export async function buyerRefund(
    walletA: any,
  //  buyer: string,
    shopper: string,
    product_id: string,
    product_name: string,
    timeExpire: number,
    is_paid: number,
    price: number
){