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
  wallet: any, 
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
          .txInRedeemerValue({
            alternative: 0,
            fields: [
              { bytes: stringToHex("ExportMoney") }
            ]
          }, {
            mem: 7000000,
            steps: 3000000000,
            charAt: function (pos: number): string {
              throw new Error("Function not implemented.");
            },
            charCodeAt: function (index: number): number {
              throw new Error("Function not implemented.");
            },
            concat: function (...strings: string[]): string {
              throw new Error("Function not implemented.");
            },
            indexOf: function (searchString: string, position?: number): number {
              throw new Error("Function not implemented.");
            },
            lastIndexOf: function (searchString: string, position?: number): number {
              throw new Error("Function not implemented.");
            },
            localeCompare: function (that: string): number {
              throw new Error("Function not implemented.");
            },
            match: function (regexp: string | RegExp): RegExpMatchArray | null {
              throw new Error("Function not implemented.");
            },
            replace: function (searchValue: string | RegExp, replaceValue: string): string {
              throw new Error("Function not implemented.");
            },
            search: function (regexp: string | RegExp): number {
              throw new Error("Function not implemented.");
            },
            slice: function (start?: number, end?: number): string {
              throw new Error("Function not implemented.");
            },
            split: function (separator: string | RegExp, limit?: number): string[] {
              throw new Error("Function not implemented.");
            },
            substring: function (start: number, end?: number): string {
              throw new Error("Function not implemented.");
            },
            toLowerCase: function (): string {
              throw new Error("Function not implemented.");
            },
            toLocaleLowerCase: function (locales?: string | string[]): string {
              throw new Error("Function not implemented.");
            },
            toUpperCase: function (): string {
              throw new Error("Function not implemented.");
            },
            toLocaleUpperCase: function (locales?: string | string[]): string {
              throw new Error("Function not implemented.");
            },
            trim: function (): string {
              throw new Error("Function not implemented.");
            },
            length: 0,
            substr: function (from: number, length?: number): string {
              throw new Error("Function not implemented.");
            },
            codePointAt: function (pos: number): number | undefined {
              throw new Error("Function not implemented.");
            },
            includes: function (searchString: string, position?: number): boolean {
              throw new Error("Function not implemented.");
            },
            endsWith: function (searchString: string, endPosition?: number): boolean {
              throw new Error("Function not implemented.");
            },
            normalize: function (form: "NFC" | "NFD" | "NFKC" | "NFKD"): string {
              throw new Error("Function not implemented.");
            },
            repeat: function (count: number): string {
              throw new Error("Function not implemented.");
            },
            startsWith: function (searchString: string, position?: number): boolean {
              throw new Error("Function not implemented.");
            },
            anchor: function (name: string): string {
              throw new Error("Function not implemented.");
            },
            big: function (): string {
              throw new Error("Function not implemented.");
            },
            blink: function (): string {
              throw new Error("Function not implemented.");
            },
            bold: function (): string {
              throw new Error("Function not implemented.");
            },
            fixed: function (): string {
              throw new Error("Function not implemented.");
            },
            fontcolor: function (color: string): string {
              throw new Error("Function not implemented.");
            },
            fontsize: function (size: number): string {
              throw new Error("Function not implemented.");
            },
            italics: function (): string {
              throw new Error("Function not implemented.");
            },
            link: function (url: string): string {
              throw new Error("Function not implemented.");
            },
            small: function (): string {
              throw new Error("Function not implemented.");
            },
            strike: function (): string {
              throw new Error("Function not implemented.");
            },
            sub: function (): string {
              throw new Error("Function not implemented.");
            },
            sup: function (): string {
              throw new Error("Function not implemented.");
            },
            padStart: function (maxLength: number, fillString?: string): string {
              throw new Error("Function not implemented.");
            },
            padEnd: function (maxLength: number, fillString?: string): string {
              throw new Error("Function not implemented.");
            },
            trimEnd: function (): string {
              throw new Error("Function not implemented.");
            },
            trimStart: function (): string {
              throw new Error("Function not implemented.");
            },
            trimLeft: function (): string {
              throw new Error("Function not implemented.");
            },
            trimRight: function (): string {
              throw new Error("Function not implemented.");
            },
            matchAll: function (regexp: RegExp): RegExpStringIterator<RegExpExecArray> {
              throw new Error("Function not implemented.");
            },
            replaceAll: function (searchValue: string | RegExp, replaceValue: string): string {
              throw new Error("Function not implemented.");
            },
            at: function (index: number): string | undefined {
              throw new Error("Function not implemented.");
            },
            [Symbol.iterator]: function (): StringIterator<string> {
              throw new Error("Function not implemented.");
            }
          })
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
      
      // // Chỉ tạo output cho script nếu còn đủ tiền
      // if (remainingForScript >= 10000000) {
      //   const datum = mConStr0([10000000, pubkeyContributor, pubkeyAdmin]);
      //  await txBuilder.txOut(
      //     scriptAddr,
      //     [{
      //       unit: "lovelace",
      //       quantity: "10000000",
      //     }]
      //   )
      //   .txOutInlineDatumValue(datum);
      // }
      
      // Hoàn thiện giao dịch
     await  txBuilder
        .changeAddress(walletAddress)
        .requiredSignerHash(pubkeyContributor)
      //  .requiredSignerHash(pubkeyAdmin)
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
  const txhash = "5944c4f30fa3a75827a5d74341855a9d4d4f16552330f9140805c079f75b70f3";
  const scriptAddr = "addr_test1wppy3p3lgjewmsaevfnr05nk95w68cvmws2fq29nfrzluzq45ezwd";
  const scriptCbor = "5901a35901a00101003333333332323232323223225333004323232323253330093370e900118051baa0011323232533300c3370e900018069baa00513232533301130130021533300e3370e900018079baa0031323232323253330133371e91010b4578706f72744d6f6e657900375c602e602a6ea80304c94ccc0514ccc05000840045280a5110033371e6eb8c05cc060c060c054dd50028088b19801001808198008011bae301530163013375400644646600200200644a66602e00229404c94ccc054cdc79bae301900200414a226600600600260320026eb0c04cc050c050c050c050c050c050c050c050c044dd5005180918081baa0031616375c6022002601c6ea801458c03cc040008c038004c02cdd50008b1806180680118058009805801180480098031baa00114984d958dd7000ab9a5573aaae7955cfaba157449811e581c1d6eb334cd741cfd048311ad99f05d0575e7c89f8b01c3103b98a006004c0108474578616d706c65004c0102184b004c0109486d616a6f72697479004c010948456c696769626c65004c01010a004c01031903e8004c0107467075626c69630001"
  const amount = 30000000;
  const addrReceiver = "addr_test1qqwkave5e46pelgysvg6mx0st5zhte7gn79srscs8wv2qp5qkfvca3f7kpx3v3rssm4j97f63v5whrj8yvsx6dac9xrqyqqef6";
  const admin = "addr_test1qqwkave5e46pelgysvg6mx0st5zhte7gn79srscs8wv2qp5qkfvca3f7kpx3v3rssm4j97f63v5whrj8yvsx6dac9xrqyqqef6";
  const tx = await exportMoney(
    [txhash],
    wallet,
    amount,
    scriptAddr,
    scriptCbor,
    addrReceiver,
    admin
  );


}
main();