import {
    CIP68_222,
    stringToHex,
    mConStr0,
    CIP68_100,
    metadataToCip68,
    deserializeAddress,
    MeshTxBuilder,
    BlockfrostProvider,
    MeshWallet,
    applyParamsToScript,
    resolveScriptHash,
    serializeAddressObj,
    serializePlutusScript,
    scriptAddress,
    deserializeDatum,
    DeserializedAddress,
    PlutusScript,
    Asset,
    pubKeyHash,
    policyId,
    assetName
    ,mConStr1
    ,mConStr2
  } from "@meshsdk/core";
  import plutus from './plutus.json';
  import { Plutus } from "./interface";
  import { getScript, getWalletInfoForTx, wallet, blockchainProvider, getTxBuilder, getUtxoForTx} from './common';
  import { PolicyId } from "@meshsdk/core-cst";
  import { isEmpty, isNil } from "lodash";
  const TOKEN_NAME = "Portfolio";
  const RECEIVER = "addr_test1qqwkave5e46pelgysvg6mx0st5zhte7gn79srscs8wv2qp5qkfvca3f7kpx3v3rssm4j97f63v5whrj8yvsx6dac9xrqyqqef6";
  const POLICY_ID = "";
  const REQUIRED_ADA = 0;

  function readValidator(title: string): string {
    const validator = plutus.validators.find(v => v.title === title);
    if (!validator) {
      throw new Error(`${title} validator not found.`);
    }
    return validator.compiledCode;
  }
  
  async function unlock_nft(token_name: string, tx: string) {
    try {
      const { utxos, walletAddress, collateral } = await getWalletInfoForTx(wallet);
      const { pubKeyHash: userPubKeyHash } = deserializeAddress(walletAddress);
      
      console.log("Fetching UTXOs for transaction:", tx);
      const unlockUtxos = await blockchainProvider.fetchUTxOs(tx);
      
      if (!unlockUtxos || unlockUtxos.length === 0) {
        throw new Error(`No UTXOs found for transaction ${tx}`);
      }
      
      const utxoUnlock = unlockUtxos[0];
      console.log("UTXO details:", JSON.stringify({
        txHash: utxoUnlock.input.txHash,
        outputIndex: utxoUnlock.input.outputIndex,
        address: utxoUnlock.output.address
      }));
      
      // Log để debug datum
      const datum = utxoUnlock.output.plutusData 
        ? deserializeDatum(utxoUnlock.output.plutusData) 
        : "No datum found";
      console.log("Datum:", JSON.stringify(datum, null, 2));
      
      const nftAsset = utxoUnlock.output.amount.find(asset => asset.unit !== "lovelace");
      if (!nftAsset) {
        throw new Error("No NFT found in UTXO");
      }
      
      // Tạo script từ validator với tham số lấy từ datum
      const hopistalTitle = readValidator("hopistal.hopistal_management.spend");
      console.log("Tái tạo script với tham số từ datum...");
      
      // QUAN TRỌNG: Đảm bảo các giá trị này khớp với định dạng dữ liệu từ datum
      const {scriptCbor, scriptAddr} = getScript();
      console.log("Script address tái tạo:", scriptAddr);
      console.log("Script address từ UTXO:", utxoUnlock.output.address);
      
      const txBuilder = getTxBuilder();
      const unsignedTx = txBuilder.spendingPlutusScriptV3();
      
      console.log("Building transaction...");
      unsignedTx
        .txIn(
          utxoUnlock.input.txHash,
          utxoUnlock.input.outputIndex,
          utxoUnlock.output.amount,
          scriptAddr
        )
       // .spendingReferenceTxInInlineDatumPresent()
       // .spendingReferenceTxInRedeemerValue(mConStr2([]))
        .txInInlineDatumPresent()
        .txInRedeemerValue(mConStr2([])) // Index 2 for "Unlock"
        .txInScript(scriptCbor)
        .txOut(walletAddress, [{
          unit: "c3928d5f3308b9ac91b870c650e4d31d2222a26e34b8823b6d86e35d000de140506f7274666f6c696f",
          quantity:"1"
        }
          ,{
          unit: "lovelace",
          quantity: "10000000",
        }])
        .txInCollateral(
          collateral.input.txHash,
          collateral.input.outputIndex,
          collateral.output.amount,
          collateral.output.address
        )
        .requiredSignerHash(userPubKeyHash)
        .changeAddress(walletAddress)
        .selectUtxosFrom(utxos)
        .setNetwork("preprod")
        .addUtxosFromSelection()  ;
        
      console.log("Transaction built, completing...");
      const completeTx = await unsignedTx.complete();
      console.log("Signing transaction...");
      const signTx = await wallet.signTx(completeTx, true);
      console.log("Submitting transaction...");
      const txHash = await wallet.submitTx(signTx);
      console.log("Transaction submitted! TxHash:", txHash);
      
      return txHash;
    } catch (error) {
      console.error("Error in unlock_nft:", error);
      throw error;
    }
  }

  async function main() {
    try {
      const txHash = await unlock_nft(
        TOKEN_NAME,
        "67592e383f382ab21b96cc6435e5a53da5a9d7b29573ac2b3678499085c8796e"
      );
      console.log("TxHash : " + txHash);
    } catch (error) {
      console.error("Error in main function:");
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
      
      // Nếu có thông tin blockchain error
      if (error.data) {
        console.error("Blockchain error data:", JSON.stringify(error.data, null, 2));
      }
    }
  }

  main();
