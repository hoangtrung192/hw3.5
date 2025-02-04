import { Asset, deserializeAddress, mConStr0, MeshTxBuilder, MeshValue } from "@meshsdk/core";
import { MeshVestingContract } from "@meshsdk/contract";
import { getScript, getTxBuilder, wallet, getWalletInfoForTx, blockchainProvider } from "./common";
async function main(){
const assets: Asset[] = [
    {
      unit: "lovelace",
      quantity: "20000000",
    },
    // {
    //   unit: "e517dddf607a2dca4a28223885af5af423618f3c512930043563b885",

    //   quantity: "1",
    // },
  ];
  const value = MeshValue.fromAssets(assets);
  console.log(value);
  const meshTxBuilder = new MeshTxBuilder({
    fetcher: blockchainProvider,
    submitter: blockchainProvider,
  });
  
  const contract = new MeshVestingContract({
    mesh: meshTxBuilder,
    fetcher: blockchainProvider,
    wallet: wallet,
    networkId: 0,
  });
const lockUntilTimeStamp = new Date();
lockUntilTimeStamp.setMinutes(lockUntilTimeStamp.getMinutes() + 100);
const beneficiary = "addr_test1qp32dhvj6nmhn8qjce8vsv3s0x70rrth7udxy32a7lm5yl7vchlp2ahqwyyfpv4l7fszccrngx2vcmmu5x3d3t3cy2uqpd7ewx";

const tx = await contract.depositFund(
    assets,
    lockUntilTimeStamp.getTime(),
    beneficiary,
  );
  const signedTx = await wallet.signTx(tx);
  const txHash = await wallet.submitTx(signedTx);
  console.log(txHash);
}
main();