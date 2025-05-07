import {
  CIP68_222,
  CIP68_100,
  stringToHex,
  mConStr0,
  metadataToCip68,
  deserializeAddress,
  MeshTxBuilder,
  applyParamsToScript,
  resolveScriptHash,
  serializeAddressObj,
  serializePlutusScript,
  scriptAddress,
  PlutusScript,
  UTxO,
  
} from "@meshsdk/core";
import plutus from './plutus.json';
import { Plutus } from "./type";
import { blockchainProvider, getWalletInfoForTx, wallet } from './common';
import { isEmpty, isNil } from "lodash";
// Configuration constants
const APP_WALLET_ADDRESS = "addr_test1qqwkave5e46pelgysvg6mx0st5zhte7gn79srscs8wv2qp5qkfvca3f7kpx3v3rssm4j97f63v5whrj8yvsx6dac9xrqyqqef6";
const appNetwork = "preprod";

function readValidator(title: string): string {
  const validator = plutus.validators.find(v => v.title === title);
  if (!validator) {
    throw new Error(`${title} validator not found.`);
  }
  return validator.compiledCode;
}

async function getUtxoForTx(address: string, txHash: string): Promise<UTxO> {
  const utxos = await blockchainProvider.fetchAddressUTxOs(address);
  const utxo = utxos.find(utxo => utxo.input.txHash === txHash);
  if (!utxo) throw new Error(`No UTXOs found for txHash: ${txHash}`);
  return utxo;
}

async function getAddressUTXOAsset(address: string, unit: string): Promise<UTxO> {
  console.log(`Searching for asset ${unit} at address ${address}`);
  const utxos = await blockchainProvider.fetchAddressUTxOs(address, unit);
  if (utxos.length === 0) throw new Error(`No UTXOs found with asset: ${unit}`);
  console.log(`Found ${utxos.length} UTXOs with the asset`);
  return utxos[utxos.length - 1];
}

