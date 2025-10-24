
import {
  DEFAULT_REDEEMER_BUDGET,
  Mint,
  mTxOutRef,
  PlutusScript,
  resolvePlutusScriptAddress,
  Transaction,
} from "@meshsdk/core";
import { applyParamsToScript } from "@meshsdk/core-cst";
import {wallet} from "./common";
import { demoPlutusAlwaysSucceedScript, oneTimeMintingPolicy } from "./common";
async function main(){
    
    //get address used
    const address = await wallet.getChangeAddress();
    //const  = usedAdress;
    console.log("balance: ", await wallet.getBalance())
    console.log("address: ", address);
    // check address 
    if(address == undefined){
        throw "Adress not found";
    }
    const redeemer = {
        data: { alternative: 0, fields: [] },
        tag: "MINT",
        budget: DEFAULT_REDEEMER_BUDGET,
      };
  

    const alawysSucceedPlutusScript: PlutusScript = {
        code: demoPlutusAlwaysSucceedScript,
        version: "V2",
      };

      const scriptAddress = resolvePlutusScriptAddress(
        alawysSucceedPlutusScript,
        address.substring(0, 5) === "addr1" ? 1 : 0,
      );
      //name token
      const userInput = "Hello World";

      const userTokenMetadata = {
        name: userInput,
        image: "ipfs://bafkreideqzlxt33hejgqhldmgzpkyy7d2fsfye5hb2vafn3ysyv6zuzwre",
        mediaType: "image/jpg",
        description: "Hello world - CIP68",
      };

       const cip68Token: Mint = {
        assetName: userInput,
        assetQuantity: "1",
        metadata: userTokenMetadata,
        recipient: address,
        cip68ScriptAddress: scriptAddress,
      };

      const utxos = await wallet.getUtxos();
      
      if (!utxos || utxos.length <= 0) {
        throw "No UTxOs found in wallet";
      }
  
      const scriptCode = applyParamsToScript(oneTimeMintingPolicy, [
        mTxOutRef(utxos[0]?.input.txHash!, utxos[0]?.input.outputIndex!),
      ]);
      const script: PlutusScript = {
        code: scriptCode,
        version: "V2",
      };
  
      const tx = new Transaction({ initiator: wallet })
        .setNetwork("preprod")
        .setTxInputs([utxos[0]!])
        .mintAsset(script, cip68Token, redeemer);
  
      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);
  
      console.log("Mint CIP68 Successful !");
      console.log("TxHash : " + txHash);

  

}
main().catch(console.error);
//npx tsx CIP68/mintCIP68.ts// FILE CAP NHAT DAU ANH NHI 