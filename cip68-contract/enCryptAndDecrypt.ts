// import CryptoJS from "crypto-js";

// function encryptData(data: any, secretKey: string) {
//   if (!data) {
//     console.error("Cannot encrypt empty or undefined data");
//     return "";
//   }
  
//   const encrypted = CryptoJS.AES.encrypt(
//     data,
//     CryptoJS.enc.Utf8.parse(secretKey),
//     {
//       keySize: 128 / 8,
//       iv: CryptoJS.enc.Utf8.parse(secretKey),
//       mode: CryptoJS.mode.CBC,
//       padding: CryptoJS.pad.Pkcs7,
//     }
//   ).toString();
//   return encrypted;
// }

// function decryptData(encryptedData: any, secretKey: string) {
//   try {
//     // Validate input
//     if (!encryptedData) {
//       console.error("Cannot decrypt empty or undefined data");
//       return "";
//     }
    
//     // Handle the encryption format properly
//     const decrypted = CryptoJS.AES.decrypt(
//       encryptedData.toString(),
//       CryptoJS.enc.Utf8.parse(secretKey),
//       {
//         keySize: 128 / 8,
//         iv: CryptoJS.enc.Utf8.parse(secretKey),
//         mode: CryptoJS.mode.CBC,
//         padding: CryptoJS.pad.Pkcs7,
//       }
//     );
    
//     // Safely convert and return the decrypted data
//     try {
//       const originalData = decrypted.toString(CryptoJS.enc.Utf8);
//       return originalData;
//     } catch (parseError) {
//       console.error("Error parsing decrypted data:", parseError);
//       return "";
//     }
//   } catch (error) {
//     console.error("Decryption error:", error);
//     return "";
//   }
// }

// // async function main(){
// //     const data = "D8MT7RMO";
// //     const secretKey = "0000000000000000"; // 16 characters for 128-bit key
// //     const encryptedData = encryptData(data, secretKey);
// //     console.log("Encrypted Data : " , encryptedData);

// //     const decryptedData = decryptData(encryptedData, secretKey);
// //     console.log("Decrypted Data : " , decryptedData);
// // }
// // main();
// export { encryptData, decryptData };
// //npx tsx enCryptAndDecrypt