async function updateTokens(params: { assetName: string; metadata: Record<string, string>; txHash?: string; originalMinterAddress?: string }[]) {
  // Get wallet information for the current user (B)
  const {utxos, walletAddress, collateral} = await getWalletInfoForTx(wallet);
  const { pubKeyHash: userPubKeyHash } = deserializeAddress(walletAddress);
  const exChange = APP_WALLET_ADDRESS;
  const pubkeyExchange = deserializeAddress(exChange).pubKeyHash;
  
  console.log("Current user wallet address:", walletAddress);
  console.log("Current user pubKeyHash:", userPubKeyHash);
  
  // Initialize transaction builder
  const unsignedTx = new MeshTxBuilder({
    fetcher: blockchainProvider,
    submitter: blockchainProvider,
    verbose: true,
  });
  
  // Get validators and scripts
  const mintCompilecode = readValidator("mint.mint.mint");
  const storeCompilecode = readValidator("store.store.spend");
  
  // Process each token update
  await Promise.all(
    params.map(async ({ assetName, metadata, txHash, originalMinterAddress }) => {
      // Xác định người mint gốc (A)
      let originalMinterPubKeyHash = userPubKeyHash;
      
      if (originalMinterAddress) {
        console.log(`Using provided original minter address: ${originalMinterAddress}`);
        originalMinterPubKeyHash = deserializeAddress(originalMinterAddress).pubKeyHash;
      } else {
        console.log("Using current user as original minter");
      }
      
      console.log("Original minter pubKeyHash:", originalMinterPubKeyHash);
      
      // Tạo store script giống hệt như lúc mint
      const storeScriptCbor = applyParamsToScript(storeCompilecode, [
        pubkeyExchange,
        BigInt(1),
        originalMinterPubKeyHash  // Sử dụng originalMinterPubKeyHash như ban đầu
      ]);
      
      const storeScript: PlutusScript = {
        code: storeScriptCbor,
        version: "V3" as "V3",
      };
      
      const storeAddress = serializeAddressObj(
        scriptAddress(
          deserializeAddress(serializePlutusScript(storeScript, undefined, 0, false).address).scriptHash,
          deserializeAddress(exChange).stakeCredentialHash,
          false,
        ),
        0,
      );
      
      console.log("Store address:", storeAddress);
      
      const storeScriptHash = deserializeAddress(storeAddress).scriptHash;
      
      // Tạo mint script giống hệt như lúc mint
      const mintScriptCbor = applyParamsToScript(mintCompilecode, [
        pubkeyExchange,
        BigInt(1),
        storeScriptHash,
        deserializeAddress(exChange).stakeCredentialHash,
        originalMinterPubKeyHash, // Sử dụng pubKeyHash của A
      ]);
      
      // Tính policyId
      const policyId = resolveScriptHash(mintScriptCbor, "V3");
      const hexAssetName = stringToHex(assetName);
      
      console.log("Policy ID:", policyId);
      console.log("Asset name (hex):", hexAssetName);
      
      const referenceTokenId = policyId + CIP68_100(hexAssetName);
      console.log("Reference token ID:", referenceTokenId);
      
      try {
        // Tìm UTXO chứa reference token
        const storeUtxo = !isNil(txHash)
          ? await getUtxoForTx(storeAddress, txHash)
          : await getAddressUTXOAsset(storeAddress, referenceTokenId);
        
        console.log("Found UTXO:", storeUtxo.input.txHash);
        
        // Kiểm tra xem UTXO có chứa reference token không
        const hasReferenceToken = storeUtxo.output.amount.some(
          asset => asset.unit === referenceTokenId
        );
        
        if (!hasReferenceToken) {
          throw new Error(`UTXO does not contain reference token ${referenceTokenId}`);
        }
        
        // >>> Thay đổi quan trọng: Thêm người mint gốc (A) vào requiredSigners <<<
        // Điều này là bắt buộc vì hợp đồng kiểm tra "signed_by_author"
        
        const requiredSigners = [];
        requiredSigners.push(originalMinterPubKeyHash); // Thêm pubKeyHash của A
        
        if (originalMinterPubKeyHash !== userPubKeyHash) {
          requiredSigners.push(userPubKeyHash); // Thêm pubKeyHash của B nếu khác với A
        }
        
        // Thêm vào giao dịch
        unsignedTx
          .spendingPlutusScriptV3()
          .txIn(storeUtxo.input.txHash, storeUtxo.input.outputIndex)
          .txInInlineDatumPresent()
          .txInRedeemerValue(mConStr0([])) // Sử dụng Update redeemer
          .txInScript(storeScriptCbor)
          .txOut(storeAddress, [{
            unit: referenceTokenId,
            quantity: "1",
          }])
          .txOutInlineDatumValue(metadataToCip68(metadata))
          .requiredSignerHash(originalMinterPubKeyHash); // Phải có chữ ký của người mint gốc
        
        // Thêm người dùng hiện tại nếu khác với người mint gốc
        if (originalMinterPubKeyHash !== userPubKeyHash) {
          console.log("Adding current user as additional signer");
          unsignedTx.requiredSignerHash(userPubKeyHash);
        }
      } catch (error) {
        console.error(`Error processing token ${assetName}:`, error);
        
        // Thêm debug thông tin để tìm hiểu vấn đề
        console.log("Checking all UTXOs at store address...");
        const allUtxos = await blockchainProvider.fetchAddressUTxOs(storeAddress);
        console.log(`Found ${allUtxos.length} UTXOs at ${storeAddress}`);
        
        if (allUtxos.length > 0) {
          console.log("Listing all assets in these UTXOs:");
          allUtxos.forEach((utxo, index) => {
            console.log(`UTXO ${index + 1} (${utxo.input.txHash}):`);
            utxo.output.amount.forEach(asset => {
              console.log(`- ${asset.unit}: ${asset.quantity}`);
            });
          });
        }
        
        throw error;
      }
    })
  );
  
  // Add platform fee payment
  unsignedTx
    .txOut(exChange, [{
      unit: "lovelace",
      quantity: "1000000", // Platform fee
    }])
    .changeAddress(walletAddress)
    .selectUtxosFrom(utxos)
    .txInCollateral(
      collateral.input.txHash, 
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address
    )
    .setNetwork(appNetwork);
  
  console.log("Completing transaction ...");
  
  // *** THAY ĐỔI QUAN TRỌNG ***
  // Nếu B cập nhật token của A, B cần sử dụng A ký giao dịch này
  // Nhưng trong trường hợp thực tế, B không thể có private key của A
  // Do đó, cần có cơ chế ủy quyền hoặc sửa đổi hợp đồng thông minh
  console.log("WARNING: This transaction requires the signature of the original minter!");
  console.log("In a real scenario, you would need to implement a delegation mechanism");
  
  const completedTx = await unsignedTx.complete();
  console.log("Signing transaction...");
  
  // B không thể tự ký cho A, vì vậy trong thực tế điều này sẽ thất bại
  // hoặc bạn cần một cơ chế ủy quyền
  const signedTx = await wallet.signTx(completedTx, true);
  
  console.log("Submitting transaction...");
  const txHashUpdate = await wallet.submitTx(signedTx);
  console.log("Transaction submitted successfully!");
  console.log("Update successful! TxHash: " + txHashUpdate);

  return txHashUpdate;
}

async function main() {
  try {
    // Địa chỉ của người mint gốc (A)
    const originalMinterAddress = "addr_test1qp32dhvj6nmhn8qjce8vsv3s0x70rrth7udxy32a7lm5yl7vchlp2ahqwyyfpv4l7fszccrngx2vcmmu5x3d3t3cy2uqpd7ewx";
    
    // Metadata mới cho token
    const newMetadata = {
      name: "cip68_9_57",
      image: "ipfs://bafkreiabqbmwcmivnhwtuwjngoshlwfivjygvpx7qfr4tokgfd4wqeiuwe",
      mediaType: "image/jpg",
      description: "Updated CIP68 token by user B",
    //  _pk: deserializeAddress(await wallet.getChangeAddress()).pubKeyHash, // Thay bằng public key của B
      hex: "updated_hex_value_by_user_B",
    };
    
    // Update token
    const result = await updateTokens([
      {
        assetName: "cip68_9_57", // Tên token giống như lúc mint
        metadata: newMetadata,
        originalMinterAddress: originalMinterAddress // Địa chỉ của người mint gốc (A)
      }
    ]);
    
    console.log("Update completed with tx hash:", result);
  } catch (error) {
    console.error("Error updating tokens:", error);
  }
}

main();