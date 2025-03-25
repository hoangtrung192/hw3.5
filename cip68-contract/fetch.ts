import {
  CIP68_222,
  CIP68_100,
  deserializeAddress,
  BlockfrostProvider,
  deserializeDatum,
} from "@meshsdk/core";
import { wallet } from './common';

// Initialize blockchain provider
const blockchainProvider = new BlockfrostProvider('preprod2DQWsQjqnzLW9swoBQujfKBIFyYILBiL');

// Define a structure for our parsed assets
interface ParsedAsset {
  unit: string;  // combined policyId + assetName
  policyId: string;
  assetName: string;
  assetNameHex: string;
  quantity: string;
}

async function main() {
  try {
    // Fetch all assets for the wallet
    const walletAddress = wallet.getChangeAddress();
    const assetsResponse = await blockchainProvider.fetchAddressAssets(walletAddress);
    const meta = await blockchainProvider.fetchAssetMetadata("c3928d5f3308b9ac91b870c650e4d31d2222a26e34b8823b6d86e35d000de14054657374");
    console.log("metadata : " + meta);
    // Create array to store parsed assets
    const parsedAssets: ParsedAsset[] = [];
    
    // Parse assets from object format directly
    for (const [unit, quantity] of Object.entries(assetsResponse)) {
      if (unit === 'lovelace') {
        // Handle native ADA tokens
        parsedAssets.push({
          unit: 'lovelace',
          policyId: '',
          assetName: 'lovelace',
          assetNameHex: '',
          quantity: String(quantity)
        });
      } else {
        // Handle custom tokens
        const policyId = unit.slice(0, 56);
        const assetNameHex = unit.slice(56);
        
        // Try to decode assetName from hex
        let assetName = assetNameHex;
        try {
          assetName = Buffer.from(assetNameHex, 'hex').toString('utf8');
        } catch (e) {
          // Keep hex if conversion fails
        }
        
        parsedAssets.push({
          unit,
          policyId,
          assetName,
          assetNameHex,
          quantity: String(quantity)
        });
      }
    }
    
    // Get all CIP68 tokens (both user and reference)
    const cip68Tokens = parsedAssets.filter(asset => 
      asset.assetNameHex.startsWith('000de140') || 
      asset.assetNameHex.startsWith('000643b0')
    );
    
    console.log(`Found ${cip68Tokens.length} CIP68 tokens`);
    
    // Process each CIP68 token to fetch metadata
    for (const token of cip68Tokens) {
      let refTokenUnit;
      
      if (token.assetNameHex.startsWith('000de140')) {
        // It's a user token (222) - convert to reference token (100) to get metadata
        const tokenName = token.assetNameHex.substring(8); // Skip the 000de140 prefix
        refTokenUnit = token.policyId + '000643b0' + tokenName;
        console.log(`CIP68 User Token: ${token.assetName}`);
      } else {
        // It's already a reference token (100)
        refTokenUnit = token.unit;
        console.log(`CIP68 Reference Token: ${token.assetName}`);
      }
      
      try {
        // Try fetching metadata using Blockfrost API
        const metadata = await blockchainProvider.fetchAssetMetadata(refTokenUnit);
        if (metadata) {
          console.log("Metadata:", JSON.stringify(metadata, null, 2));
        } else {
          console.log("No metadata found for token");
        }
      } catch (error) {
        console.log(`Error fetching metadata: ${error.message}`);
      }
    }
  } catch (error) {
    console.error("Error in main process:", error);
  }
}

main();