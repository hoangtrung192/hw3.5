import {
  applyParamsToScript,
  Asset,
  BrowserWallet,
  deserializeAddress,
  mConStr0,
  MeshTxBuilder,
  serializePlutusScript,
  stringToHex,
} from "@meshsdk/core";

import {
  wallet,
  blockchainProvider,
  getTxBuilder,
  getWalletInfoForTx,
  readValidator,
} from "./adapter";

export async function contribute(
  wallet: any,
  admin: string,
  assets: any,
  amount: number,
  name: string,
  proposalEligibilityText: string,
  cooldownPeriod: number,
  visibility: string,
  minContribution: number,
  approvalThreshold: number,
  votingMechanism:string,
) {
  try {
    const { utxos, walletAddress } = await getWalletInfoForTx(
      wallet
    );
    const pubkeyContributor = deserializeAddress(walletAddress).pubKeyHash;
    const pubkeyAdmin = deserializeAddress(admin).pubKeyHash;
    const contributeCompileCode = readValidator("contribute.contribute.spend");
    const constributeScriptCbor = applyParamsToScript(
      contributeCompileCode,
      [pubkeyAdmin, stringToHex(name),
        approvalThreshold,
        stringToHex(votingMechanism),
        stringToHex(proposalEligibilityText),
        minContribution,
        cooldownPeriod,
        stringToHex(visibility),
        
      ],
    );
    const scriptAddr = serializePlutusScript(
      { code: constributeScriptCbor, version: "V3" },
      undefined,
      0,
    ).address;
    console.log("scriptAddr: ", scriptAddr);
    console.log("scriptcbor: ", constributeScriptCbor);
    const txBuilder = getTxBuilder();
    const datum = mConStr0([amount, pubkeyContributor, pubkeyAdmin]);

    await txBuilder
      .spendingPlutusScriptV3()
      .txOut(scriptAddr, assets)
      .txOutInlineDatumValue(datum)
      .changeAddress(walletAddress)
      .requiredSignerHash(pubkeyContributor)
      .selectUtxosFrom(utxos)
      .setNetwork("preprod");

    const tx = await txBuilder.complete();
    const signedTx = await wallet.signTx(tx, true);
    const TxHash = await wallet.submitTx(signedTx);

    return TxHash;
  } catch (error) {
    throw new Error("Error in contribute function: " + error);
  }
}

async function main() {
  const admin =
    "addr_test1qqwkave5e46pelgysvg6mx0st5zhte7gn79srscs8wv2qp5qkfvca3f7kpx3v3rssm4j97f63v5whrj8yvsx6dac9xrqyqqef6";
    const assets: Asset[] = [
      {
        unit: "lovelace",
        quantity: "30000000",
      }
    ];
  const amount = 30000000;
  
  const name = "Example";
  const proposalEligibilityText = "Eligible";
  const cooldownPeriod = 1000;
  const visibility = "public";
  const minContribution = 10;
  const approvalThreshold = 75;
  const votingMechanism = "majority";

  const txHash = await contribute(
    wallet,
    admin,
    assets,
    amount,
    name,
    proposalEligibilityText,
    cooldownPeriod,
    visibility,
    minContribution,
    approvalThreshold,
    votingMechanism
  );
  console.log("Transaction Hash: ", txHash);
}
main();
function requiredSignerHash(pubkeyContributor: string) {
  throw new Error("Function not implemented.");
}

