import {
  Wallet,
  serializePlutusScript,
  resolvePlutusScriptAddress,
  Asset,
  Transaction,
} from "@meshsdk/core";
import { wallet, blockchainProvider } from "./test_provider";
import type { PlutusScript } from "@meshsdk/core";
async function main() {
  //serializePlustusScript giai ma cbor
  //script ma code tu plutus
  const script: PlutusScript = {
    code: "4e4d01000033222220051200120011",
    version: "V2",
  };
  //khoi tao tai san muon chuyen
  const assets: Asset[] = [
    {
      unit: "lovelace",
      quantity: "1000000",
    },
  ];
  //giai ma script
  const scriptAddress = resolvePlutusScriptAddress(script, 0);
  console.log("Script Address : " + scriptAddress);
  const tx = new Transaction({ initiator: wallet });
  tx.sendAssets(
    {
      address: scriptAddress,
      datum: {
        value: "meshsecretcode",
      },
    },
    assets
  );
  const unsignedTx = await tx.build();
  const signedTx = await wallet.signTx(unsignedTx);
  const txHash = await wallet.submitTx(signedTx);
  console.log("txHash : " + txHash);
}
main();
//npx tsx lock_contract.ts