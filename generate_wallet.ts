import { generateMnemonic, MeshWallet } from '@meshsdk/core';
//nhap module fs cua nodejs de thao tac voi cac tep tin
import fs from 'node:fs';

//tao nhung cum tu bi mat 
 const secret = MeshWallet.brew(true) as string;
 //viet vao file me.sk
 fs.writeFileSync('me.sk', secret);
 //sau khi tao xong thi lay dia chi cua vi do
 const wallet = new MeshWallet({
    networkId: 0,
    key: {
        type: 'mnemonic',
        words: [secret],
    },
 });
 //lay dia chi vi tu nhung cum tu bi mat
 const addr = wallet.getChangeAddress();
 fs.writeFileSync('me.addr', addr);
 console.log("Dia chi vi : ", addr);
 //npx tsx generate_wallet.ts
