import {
  deserializeAddress,
  mConStr0,
  stringToHex,
  BrowserWallet,
  deserializeDatum
} from "@meshsdk/core";
import {
  blockchainProvider,
  getWalletInfoForTx,
  getTxBuilder,
} from "./adapter";

export async function exportMoney(
  txHash: string[],
  wallet: BrowserWallet, 
  amount: number,
  scriptAddr: string,
  constributeScriptCbor: string,
  addrReceiver: string,
  admin: string
  ){
    try {
      const {utxos, walletAddress, collateral} = await getWalletInfoForTx(wallet);
      const pubkeyContributor = deserializeAddress(walletAddress).pubKeyHash;
      const pubkeyAdmin = deserializeAddress(admin).pubKeyHash;
      const txBuilder = getTxBuilder();
      
      // Đây là tổng số tiền từ các UTXOs script mà chúng ta sẽ tiêu
      let scriptInputTotal = 0;
      
      // Thiết lập collateral trước khi xử lý các đầu vào script
      txBuilder.txInCollateral(
        collateral.input.txHash,
        collateral.input.outputIndex,
        collateral.output.amount,
        collateral.output.address
      );
      
      // Xử lý tất cả các UTXOs script
      for(const tx of txHash){
        const scriptUtxo = (await blockchainProvider.fetchUTxOs(tx))[0];
        
        if (!scriptUtxo.output.plutusData) 
          throw new Error('Plutus data not found');
        
        // Lấy số tiền từ datum
        const datumfetch = deserializeDatum(scriptUtxo.output.plutusData!);
        const amountfetch = Number(datumfetch.fields[0].int);
        scriptInputTotal += amountfetch;
        console.log("UTXO amount:", amountfetch);
        
        // Thêm đầu vào script với định dạng redeemer đúng
       await  txBuilder
          .spendingPlutusScriptV3()
          .txIn(
            scriptUtxo.input.txHash,
            scriptUtxo.input.outputIndex,
            scriptUtxo.output.amount,
            scriptAddr
          )
          .txInInlineDatumPresent()
          .txInRedeemerValue(mConStr0([stringToHex("ExportMoney")]))
          .txInScript(constributeScriptCbor);
      }
      
      console.log("Tổng số tiền từ script UTXOs:", scriptInputTotal);
      console.log("Số tiền cần chuyển:", amount);
      
      // Tính toán số tiền còn lại để gửi trở lại script (nếu có)
      const remainingForScript = scriptInputTotal - amount;
      console.log("Số tiền còn lại cho script:", remainingForScript);
      
      // Thêm output cho người nhận
      await txBuilder.txOut(
        addrReceiver,
        [{
          unit: "lovelace",
          quantity: amount.toString(),
        }]
      );
      
      // Chỉ tạo output cho script nếu còn đủ tiền
      if (remainingForScript >= 10000000) {
        const datum = mConStr0([10000000, pubkeyContributor, pubkeyAdmin]);
       await txBuilder.txOut(
          scriptAddr,
          [{
            unit: "lovelace",
            quantity: "10000000",
          }]
        )
        .txOutInlineDatumValue(datum);
      }
      
      // Hoàn thiện giao dịch
     await  txBuilder
        .changeAddress(walletAddress)
        .requiredSignerHash(pubkeyContributor)
        .requiredSignerHash(pubkeyAdmin)
        .selectUtxosFrom(utxos)
        .setNetwork("preprod")
        .addUtxosFromSelection();
      console.log(amount);
      const completedTx = await txBuilder.complete();
      const signedTx = await wallet.signTx(completedTx, true);
      const txhash = await wallet.submitTx(signedTx);
      console.log("txhash", txhash);
      return txhash;
    } catch (error) {
      console.error("Error in exportMoney function:", error);
      throw new Error("Error in exportMoney function: " + error);
    }
}

export default exportMoney;
async function main(){
  const txhash = "20001dab62bd2d0f205a95f0b4f97a4693a4a494fceac15026bb2aded9594861";
  
}
main();