  import {
    Asset,
    deserializeAddress,
    deserializeDatum,
    mConStr0,
    MeshTxBuilder,
    MeshValue,
    pubKeyAddress,
    pubKeyHash,
    SLOT_CONFIG_NETWORK,
    unixTimeToEnclosingSlot,
    UTxO,
  } from "@meshsdk/core";
  import { MeshVestingContract, VestingDatum } from "@meshsdk/contract";
  import {
    blockchainProvider,
    getScript,
    getTxBuilder,
    getWalletInfoForTx,
    wallet,
  } from "./common";

  async function main() {
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
    const utxo = await contract.getUtxoByTxHash(
      "38e095bd15c7678b6cc4ce8622e81ef99e99b884cc2d81164936cb1fe991b090",
    );

    const tx = await contract.withdrawFund(utxo);
    const signedTx = await wallet.signTx(tx, true);
    const txHash = await wallet.submitTx(signedTx);
    console.log("Txhash : " + txHash);
  }
  main();
  //txhash:55c71f375a2167a9c7472e148e5273440466314aeac30a8e4cdc312ed23f9786
