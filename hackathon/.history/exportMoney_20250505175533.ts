import {
  deserializeAddress,
  mConStr0,
  stringToHex,
  BrowserWallet,
  deserializeDatum
} from "@meshsdk/core";
import {
  wallet,
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
  const scriptAddr = "addr_test1wppy3p3lgjewmsaevfnr05nk95w68cvmws2fq29nfrzluzq45ezwd";
  const scriptCbor = "5901a35901a00101003333333332323232323223225333004323232323253330093370e900118051baa0011323232533300c3370e900018069baa00513232533301130130021533300e3370e900018079baa0031323232323253330133371e91010b4578706f72744d6f6e657900375c602e602a6ea80304c94ccc0514ccc05000840045280a5110033371e6eb8c05cc060c060c054dd50028088b19801001808198008011bae301530163013375400644646600200200644a66602e00229404c94ccc054cdc79bae301900200414a226600600600260320026eb0c04cc050c050c050c050c050c050c050c050c044dd5005180918081baa0031616375c6022002601c6ea801458c03cc040008c038004c02cdd50008b1806180680118058009805801180480098031baa00114984d958dd7000ab9a5573aaae7955cfaba157449811e581c1d6eb334cd741cfd048311ad99f05d0575e7c89f8b01c3103b98a006004c0108474578616d706c65004c0102184b004c0109486d616a6f72697479004c010948456c696769626c65004c01010a004c01031903e8004c0107467075626c69630001"
  const amount = 10000000;
  const addrReceiver = "addr_test1qqwkave5e46pelgysvg6mx0st5zhte7gn79srscs8wv2qp5qkfvca3f7kpx3v3rssm4j97f63v5whrj8yvsx6dac9xrqyqqef6";
  const admin = "addr_test1qqwkave5e46pelgysvg6mx0st5zhte7gn79srscs8wv2qp5qkfvca3f7kpx3v3rssm4j97f63v5whrj8yvsx6dac9xrqyqqef6";
  


}
main();