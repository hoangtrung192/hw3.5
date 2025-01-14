import {BrowserWallet,Transaction, Wallet, BlockfrostProvider, MeshTxBuilder, WalletStaticMethods,  }
 from "@meshsdk/core";
import {wallet, blockchainProvider} from "./test_provider"
//xay dung va gui giao dich len blockchain
async function main(){
const txBuilder = new MeshTxBuilder({
    fetcher: blockchainProvider,
    submitter: blockchainProvider,
    verbose: true, //true -> thong tin chi tiet ve giao dich
});
const changeAddress = await wallet.getChangeAddress();
const utxos = await wallet.getUtxos();
const unsignedTx = await txBuilder
  .txOut('addr_test1qp32dhvj6nmhn8qjce8vsv3s0x70rrth7udxy32a7lm5yl7vchlp2ahqwyyfpv4l7fszccrngx2vcmmu5x3d3t3cy2uqpd7ewx', [{ unit: "lovelace", quantity: '10000000' }])
  .changeAddress(changeAddress) //dia chi
  .selectUtxosFrom(utxos) //lua chon utxo phu hop
  .complete();

const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
console.log('TxHash : ', txHash);
}
main();
  //npx tsx conduct_transaction.ts