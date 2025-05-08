import {
    applyParamsToScript,
    Asset,
    BrowserWallet,
    deserializeAddress,
    mConStr0,
    MeshTxBuilder,
    serializePlutusScript,
    stringToHex,
    Transaction
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
    currentHandler: string,
){
    try{
    // Lấy thông tin ví của người farmer
    const { utxos: utxoFarmer, walletAddress: addrFarmer, collateral: collateralFarmer } = await getWalletInfoForTx(walletFarmer);
    const pubKeyWalletCreator = getPubkeyHash(addrFarmer);
    //console.log("pubKeyWalletCreator: ", pubKeyWalletCreator); //log để kiểm tra khởi tạo chuẩn chưa
    // lấy thông tin ví được tạo nên bởi 24 kí tự
    const { utxos: utxoSMCCreate, walletAddress: addrSMCCreate, collateral: collateralSMCCreate } = await getWalletInfoForTx(walletSMCCreate);
    const pubKeyWalletSMCCreate = getPubkeyHash(addrSMCCreate);
    console.log("pubKeyWalletSMCCreate: ", pubKeyWalletSMCCreate); //log để kiểm tra khởi tạo chuẩn chưa
//lấy pubkey của người xử lí ở thời điểm hiện tại
    //const pubKeyCurrentHandler = getPubkeyHash(currentHandler);
    //lấy pubkey của người xử li tiếp theo
    const pubKeyNextHandler = getPubkeyHash(next_handler);
    console.log("pubKeyNextHandler: ", pubKeyNextHandler); //log để kiểm tra khởi tạo chuẩn chưa
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

    // Logic sẽ là farmer kí giao dịch chuyển tiền cho ví WalletSMC để có utxo -> sau đó sẽ dùng
    //ví WalletSMC để tạo giao dịch truyền dữ liệu vào Datum
    //Dữ liệu sẽ được truyền vào datum
    const datum = mConStr0([
        stringToHex(addrFarmer),
        pubKeyCurrentHandler,
        pubKeyNextHandler,
        pubKeyWalletCreator,
        stringToHex(data),
        price,
    ]);
    try{
    //gửi cho ví mới 1 số tiền để vận chuyển
    const tx = new Transaction({ initiator: walletFarmer })
    .sendLovelace(addrSMCCreate, "10000000");
    const unsignedTx = await tx.build();
    const signedTx = await walletFarmer.signTx(unsignedTx);
    const txHash = await walletFarmer.submitTx(signedTx);
    console.log("Transaction Hash: ", txHash);
    }
    catch (error) {
        console.error("Error sending lovelace: ", error);
    }

    // sau khi đã có utxo từ ví WalletSMC thì sẽ tạo giao dịch truyền dữ liệu vào datum
    try{
    await txBuilder
    .spendingPlutusScriptV3()
    .txOut(
        scriptAddr,
        assets
    )
    .txOutInlineDatumValue(datum)
    .changeAddress(addrSMCCreate)
    .requiredSignerHash(pubKeyWalletSMCCreate)
    .selectUtxosFrom(utxoSMCCreate)
    .setNetwork("preprod");

    const completeTx = await txBuilder.complete();
    const signedTx2 = await walletSMCCreate.signTx(completeTx);
    const txHash2 = await walletSMCCreate.submitTx(signedTx2);
    console.log("Transaction Hash: ", txHash2);
    }
    catch (error) {
        console.error("Error creating product: ", error);
    }
}catch (error) {
    console.error("Error in createProduct: ", error);
}
}
async function main(){
    const walletSMCCreate = walletA;
    const walletFarmer = walletB;
    const data = "abc"; // dữ liệu farmer nhập -> dữ liệu IPFS
    const price = 1000; // giá sản phẩm
    const next_handler = "addr_test1qz5x5e46pelgysvg6mx0st5zhte7gn79srscs8wv2qp5qkfvca3f7kpx3v3rssm4j97f63v5whrj8yvsx6dac9xrqyqqef6"; // địa chỉ người xử lí tiếp theo
    const currentHandler = "addr_test1qz5x5e46pelgysvg6mx0st5zhte7gn79srscs8wv2qp5qkfvca3f7kpx3v3rssm4j97f63v5whrj8yvsx6dac9xrqyqqef6";
    const idProduct = 1; // id sản phẩm
    await createProduct(
        walletSMCCreate,
        walletFarmer,
        data,
        price,
        next_handler,
        idProduct,
        currentHandler
    );
}
main();