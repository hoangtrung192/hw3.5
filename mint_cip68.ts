import { Wallet, PlutusScript} from "@meshsdk/core";
import {wallet, blockchainProvider} from "./test_provider"
import { txBuilder } from "./conduct_transaction";

async function main(){
    const utxos = wallet.getUtxos(); //lay utxo
    //lay nhung dia chi da su dung
    const usedAddress = wallet.getUsedAddress();
    const address = usedAddress[0];
    //kiem tra neu not found thi tha ra loi
    if(address == undefined){
        throw "address not found";
    }
    const userTokenMetadata = {
        name: "NFT CIP68",
        image: "ipfs://QmRzicpReutwCkM6aotuKjErFCUD213DpwPq6ByuzMJaua",
        mediaType: "image/jpg",
        description: "Hello world - CIP68",
      };
      const alawysSucceedPlutusScript: PlutusScript = {
        code: demoPlutusAlwaysSucceedScript,
        version: "V1",
      };


}
main();
//npx tsx mint_cip68.ts