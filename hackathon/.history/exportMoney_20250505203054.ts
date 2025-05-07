import {
  applyParamsToScript,
  Asset,
  deserializeAddress,
  deserializeDatum,
  mConStr0,
  mConStr1,
  MeshTxBuilder,
  MeshValue,
  pubKeyAddress,
  pubKeyHash,
  scriptAddress,
  serializePlutusScript,
  signData,
  SLOT_CONFIG_NETWORK,
  slotToBeginUnixTime,
  stringToHex,
  Transaction,
  unixTimeToEnclosingSlot,
  UTxO,
} from "@meshsdk/core";
import { MeshVestingContract, VestingDatum } from "@meshsdk/contract";
import {
  blockchainProvider,
  getTxBuilder,
  getUtxoByTxHash,
  getWalletInfoForTx,
  readValidator,
  wallet,
} from "./adapter";
async function exportMoney(
  txHash: string[],
  amount: number,
  scriptAddr: string,
  contributeScriptCbor: string,
  addrReceiver: string,
  admin: string,
) {
  const { utxos, walletAddress, collateral } = await getWalletInfoForTx(wallet);
  const pubkeyAdmin = deserializeAddress(walletAddress).pubKeyHash;
  const pubkeyContributor = deserializeAddress(walletAddress).pubKeyHash;
  const datum = mConStr0([amount, pubkeyContributor, pubkeyAdmin]);
  const txBuilder = getTxBuilder();
  for (const tx of txHash) {
    const scriptUtxos = await blockchainProvider.fetchUTxOs(tx);
    let utxo;
    for (let i = 0; i <= 1; i++) {
      if (scriptUtxos[i].output.plutusData !== undefined) {
        utxo = scriptUtxos[i];
        break;
      }
    }
    console.log("UTxO: ", utxo);
    console.log("building tx..");
    await txBuilder
      .spendingPlutusScriptV3()
      .txIn(
        utxo.input.txHash,
        utxo.input.outputIndex,
        utxo.output.amount,
        scriptAddr,
      )
      .txInInlineDatumPresent()
      .txInRedeemerValue(mConStr0([stringToHex("ExportMoney")]))
      .txInCollateral(
        collateral.input.txHash,
        collateral.input.outputIndex,
        collateral.output.amount,
        collateral.output.address,
      )
      .txOut(
        walletAddress,
        [],
      );
  }
  await txBuilder
    .spendingPlutusScriptV3()   
    .txOut(
      addrReceiver,
      [{
        unit: "lovelace",
        quantity: amount.toString(),
      }],
    )
    .txOut(
      scriptAddr,
      [{
        unit: "lovelace",
        quantity: "12000000",
      }],
    )
    .txOutInlineDatumValue(datum)
    .txInScript(contributeScriptCbor)
    .changeAddress(walletAddress)
    .requiredSignerHash(pubkeyContributor)
    .selectUtxosFrom(utxos)
    .setNetwork("preprod")
    .addUtxosFromSelection();

    const tx= new Transaction({
      initiator: wallet, fetcher: blockchainProvider, verbose: true }

    })

  const txHexBuilder = await txBuilder.complete();
  const signedTx = await wallet.signTx(txHexBuilder, true);
  const txId = await wallet.submitTx(signedTx);
  console.log("Transaction ID: ", txId);
}
async function main() {
  const txHash1 =
    "432bdf07827f5c7331d2378559cca935bdcca262a1072986d55b3b9527139d5f";
  const txHash2 =
    "663f412279f67b284ddd8ebc15c5c6df6cba36618aa1eebb45d4b1360e9bdbad";
  const amount = 30000000;
  const scriptAddr =
    "addr_test1wqmj3ggnknd9lg2krkffr2p3ceehr72mc3us42629g40k5sduuf6y";
  const constributeScriptCbor =
    "5901c55901c20101003333333332323232323223223223223223223223223225333012323232323253330173370e9001180c1baa0011323232533301a3370e9000180d9baa00513232533301f30210021533301c3370e9000180e9baa0031323232323253330213371e9110b4578706f72744d6f6e657900375c604a60466ea80304c94ccc0894ccc08800840045280a5110033371e6eb8c094c098c098c08cdd500280f8b1980100180f198008011bae302330243021375400644646600200200644a66604a00229404c94ccc08ccdc79bae302700200414a2266006006002604e0026eb0c084c088c088c088c088c088c088c088c088c07cdd50051810180f1baa0031616375c603e00260386ea801458c074c078008c070004c064dd50008b180d180d801180c800980c801180b800980a1baa00114984d958dd70009bad001375a0026eb8004dd70009bad001375c0026eb80055cd2ab9d5573caae7d5d0aba24c011e581c1d6eb334cd741cfd048311ad99f05d0575e7c89f8b01c3103b98a006004c0108474578616d706c65004c0102184b004c0109486d616a6f72697479004c010948456c696769626c65004c01010a004c01031903e8004c0107467075626c69630001";
  const addrReceiver =
    "addr_test1qqwkave5e46pelgysvg6mx0st5zhte7gn79srscs8wv2qp5qkfvca3f7kpx3v3rssm4j97f63v5whrj8yvsx6dac9xrqyqqef6";
  const admin =
    "addr_test1qqwkave5e46pelgysvg6mx0st5zhte7gn79srscs8wv2qp5qkfvca3f7kpx3v3rssm4j97f63v5whrj8yvsx6dac9xrqyqqef6";
  await exportMoney(
    [txHash1],
    amount,
    scriptAddr,
    constributeScriptCbor,
    addrReceiver,
    admin,
  );
}
main();
