import {
    CIP68_100,
    stringToHex,
    mConStr0,
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
    PlutusScript,
    UTxO,
    CIP68_222,
    mConStr1
  } from "@meshsdk/core";
  import { isEmpty, isNil } from "lodash";
  import plutus from './plutus.json';
  import { getWalletInfoForTx, wallet } from './common';
  
  // Constants
  const APP_WALLET_ADDRESS = "addr_test1qqwkave5e46pelgysvg6mx0st5zhte7gn79srscs8wv2qp5qkfvca3f7kpx3v3rssm4j97f63v5whrj8yvsx6dac9xrqyqqef6";
  const appNetwork = "preprod";
  const blockchainProvider = new BlockfrostProvider('preprod2DQWsQjqnzLW9swoBQujfKBIFyYILBiL');
  
  // Helper functions
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
    const utxos = await blockchainProvider.fetchAddressUTxOs(address, unit);
    if (utxos.length === 0) throw new Error(`No UTXOs found with asset: ${unit}`);
    return utxos[utxos.length - 1];
  }
  async function getAddressUTXOAssets (address: string, unit: string) {
    return await blockchainProvider.fetchAddressUTxOs(address, unit);
  };
  
  async function burnTokens(params: { assetName: string; quantity: string; txHash?: string }[]) {
    // Get wallet information
    const {utxos, walletAddress, collateral} = await getWalletInfoForTx(wallet);
    const { pubKeyHash: userPubKeyHash } = deserializeAddress(walletAddress);
    const exChange = APP_WALLET_ADDRESS;
    const pubkeyExchange = deserializeAddress(exChange).pubKeyHash;
    
    // Initialize transaction builder
    const unsignedTx = new MeshTxBuilder({
      fetcher: blockchainProvider,
      submitter: blockchainProvider,
      verbose: true,
    });
    
    // Get validators and scripts
    const mintCompilecode = readValidator("mint.mint.mint");
    const storeCompilecode = readValidator("store.store.spend");
    const storeScriptCbor = applyParamsToScript(storeCompilecode, [pubkeyExchange, BigInt(1), userPubKeyHash]);
        
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
    
    const storeScriptHash = deserializeAddress(storeAddress).scriptHash;
    const mintScriptCbor = applyParamsToScript(mintCompilecode, [
      pubkeyExchange,
      BigInt(1),
      storeScriptHash,
      deserializeAddress(exChange).stakeCredentialHash,
      userPubKeyHash,
    ]);
    const policyId = resolveScriptHash(mintScriptCbor, "V3");
    console.log("Building transaction ...");
    // Process each token update
    await Promise.all(
        params.map(async ({ assetName, quantity, txHash }) => {
          const userUtxos = await getAddressUTXOAssets(walletAddress, policyId + CIP68_222(stringToHex(assetName)));
          const amount = userUtxos.reduce((amount, utxos) => {
            return (
              amount +
              utxos.output.amount.reduce((amt, utxo) => {
                if (utxo.unit === policyId + CIP68_222(stringToHex(assetName))) {
                  return amt + Number(utxo.quantity);
                }
                return amt;
              }, 0)
            );
          }, 0);
          const storeUtxo = !isNil(txHash)
            ? await getUtxoForTx(storeAddress, txHash)
            : await getAddressUTXOAsset(storeAddress, policyId + CIP68_100(stringToHex(assetName)));
          if (!storeUtxo) throw new Error("Store UTXO not found");
  
          if (-Number(quantity) === amount) {
            unsignedTx
              .mintPlutusScriptV3()
              .mint(quantity, policyId, CIP68_222(stringToHex(assetName)))
              .mintRedeemerValue(mConStr1([]))
              .mintingScript(mintScriptCbor)
  
              .mintPlutusScriptV3()
              .mint("-1", policyId, CIP68_100(stringToHex(assetName)))
              .mintRedeemerValue(mConStr1([]))
              .mintingScript(mintScriptCbor)
  
              .spendingPlutusScriptV3()
              .txIn(storeUtxo.input.txHash, storeUtxo.input.outputIndex)
              .txInInlineDatumPresent()
              .txInRedeemerValue(mConStr1([]))
              .txInScript(this.storeScriptCbor);
          } else {
            unsignedTx
              .mintPlutusScriptV3()
              .mint(quantity, policyId, CIP68_222(stringToHex(assetName)))
              .mintRedeemerValue(mConStr1([]))
              .mintingScript(mintScriptCbor)
  
              .txOut(walletAddress, [
                {
                  unit: policyId + CIP68_222(stringToHex(assetName)),
                  quantity: String(amount + Number(quantity)),
                },
              ]);
          }
        }),
      );
  
      unsignedTx
        .txOut(APP_WALLET_ADDRESS, [
          {
            unit: "lovelace",
            quantity: "1000000",
          },
        ])
  
        .requiredSignerHash(deserializeAddress(walletAddress).pubKeyHash)
        .changeAddress(walletAddress)
        .selectUtxosFrom(utxos)
        .txInCollateral(collateral.input.txHash, collateral.input.outputIndex, collateral.output.amount, collateral.output.address)
        .setNetwork(appNetwork);
    console.log("Building transaction ...");
    const completeTx = await unsignedTx.complete();
    console.log("Signing transaction ...");
    const signTx = wallet.signTx(completeTx, true);
    console.log("Submitting transaction ...");
    const txHash = await wallet.submitTx(signTx); 
    console.log("Completing transaction ...");
      return txHash;
  }
  
  // Example usage
  async function main() {
    try {
      
      const result = await burnTokens([
        {
          assetName: "Hello World",
          quantity: "-1"
          
        }
      ]);
      
      console.log("Transaction hash:", result);
    } catch (error) {
      console.error("Error burning tokens:", error);
    }
  }
  
  // Run the function
  main();