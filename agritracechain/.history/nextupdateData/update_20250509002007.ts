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
        const pubkeyCheckFromDatum = hexToString(getFieldsDatum(2, utxo, "bytes"));
        if(pubkeyCheckFromDatum !== pubkeyWalletSMC) {
            console.log("Fail", pubkeyCheckFromDatum + "\n" +  pubkeyWalletSMC);
        }
       
        const compileCode = readValidator("agrtracechain.agritracechain.spend");
        const scriptCbor = applyParamsToScript(
            compileCode,
            [idProduct, price],
        );
        const scriptAddr = serializePlutusScript(
            { code: scriptCbor, version: "V3" },
            undefined,
            0,
        ).address;
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
            farmer,
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
            .requiredSignerHash(pubkeyCurrent)
            .txOut(scriptAddr, assets)
            .txOutInlineDatumValue(newDatum)
            .changeAddress(walletAddress)
            .selectUtxosFrom(utxos)
            .setNetwork("preprod")
            .complete();

        const tx = await txBuilder.complete();
        const txId = await submitTx(tx, creatorWallet);

        console.log("Transaction Hash: ", txId);
    } catch (error) {
        throw new Error("Error in contribute function: " + error);
    }
}
async function main() {
    const walletCreator = walletB;
    const walletFarmer = "addr_test1qqwkave5e46pelgysvg6mx0st5zhte7gn79srscs8wv2qp5qkfvca3f7kpx3v3rssm4j97f63v5whrj8yvsx6dac9xrqyqqef6";
    const walletCurrent = "addr_test1qqwkave5e46pelgysvg6mx0st5zhte7gn79srscs8wv2qp5qkfvca3f7kpx3v3rssm4j97f63v5whrj8yvsx6dac9xrqyqqef6";
    const walletNextHandler = "addr_test1qrsv6r79uzuq0uwvj7jez8qy7pl308egptkvuf99p84n0rt7m2m2y4lpett6mh7pgv5lktq0ktcmgl87tufpstn5nxmqtyv065";
    const txHash = "a1319445a0e88825c6ab1e4036091757e1a65a01ab446635a3dbeae8302b5e10";
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
