import {wallet, blockchainProvider} from "./test_provider"
import { txBuilder } from "./conduct_transaction";
import { MeshTxBuilder, MeshWallet, BlockfrostProvider, ForgeScript, resolveScriptHash , stringToHex} from "@meshsdk/core"
async function main(){
//lay utxo
const utxos = await wallet.getUtxos();
//lay dia chi
const changeAddress = await wallet.getChangeAddress();
//tao script duy nhat cho nguoi ki
const forgingScript = ForgeScript.withOneSignature(changeAddress);

const policyId = resolveScriptHash(forgingScript);
const tokenNameHex = stringToHex("NFT demo");
const unsignedTx = await txBuilder
    .mint("-1", policyId, tokenNameHex)
    .mintingScript(forgingScript)
    .changeAddress(changeAddress)
    .selectUtxosFrom(utxos)
    .complete();
const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
console.log("Burn xong co txHash la : ", txHash);
}
main();
//npx tsx burn.ts