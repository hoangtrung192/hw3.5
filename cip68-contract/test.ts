import {
    CIP68_222,
    CIP68_100,
    deserializeAddress,
    BlockfrostProvider,
    deserializeDatum,
  } from "@meshsdk/core";
  import { blockchainProvider, wallet} from "./common";
 // import { encryptData, decryptData } from "./enCryptAndDecrypt";
  
  interface ParsedAsset {
    unit: string;  // combined policyId + assetName
    policyId: string;
    assetName: string;
    assetNameHex: string;
    quantity: string;
  }
  
  interface ParsedMetaData {
    name: string;
    image: string;
    _pk: string;
    fingerprint: string;
    totalSupply: string;
    hexRandomCode: string;
  }
   async function verify_did(wallet: any, key: string, RandomCode: string) {
    console.log("Verifying DID with RandomCode:", RandomCode);
    
    if (!wallet || !key || !RandomCode) {
        console.error("Missing required parameters for verification");
        return false;
    }
    
    // Mã hóa RandomCode từ database thành hexRandomCode để so sánh
   // const encryptedRandomCode = encryptData(RandomCode, key);
 //   console.log("Encrypted RandomCode from DB:", encryptedRandomCode);
    
    const walletAddress = await wallet.getChangeAddress();
    console.log("Wallet address:", walletAddress);
    
    const assetsInfoWallet = await blockchainProvider.fetchAddressAssets(walletAddress);
    console.log("Found assets count:", Object.keys(assetsInfoWallet).length - 1); // -1 for lovelace
    
    const { pubKeyHash: userPubkeyHash } = deserializeAddress(walletAddress);
    console.log("Wallet pubKeyHash:", userPubkeyHash);
  
    for (const [unit, quantity] of Object.entries(assetsInfoWallet)) {
        if (unit === 'lovelace') {
            continue;
        }
  
        const policyId = unit.slice(0, 56);
        const assetNameHex = unit.slice(56);
        console.log("Checking asset:", unit);
        console.log("Policy ID:", policyId);
        console.log("Asset name hex:", assetNameHex);
        
        
            let assetName = Buffer.from(assetNameHex, 'hex').toString('utf8');
            console.log("Asset name decoded:", assetName);
            
            // Kiểm tra NFT có đúng định dạng không - loại bỏ kiểm tra này để xem tất cả NFT
            // if (assetNameHex.startsWith('000de140')) {
                console.log("Checking NFT metadata");
                let unitAsset = policyId + assetNameHex;
                const metadata = await blockchainProvider.fetchAssetMetadata(unitAsset.toString());
                
                console.log("metadata : " , metadata);
                console.log("metadata fingerprint : " , metadata.hexRandomCode);
                const buffer =  Buffer.from("aT5tlxgrC3aSk+DqJxV3Cw==", 'hex').toString('utf8');
                console.log("buffer : " + buffer);
}
    
}
async function main(){
    const bool = await verify_did(wallet, "0000000000000000", "D8MT7RMO");
}
main();