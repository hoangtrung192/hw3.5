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
  const { utxos, walletAddress, collateral } = await getWalletInfoForTx(wallet);
      console.log("Collateral : " + collateral);
      console.log("utxos : " + utxos);
  const assets: Asset[] = [
    {
      unit: "lovelace",
      quantity: "30000000",
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

  const lockUntilTimeStamp = new Date().getTime() + 1*60*1000;


  const beneficiary =
  "addr_test1qqwkave5e46pelgysvg6mx0st5zhte7gn79srscs8wv2qp5qkfvca3f7kpx3v3rssm4j97f63v5whrj8yvsx6dac9xrqyqqef6";

  // const tx = await contract.depositFund(
  //     assets,
  //     lockUntilTimeStamp.getTime(),
  //     beneficiary,
  //   );

  //const { utxos, walletAddress, collateral } = await getWalletInfoForTx(wallet);
  const { pubKeyHash: ownerPubKeyHash } = deserializeAddress(walletAddress);
  const { pubKeyHash: beneficiaryPubKeyHash } = deserializeAddress(beneficiary);

  const x = 674;

  await txBuilder
    .txOut(scriptAddr, assets)
    .txOutInlineDatumValue(
      mConStr0([lockUntilTimeStamp, ownerPubKeyHash, beneficiaryPubKeyHash])
    )
 //   .metadataValue('674', {msg:['abc', 'abc']})
    .changeAddress(walletAddress)
    
    .selectUtxosFrom(utxos)
    .complete();

  const unsignedTx = txBuilder.txHex;
//  const tx = new Transaction({initiator: wallet});
  

  const signedTx = await wallet.signTx(unsignedTx);
  const txHash = await wallet.submitTx(signedTx);
  console.log("txhash: " + txHash);
  console.log("Khoa");
}
main();
