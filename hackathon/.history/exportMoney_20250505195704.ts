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
  const txHash = "7aa74ae808c58a62b7b401f341c4d36c83227a2aa73cb324893075829125bcd9";
  const amount = 30000000;
  const scriptAddr = ""
}
main();