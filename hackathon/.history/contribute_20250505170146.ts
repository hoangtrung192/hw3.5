import {
  applyParamsToScript,
  Asset,
  deserializeAddress,
  mConStr0,
  MeshTxBuilder,
  serializePlutusScript,
  stringToHex
} from "@meshsdk/core";

import {
  blockchainProvider,
  getWalletInfoForTx,
  readValidator,
  wallet,

} from "./adapter";

a
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
  const amount = 30;
  const txHash = await contribute(admin, assets, amount);
  console.log("Transaction Hash: ", txHash);
}
main();
function requiredSignerHash(pubkeyContributor: string) {
  throw new Error("Function not implemented.");
}

