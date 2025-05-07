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
    product_id: string,
    farmer: string,
    product_name: string,
    product_type: string,
    quantity: number,
    unit: string,
    location: string,
    harvest_date: number,
    certifications: string[],
    registration_date: number,
    price: number,
    current_status: string,
    current_location: string,
    next_handler: string,
    history: string,
    receiver: string,
){
    const {utxos, walletAddress, collateral} = await getWalletInfoForTx(walletA);
    const pubkeyHandler = getPubkeyHash(next_handler);
    const 

    const compileCode = readValidator("payment.payment.spend");
    const scriptCbor = applyParamsToScript(
        compileCode,
        []
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
        quantity: price.toString()
    }];
    const datum = mConStr0([
        pubKeyBuyer,
        pubKeyShopper,
        stringToHex(product_id),
        stringToHex(product_name),
        timeExpire,
        is_paid,
        price
    ])
    await txBuilder
    .spendingPlutusScriptV3()
    .txOut(
        scriptAddr,
        assets
    )
    .txOutInlineDatumValue(datum)
    .changeAddress(walletAddress)
    .requiredSignerHash(pubKeyBuyer)
    .selectUtxosFrom(utxos)
    .setNetwork("preprod")
    
    const tx = await txBuilder.complete();
    const txHash = await submitTx(tx, walletA);
    console.log("Transaction Hash: ", txHash);
}

async function main(){
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