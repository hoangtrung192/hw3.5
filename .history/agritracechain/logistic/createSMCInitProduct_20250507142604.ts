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
    product_id: string,
    farmer: string,
    product_name: string,
    product_type: string,
    quantity: Int,
    unit: ByteArray,
    location: ByteArray,
    harvest_date: Int,
    certifications: List<ByteArray>,
    registration_date: Int,
    price: Int,
    current_status: ByteArray,
    current_location: ByteArray,
    current_handler: VerificationKeyHash,
    history: List<List<ByteArray>>,
    receiver: VerificationKeyHash,
){
    const {utxos, walletAddress, collateral} = await getWalletInfoForTx(walletA);
    const pubKeyBuyer = getPubkeyHash(walletAddress);
    const pubKeyShopper = getPubkeyHash(shopper);
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