import {
    CIP68_222,
    CIP68_100,
    deserializeAddress,
    BlockfrostProvider,
    deserializeDatum,
  } from "@meshsdk/core";
  import { wallet } from './common';
  interface ParsedAsset {
    unit: string;  // combined policyId + assetName
    policyId: string;
    assetName: string;
    assetNameHex: string;
    quantity: string;
    

  }
  interface ParsedMetaData{
    name: string;
    image: string;
    _pk: string;
    fingerprint: string;
    totalSupply: string;

  }
  // Initialize blockchain provider
  const blockchainProvider = new BlockfrostProvider('preprod2DQWsQjqnzLW9swoBQujfKBIFyYILBiL');
async function main(){
    const walletAddress = wallet.getChangeAddress();
    const assetsInfoWallet = await blockchainProvider.fetchAddressAssets(walletAddress);
    const test = await blockchainProvider.fetchAssetMetadata("fc1ebe51de6666367a374d0a06a7b89060634b5442569b9df5e1caaa000de140444944");
    console.log(test);
    const parsedAssets: ParsedAsset[] = [];
    const ParsedMetaData: ParsedMetaData[] = [];
    for(const [unit, quantity] of Object.entries(assetsInfoWallet)){
        if(unit === 'lovelace'){
            continue;
        }
        else{
            const policyId = unit.slice(0, 56);
            const assetNameHex = unit.slice(56);
            //const _pk = unit.substring(0)
            let _pk = unit.substring(4);
            let assetName = assetNameHex;
            assetName = Buffer.from(assetNameHex, 'hex').toString('utf8');
            if(assetNameHex.startsWith('000de140')){
                let unitAsset = policyId + assetNameHex;
                const metadata = await blockchainProvider.fetchAssetMetadata(unitAsset.toString());
                //console.log("MetaData: " + unitAsset + " assetName : " + assetName);
                console.log("unit Asset : " + unitAsset);
                console.log("Metadata : " , metadata);
                

                        console.log("pubkeyHash : ", deserializeAddress(walletAddress).pubKeyHash);
                        console.log("pk : " ,metadata._pk);
                    }
                
               
            }
        }
    }


main();