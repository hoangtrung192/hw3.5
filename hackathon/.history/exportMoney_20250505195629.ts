import {
  Asset,
  deserializeAddress,
  deserializeDatum,
  mConStr0,
  mConStr1,
  MeshTxBuilder,
  MeshValue,
  pubKeyAddress,
  pubKeyHash,
  signData,
  SLOT_CONFIG_NETWORK,
  unixTimeToEnclosingSlot,
  UTxO,
  Transaction,
  slotToBeginUnixTime,
  scriptAddress,
  applyParamsToScript,
  serializePlutusScript,
  stringToHex,
} from "@meshsdk/core";
import { MeshVestingContract, VestingDatum } from "@meshsdk/contract";
import {
  blockchainProvider,
  readValidator,
  getTxBuilder,
  getUtxoByTxHash,
  getWalletInfoForTx,
  wallet,
} from "./adapter";
async function exportMoney(txHash: string[], amount, scriptAddr: string,
  contributeScriptCbor: string, addrReceiver: string, admin: string

) {

}
async function main(){

}
main()