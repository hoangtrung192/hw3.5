import {
  Asset,
  deserializeAddress,
  mConStr0,
  MeshTxBuilder,
  MeshValue,
} from "@meshsdk/core";
import { MeshVestingContract } from "@meshsdk/contract";
import {
  getScript,
  getTxBuilder,
  wallet,
  blockchainProvider,
  getWalletInfoForTx,
} from "./common";
async function main() {
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
  const { scriptAddr, scriptCbor } = getScript();
  const value = MeshValue.fromAssets(assets);
  console.log(value);
  const meshTxBuilder = new MeshTxBuilder({
    fetcher: blockchainProvider,
    submitter: blockchainProvider,
  });
  const txBuilder = new MeshTxBuilder({
    fetcher: blockchainProvider,
    submitter: blockchainProvider,
  });
  console.log(wallet.getChangeAddress());
  // const contract = new MeshVestingContract({
  //   mesh: meshTxBuilder,
  //   fetcher: blockchainProvider,
  //   wallet: wallet,
  //   networkId: 0,
  // });

  const lockUntilTimeStamp = new Date().getMinutes() + 1;


  const beneficiary =
  "addr_test1qp32dhvj6nmhn8qjce8vsv3s0x70rrth7udxy32a7lm5yl7vchlp2ahqwyyfpv4l7fszccrngx2vcmmu5x3d3t3cy2uqpd7ewx";

  // const tx = await contract.depositFund(
  //     assets,
  //     lockUntilTimeStamp.getTime(),
  //     beneficiary,
  //   );

  const { utxos, walletAddress, collateral } = await getWalletInfoForTx(wallet);
  const { pubKeyHash: ownerPubKeyHash } = deserializeAddress(walletAddress);
  const { pubKeyHash: beneficiaryPubKeyHash } = deserializeAddress(beneficiary);

  await txBuilder
    .txOut(scriptAddr, assets)
    .txOutInlineDatumValue(
      mConStr0([lockUntilTimeStamp, ownerPubKeyHash, beneficiaryPubKeyHash])
    )
    .changeAddress(walletAddress)
    .selectUtxosFrom(utxos)
    .complete();

  const unsignedTx = txBuilder.txHex;
  const signedTx = await wallet.signTx(unsignedTx);
  const txHash = await wallet.submitTx(signedTx);
  console.log("txhash: " + txHash);
  console.log("Khoa");
}
main();
