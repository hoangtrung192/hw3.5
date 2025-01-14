import { MaestroProvider, MeshWallet } from '@meshsdk/core';
import fs from 'node:fs'
const blockchainProvider = new MaestroProvider({
    network: 'Preview', //network cua vi dang su dung
    apiKey: 'previewHZApug3UnrJRVchVYzOu57hKu8PucW5o', //ten du an cua blockfrost
    turboSubmit: false, //true tăng tốc độ và không thông qua backend kiểm tra và ngược lạilại
});
const wallet = new MeshWallet({
    networkId: 0, // Mạng Cardano: 0 là Testnet (Preview)
    fetcher: blockchainProvider, // Provider để truy vấn blockchain
    submitter: blockchainProvider, // Provider để gửi giao dịch
    key: {
        type: 'mnemonic', // loai 24 ki tu
        words: [
            "heart", "outdoor", "element", "clinic", "mushroom", 
            "clap", "undo", "author", "clip", "upper", "silk", 
            "combine", "trade", "illegal", "ship", "shoe", 
            "woman", "witness", "green", "ketchup", "blame", 
            "choice", "spice", "promote"
        ], // Danh sách các từ mnemonic
    },
});

console.log("Dia chi cua vi : ", wallet.getChangeAddress());
// fs.writeFileSync('owner.addr', wallet.getChangeAddress());
async function main() {
  
    // Lấy danh sách các địa chỉ chưa sử dụng
    const balance =  wallet.getBalance();
    console.log("Số dư ví :  ", balance);
}

main().catch((error) => {
    console.error("Đã xảy ra lỗi:", error);
});
//npx tsx test_provider.ts
