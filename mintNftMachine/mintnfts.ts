import {
    ForgeScript,
    MeshTxBuilder,
    resolveScriptHash,
    stringToHex,
    Transaction
} from "@meshsdk/core";
import type { Mint, AssetMetadata } from '@meshsdk/core';
import { blockchainProvider, wallet } from "./common";
import { metadata } from "./metadata";
import { recipients } from "./recipients";

async function main() {
    
    const changeAddress = await wallet.getChangeAddress();
    const forgingScript = ForgeScript.withOneSignature(changeAddress); 

    const tx = new Transaction({ initiator: wallet });

    // Xử lý cho trường hợp recipients là đối tượng có giá trị là mảng các chuỗi
    for (let recipient in recipients) {
        const recipientAddress = recipient;
        const assetNames = recipients[recipient];
        
        // Nếu assetNames là một mảng, lặp qua từng token
        if (Array.isArray(assetNames)) {
            for (const assetName of assetNames) {
                const assetMetadata: AssetMetadata = metadata[assetName];
                if (!assetMetadata) {
                    console.warn(`No metadata found for asset: ${assetName}`);
                    continue; // Bỏ qua token này nếu không tìm thấy metadata
                }
                
                const asset: Mint = {
                    assetName: assetName,
                    assetQuantity: '1',
                    metadata: assetMetadata,
                    label: '721',
                    recipient: recipientAddress
                };
                tx.mintAsset(forgingScript, asset);
            }
        }
        // Trường hợp ngược lại - để tương thích ngược với mã cũ nếu recipients vẫn là định dạng cũ
        else {
            const assetName = assetNames; // assetNames là một string trong trường hợp này
            const assetMetadata: AssetMetadata = metadata[assetName];
            if (!assetMetadata) {
                console.warn(`No metadata found for asset: ${assetName}`);
                continue;
            }
            
            const asset: Mint = {
                assetName: assetName,
                assetQuantity: '1',
                metadata: assetMetadata,
                label: '721',
                recipient: recipientAddress
            };
            tx.mintAsset(forgingScript, asset);
        }
    }

    const unsignedTx = await tx.build();
    const signedTx = await wallet.signTx(unsignedTx, false);
    const txHash = await wallet.submitTx(signedTx);

    console.log("Mint Successful !");
    console.log("TxHash : " + txHash);
}

main();
//npx tsx mintnfts.ts