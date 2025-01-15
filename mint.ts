import {
    ForgeScript,
    MeshTxBuilder,
    resolveScriptHash,
    stringToHex,
} from "@meshsdk/core";
import { blockchainProvider, wallet } from "./test_provider";
async function main() {
    const changeAddress = await wallet.getChangeAddress();
    const forgingScript = ForgeScript.withOneSignature(changeAddress); //tao 1 script ki duy nhat cho nguoi ki
    const txBuilder = new MeshTxBuilder({
        fetcher: blockchainProvider,
        submitter: blockchainProvider,
        verbose: true, //true -> thong tin chi tiet ve giao dich
    });
    const utxos = await wallet.getUtxos();
    const demo = {
        name: "NFT demo",
        image: "ipfs://QmRzicpReutwCkM6aotuKjErFCUD213DpwPq6ByuzMJaua",
        mediaType: "image/jpg",
        description: "mint by mesh and long",
    };
    const policyID = resolveScriptHash(forgingScript); //chuyen doi 1 cai script thanh policyID dinh danh
    const tokenName = "NFT demo 22";
    const tokenNameHex = stringToHex(tokenName);
    const metadata = { [policyID]: { [tokenName]: { ...demo } } };
    const unsignedTx = await txBuilder
        .mint("1", policyID, tokenNameHex)
        .mintingScript(forgingScript)
        .metadataValue(721, metadata) //chuan theo cardano
        .changeAddress(changeAddress)
        .selectUtxosFrom(utxos)
        .complete();
    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);
    console.log("txhash : ", txHash);
}
main();
//npx tsx mint.ts
