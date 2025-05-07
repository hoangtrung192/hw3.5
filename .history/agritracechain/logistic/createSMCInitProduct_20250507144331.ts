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
export async function buyerBuyProduct(
    walletA: any,
    data: string,
    price: number,
    next_handler: string,
    receiver: string,
) {
    const { utxos, walletAddress, collateral } = await getWalletInfoForTx(walletA);
    const currentPubkey = getPubkeyHash(walletAddress);
    const pubkeyHandler = getPubkeyHash(next_handler);
    const pubkeyReceiver = getPubkeyHash(receiver);
    const compileCode = readValidator("agrtracechain.agritracechain.spend");
    const scriptCbor = applyParamsToScript(
        compileCode,
        [stringToHex("abc"), 123, pubkeyReceiver, 100]
    );
    const scriptAddr = serializePlutusScript(
        { code: scriptCbor, version: "V3" },
        undefined,
        0,
    ).address;
    console.log("scriptAddr: ", scriptAddr);
    console.log("scriptCbor: ", scriptCbor);
    const txBuilder = getTxBuilder();
    const assets: Asset[] = [{
        unit: "lovelace",
        quantity: "1200000"
    }];
    const datum = mConStr0([
        pubkeyHandler,
        pubkeyReceiver,
        stringToHex(data)
    ])
    await txBuilder
        .spendingPlutusScriptV3()
        .txOut(
            scriptAddr,
            assets
        )
        .txOutInlineDatumValue(datum)
        .changeAddress(walletAddress)
        .requiredSignerHash(pubke)
        .selectUtxosFrom(utxos)
        .setNetwork("preprod")

    const tx = await txBuilder.complete();
    const txHash = await submitTx(tx, walletA);
    console.log("Transaction Hash: ", txHash);
}

async function main() {
    const wallet = walletA;
    const shopper = "addr_test1qqwkave5e46pelgysvg6mx0st5zhte7gn79srscs8wv2qp5qkfvca3f7kpx3v3rssm4j97f63v5whrj8yvsx6dac9xrqyqqef6";
    const product_id = "product_id";
    const product_name = "product_name";
    const timeExpire = 1000000;
    const is_paid = 0;
    const price = 20000000;
    await buyerBuyProduct(
        wallet,
        shopper,
        product_id,
        product_name,
        timeExpire,
        is_paid,
        price
    );
}
main();