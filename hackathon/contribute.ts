import {
  applyParamsToScript,
  Asset,
  deserializeAddress,
  mConStr0,
  MeshTxBuilder,
  MeshValue,
  serializePlutusScript,
  Transaction,
} from "@meshsdk/core";

import {
  blockchainProvider,
  getWalletInfoForTx,
  readValidator,
  wallet,
} from "./adapter";

async function contribute(receiver: string, assets: any, amount: number) {
  try {
    const { utxos, walletAddress, collateral } = await getWalletInfoForTx(
      wallet,
    );

    const pubkeyContributor = deserializeAddress(walletAddress).pubKeyHash;
    const pubkeyReceiver = deserializeAddress(receiver).pubKeyHash;

    const contributeCompileCode = readValidator("contribute.contribute.spend");
    const constributeScriptCbor = applyParamsToScript(
      contributeCompileCode,
      [],
    );

    const scriptAddr = serializePlutusScript(
      { code: constributeScriptCbor, version: "V3" },
      undefined,
      0,
    ).address;
    console.log("Script Address : ", scriptAddr);

    const txBuilder = new MeshTxBuilder({
        fetcher: blockchainProvider,
        submitter: blockchainProvider,
      });
    const datum = mConStr0([pubkeyContributor, pubkeyReceiver, amount]);
    
    await txBuilder
    .spendingPlutusScriptV3()
    .txOut(scriptAddr, assets)
    .txOutInlineDatumValue(datum)
    .changeAddress(walletAddress)
    .selectUtxosFrom(utxos)
    .complete();

    const tx = txBuilder.txHex;
    const signedTx = await wallet.signTx(tx, true);
    const TxHash = await wallet.submitTx(signedTx);
    
    return TxHash;
  } catch {
  }
}
async function main() {
  const receiver =
    "addr_test1qqwkave5e46pelgysvg6mx0st5zhte7gn79srscs8wv2qp5qkfvca3f7kpx3v3rssm4j97f63v5whrj8yvsx6dac9xrqyqqef6";
    const assets: Asset[] = [
      {
        unit: "lovelace",
        quantity: "30000000",
      }
    ];
  const amount = 30;
  const txHash = await contribute(receiver, assets, amount);
  console.log("Transaction Hash: ", txHash);
}
main();
