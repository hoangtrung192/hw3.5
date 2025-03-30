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
  } from "@meshsdk/core";
  import plutus from './plutus.json';
  import { Plutus } from "./interface";
  import { getScript, getWalletInfoForTx, wallet, blockchainProvider, getTxBuilder} from './common';
import { PolicyId } from "@meshsdk/core-cst";

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
  
  
  async function lock_nft(token_name: string, metadata: any)
  {

    const { utxos, walletAddress, collateral } = await getWalletInfoForTx(wallet);
    const { pubKeyHash: userPubKeyHash } = deserializeAddress(walletAddress);
    const {pubKeyHash: receiverPubKeyHash} = deserializeAddress(RECEIVER); 
    const AssetName = stringToHex(token_name);
    const assets: Asset[] = [
        {
            unit: "c3928d5f3308b9ac91b870c650e4d31d2222a26e34b8823b6d86e35d000de140506f7274666f6c696f",
            quantity: "1",
        }
    ];
    console.log("read validator ...");
    const policyId = "c3928d5f3308b9ac91b870c650e4d31d2222a26e34b8823b6d86e35d";
    const metaData = await blockchainProvider.fetchAssetMetadata("c3928d5f3308b9ac91b870c650e4d31d2222a26e34b8823b6d86e35d000de140506f7274666f6c696f");
    const hopistalTitle = readValidator("hopistal.hopistal_management.spend");
    const {scriptCbor, scriptAddr} = getScript();
    console.log("scriptAddr : " + scriptAddr);
    const txBuilder = getTxBuilder();
    const unsignedTx = txBuilder.spendingPlutusScriptV3();
    unsignedTx
    .txOut(scriptAddr, assets)
    .txOutInlineDatumValue(mConStr0([userPubKeyHash  , [receiverPubKeyHash], policyId, AssetName, "10000000", metadataToCip68(metaData)]))
    .changeAddress(walletAddress)
    .selectUtxosFrom(utxos)
    .setNetwork("preprod")
    

    const completeTx = await unsignedTx.complete();
    console.log("signing ...");
    const signTx = await wallet.signTx(completeTx, true);
    console.log("signed, submitting ...");
    const txHash = await wallet.submitTx(signTx);
    console.log("submit complete ..., txHash : " + txHash);
    
    return txHash;

  }
  async function main(){
        const txHash =await lock_nft(
            TOKEN_NAME,
            {
                name: 'Test',
                image: 'ipfs://bafkreibktdoly7abv5gqg6xn7gskjliyxw3sqflqldznehbh4r3p522p6a',
                mediaType: 'image/jpg',
                description: 'My second  CIP68 token DID',
                _pk: '581c62a6dd92d4f7799c12c64ec8323079bcf18d77f71a62455df7f7427f',
                hex: '58206b61736a6469756f707769706f6470656f69776f70696f65657770706f696665',
                fingerprint: 'asset1630cmjzramsxppx9l94c48nzskwgucqy33tlzm',
                totalSupply: '3',
                mintingTxHash: 'e060123954173a99fda64bb302023d8b0426709ad064aaa410d1faa3e2eb4403',
                mintCount: 3
              }
            )
        console.log("TxHash : " + txHash);
  } 
  main();
  