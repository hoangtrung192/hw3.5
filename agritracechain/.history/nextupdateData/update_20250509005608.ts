import {
    applyParamsToScript,
    Asset,
    BrowserWallet,
    deserializeAddress,
    deserializeDatum,
    mConStr0,
    MeshTxBuilder,
    serializePlutusScript,
    stringToHex,
} from "@meshsdk/core";

import {
    blockchainProvider,
    getFieldsDatum,
    getPubkeyHash,
    getScripCborAndScriptAddr,
    getTxBuilder,
    getUtxoByTxHash,
    getWalletInfoForTx,
    readValidator,
    submitTx,
    walletA,
    walletB,
} from "../general.ts";
function hexToString(hex: string): string {
    let str = "";
    for (let i = 0; i < hex.length; i += 2) {
        const charCode = parseInt(hex.substring(i, i + 2), 16);
        str += String.fromCharCode(charCode);
    }
    return str;
}
async function updateAndPushHistoryProduct(
    walletCurrent: string,
    txHash: string,
    price: number,
    idProduct: number,
    newData: string,
    nextHandler: string,
    farmer: string, 
    creatorWallet: any, // ví mà farmer chuyển tiền vận chuyển
  //  amount: number,
) {
    try {
        const { utxos, walletAddress, collateral } = await getWalletInfoForTx(
            creatorWallet,
        );
        const pubkeyWalletSMC = deserializeAddress(walletAddress).pubKeyHash;
        const pubkeyCurrent = deserializeAddress(walletCurrent).pubKeyHash;
        const pubkeyHandlerNext = deserializeAddress(nextHandler).pubKeyHash;
        const utxo = await getUtxoByTxHash(txHash);
        const pubkeyCheckFromDatum = getFieldsDatum(2, utxo, "bytes");
        
       const {scriptAddr, scriptCbor} = getScripCborAndScriptAddr(
            "agrtracechain.agritracechain.spend",
            [idProduct, price]);
        console.log("scriptAddr: ", scriptAddr);
        
        if (!utxo) {
            throw new Error("No UTXOs found for the given transaction hash.");
        }
        const datum = hexToString(getFieldsDatum(4, utxo, "bytes"));
        console.log("Datum : ", datum);
        const newdata = datum + newData;
        console.log("new data : ", newdata);
        const txBuilder = getTxBuilder();
        const newDatum = mConStr0([
            stringToHex(farmer),
            pubkeyCurrent,
            pubkeyHandlerNext,
            pubkeyWalletSMC,
            stringToHex(newdata),
            price,
        ]);
        const assets: Asset[] = [{
            unit: "lovelace",
            quantity: "2000000",
        }];
        await txBuilder
            .spendingPlutusScriptV3()
            .txIn(
                utxo.input.txHash,
                utxo.input.outputIndex,
                utxo.output.amount,
                scriptAddr,
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
            .requiredSignerHash(pubkeyWalletSMC)
            .txOut(scriptAddr, assets)
            .txOutInlineDatumValue(newDatum)
            .changeAddress(walletAddress)
            .selectUtxosFrom(utxos)
            .setNetwork("preprod")
            .addUtxosFromSelection();
            //.complete();

        const tx = await txBuilder.complete();
        const txId = await submitTx(tx, creatorWallet);

        console.log("Transaction Hash: ", txId);
    } catch (error) {
        throw new Error("Error in contribute function: " + error);
    }
}
async function main() {
    const walletCreator = walletA ;
    const walletFarmer = "addr_test1qqwkave5e46pelgysvg6mx0st5zhte7gn79srscs8wv2qp5qkfvca3f7kpx3v3rssm4j97f63v5whrj8yvsx6dac9xrqyqqef6";
    const walletCurrent = "addr_test1qqwkave5e46pelgysvg6mx0st5zhte7gn79srscs8wv2qp5qkfvca3f7kpx3v3rssm4j97f63v5whrj8yvsx6dac9xrqyqqef6";
    const walletNextHandler = "addr_test1qrsv6r79uzuq0uwvj7jez8qy7pl308egptkvuf99p84n0rt7m2m2y4lpett6mh7pgv5lktq0ktcmgl87tufpstn5nxmqtyv065";
    const txHash = "d0f51aeeac6abc7a9e72e9aa5d00f5116917fff2fe6fbd5cc36b995f93d2ea61";
    const newData = "newData nhe";
    const nextHandler = "addr_test1qp32dhvj6nmhn8qjce8vsv3s0x70rrth7udxy32a7lm5yl7vchlp2ahqwyyfpv4l7fszccrngx2vcmmu5x3d3t3cy2uqpd7ewx";
    const price= 1000;
    const idProduct = 1;
    await updateAndPushHistoryProduct(
        walletCurrent,
        txHash,
        price,
        idProduct,
        newData,
        nextHandler,
        walletFarmer,
        walletCreator,
    );

}
main();

//addr_test1wrefz4t43ahle92y9nvls3306uqj7qg2rglyh98w0wk3xcqa335ww
//scriptCbor : 59014059013d0101003323232323232232232253330063232323232533300b3370e900118061baa0011323232533300e3370e900018079baa0051323253330133015002153330103370e900018089baa0031323253330123371e91010d557064617465486973746f727900375c602c60286ea802454ccc0480044cdc39bad3016301730173017301730173014375400401c294058cc88c8cc00400400c894ccc060004528099299980b19b8f375c603400400829444cc00c00c004c068004dd6180a980b180b180b180b180b180b180b180b18099baa00a375c602a602c602c602c60266ea8004c050c048dd50018b0b1bae30130013010375400a2c602260240046020002601a6ea800458c038c03c008c034004c034008c02c004c020dd50008a4c26cac6eb4004dd6800ab9a5573aaae7955cfaba15744981069f011903e8ff0001
