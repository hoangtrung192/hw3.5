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
    data: string, // dữ liệu farmer nhập -> dữ liệu IPFS
    price: number,
    next_handler: string,
    idProduct: number,
){
    // Lấy thông tin ví của người farmer
    const { utxos: utxoFarmer, walletAddress: addrFarmer, collateral: collateralFarmer } = await getWalletInfoForTx(walletFarmer);
    const pubKeyWalletCreator = getPubkeyHash(addrFarmer);
    // lấy thông tin ví được tạo nên bởi 24 kí tự
    const { utxos: utxoSMCCreate, walletAddress: addrSMCCreate, collateral: collateralSMCCreate } = await getWalletInfoForTx(walletSMCCreate);
    const pubKeyWalletSMCCreate = getPubkeyHash(addrSMCCreate);

    // Lấy thông tin SMC -> dựa vào dữ liệu nhập 
    const {scriptCbor, scriptAddr} =getScripCborAndScriptAddr(
        "agrtracechain.agritracechain.spend",
        [idProduct, price]
    );
    console.log("scriptAddr: ", scriptAddr);
    console.log("scriptCbor: ", scriptCbor); //log để kiểm tra khởi tạo chuẩn chưa

    const txBuilder = getTxBuilder();
    const assets: Asset[] = [{
        unit: "lovelace",
        quantity: "1327480"
    }]; //số lượng lovelace tói thiểu để tạo ra 1 giao dịch hợp đồng

    // Logic sẽ là farmer kí giao dịch chuyển tiền cho ví WalletSMC để có utxo -> sau đó 

}
async function main(){

}