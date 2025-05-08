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
    getScripCborAndScriptAddr,
    readValidator,
} from "../general.ts";

async function createProduct(
    walletSMCCreate: any,
    walletFarmer: any,
    data: string,
    price: number,
    next_handler: string,
){
    // Lấy thông tin ví của người farmer
    const { utxos1, walletAddress, collateral } = await getWalletInfoForTx(walletFarmer);
    const pubKeyWalletCreator = getPubkeyHash(walletAddress);
    // lấy thông tin ví được tạo nên bởi 24 kí tự
    

}
async function main(){

}