import {BrowserWallet,Transaction, Wallet, BlockfrostProvider, MeshTxBuilder, WalletStaticMethods }
 from "@meshsdk/core";
//import nha cung cap blockfrost va txBuilder(1 api cap thap xay dung giao dich)

//khoi tao nha cung cap voi id cua du an
const blockchainProvider = new BlockfrostProvider("previewHZApug3UnrJRVchVYzOu57hKu8PucW5o");
//hàm chuyển tiền
async function sendFund(owner: string, beneficiary_addr: string, money: string) {
    //chon vi
    const wallet = BrowserWallet.enable('eternl');
    (await wallet).getBalance();
    
}

//npx tsx conduct_transation.ts run code
