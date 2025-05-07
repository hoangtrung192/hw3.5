
import axios from 'axios';
import { deserializeDatum, hexToString } from '@meshsdk/core';
import {blockchainProvider}from "../hackathon/adapter";
// Blockfrost API configuration
const BLOCKFROST_API_KEY = 'preprod2DQWsQjqnzLW9swoBQujfKBIFyYILBiL';
const BLOCKFROST_BASE_URL = 'https://cardano-preprod.blockfrost.io/api/v0';


export async function fetchTxUtxos(txHash: string) {
    try {
      const response = await axios.get(`${BLOCKFROST_BASE_URL}/txs/${txHash}/utxos`, {
        headers: {
          'project_id': BLOCKFROST_API_KEY
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Blockfrost API Error:', error.response?.data || error.message);
      } else {
        console.error('Error fetching UTXOs:', error);
      }
      throw error;
    }
  }
  
async function main(){
   const a = await blcok
}
main();