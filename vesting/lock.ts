import {
  Asset,
  deserializeAddress,
  mConStr0,
  MeshTxBuilder,
  MeshValue,
  Transaction,
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
    //   unit: 'e9c331248ac81d8d0f2a10882e0b3b90eb54faf303113edca17d09ec4e46542064656d6f203232',
    //   quantity: '1',
    // }
    
    
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

  const x = 674;

  await txBuilder
    .txOut(scriptAddr, assets)
    .txOutInlineDatumValue(
      mConStr0([lockUntilTimeStamp, ownerPubKeyHash, beneficiaryPubKeyHash])
    )
    .metadataValue('674', {msg:['abc', 'abc']})
    .changeAddress(walletAddress)
    
    .selectUtxosFrom(utxos)
    .complete();

  const unsignedTx = txBuilder.txHex;
  const tx = new Transaction({initiator: wallet});
  

  const signedTx = await wallet.signTx(unsignedTx);
  const txHash = await wallet.submitTx(signedTx);
  console.log("txhash: " + txHash);
  console.log("Khoa");
}
main();
