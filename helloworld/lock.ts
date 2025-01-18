import {
  BlockfrostProvider,
  MeshTxBuilder,
  MeshWallet,
  serializePlutusScript,
  UTxO,
  Asset,
  deserializeAddress
  ,mConStr0
} from "@meshsdk/core";
import { wallet, blockchainProvider } from "../test_provider";
import blueprint from "./plutus.json";
import { applyParamsToScript } from "@meshsdk/core-csl";
const meshTxBuilder = new MeshTxBuilder({
  fetcher: blockchainProvider,
  submitter: blockchainProvider,
});
//ham bien dich plutus hop dong thong minh
async function getScript() {
  const scriptCbor = applyParamsToScript(
    blueprint.validators[0].compiledCode,
    []
  );
  const scriptAddr = serializePlutusScript({ code: scriptCbor, version: "V3" },).address;
  return  {scriptAddr, scriptCbor};
}
//ham lay nhung utxos tu vi
async function getUtxoByTxHash(txHash: string): Promise<UTxO> {
  const utxos = await blockchainProvider.fetchUTxOs(txHash);
  if (utxos.length === 0) {
    throw new Error("UTxO not found");
  }
  return utxos[0];
}

async function main(){
  //khoi tao tai san
    const assets: Asset[] = [
        {
          unit: "lovelace",
          quantity: "2000000",
        },
      ];
     
      // get utxo and wallet address
      const utxos = await wallet.getUtxos();
      const walletAddress = (await wallet.getUsedAddresses())[0];
    const scriptAddr = "addr_test1qp32dhvj6nmhn8qjce8vsv3s0x70rrth7udxy32a7lm5yl7vchlp2ahqwyyfpv4l7fszccrngx2vcmmu5x3d3t3cy2uqpd7ewx";
     
      // hash of the public key of the wallet, to be used in the datum
      const signerHash = deserializeAddress(walletAddress).pubKeyHash;
     
      // build transaction with MeshTxBuilder
   
      await meshTxBuilder
        .txOut(scriptAddr, assets) // send assets to the script address
        .txOutDatumHashValue(mConStr0([signerHash])) // provide the datum where `"constructor": 0`
        .changeAddress(walletAddress) // send change back to the wallet address
        .selectUtxosFrom(utxos)
        .complete();
      const unsignedTx = meshTxBuilder.txHex;
     
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);
      console.log(`1 tADA locked into the contract at Tx ID: ${txHash}`);
    }
     

main();