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
    walletCurrent: any,
    txHash: string,
    price: number,
    idProduct: number,
    newData: string,
    nextHandler: string,
    farmer: string, 
    creatorWallet: any, // ví mà farmer chuyển tiền vận chuyển
    amount: number,
) {
    try {
        const { utxos, walletAddress, collateral } = await getWalletInfoForTx(
            creatorWallet,
        );
        const pubkeyWalletSMC = deserializeAddress(walletAddress).pubKeyHash;
        const pubkeyCurrent = deserializeAddress(walletCurrent).pubKeyHash;
        const utxo = await getUtxoByTxHash(txHash);
        const pubkeyCheckFromDatum = getFieldsDatum(2, utxo, "bytes");
        if(pubkeyCheckFromDatum !== pubkeyWalletSMC) {
            console.log("Fail", pubkeyCheckFromDatum + "\n" +  pubkeyWalletSMC);
        }
       
        const compileCode = readValidator("agrtracechain.agritracechain.spend");
        const scriptCbor = applyParamsToScript(
            compileCode,
            [stringToHex("abc"), 123, pubkeyReceiver, 100],
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
        const datum = hexToString(getFieldsDatum(2, utxo, "bytes"));
        console.log("Datum : ", datum);
        const newdata = datum + newData;
        console.log("new data : ", newdata);
        const txBuilder = getTxBuilder();
        const newDatum = mConStr0([
            pubkeyHandlerNext,
            pubkeyReceiver,
            stringToHex(newdata),
        ]);
        const assets: Asset[] = [{
            unit: "lovelace",
            quantity: "1427480",
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
        const txId = await submitTx(tx, walletB);

        console.log("Transaction Hash: ", txId);
    } catch (error) {
        throw new Error("Error in contribute function: " + error);
    }
}
async function main() {
    const wallet = walletA;
    const txHash =
        "a1319445a0e88825c6ab1e4036091757e1a65a01ab446635a3dbeae8302b5e10";
    const newData = "newData new new";
    const nextHandler =
        "addr_test1qp32dhvj6nmhn8qjce8vsv3s0x70rrth7udxy32a7lm5yl7vchlp2ahqwyyfpv4l7fszccrngx2vcmmu5x3d3t3cy2uqpd7ewx";
    const receiver =
        "addr_test1qrsv6r79uzuq0uwvj7jez8qy7pl308egptkvuf99p84n0rt7m2m2y4lpett6mh7pgv5lktq0ktcmgl87tufpstn5nxmqtyv065";
    await updateAndPushHistoryProduct(
        wallet,
        txHash,
        newData,
        nextHandler,
        receiver,
    );
}
main();
function requiredSignerHash(pubkeyContributor: string) {
    throw new Error("Function not implemented.");
}
//addr_test1wr6sdyafvwvg0qcp9pds8pyd7pxcnmwkptfyuzv2lychvag76nd9s
