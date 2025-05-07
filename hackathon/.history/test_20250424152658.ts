import axios from 'axios';
import {
    blockchainProvider,
} from './adapter';
import { deserializeDatum, hexToString } from '@meshsdk/core';

// Blockfrost API configuration
const BLOCKFROST_API_KEY = 'preprod2DQWsQjqnzLW9swoBQujfKBIFyYILBiL';
const BLOCKFROST_BASE_URL = 'https://cardano-preprod.blockfrost.io/api/v0';

/**
 * Fetches transaction UTXOs from Blockfrost API
 * @param txHash Transaction hash
 * @returns UTXOs associated with the transaction
 */
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

/**
 * Tries to process a UTXO at a specific index to extract voting data
 */
function tryProcessUtxo(txs, index) {
  if (index >= txs.length) {
    throw new Error(`Not enough UTXOs to try index ${index}`);
  }
  
  const txx = txs[index];
  if (!txx.output.plutusData) {
    throw new Error(`No plutus data in txs[${index}]`);
  }
  
  const datum = deserializeDatum(txx.output.plutusData);
  const sayVote = datum.fields[1].bytes;
  const say = hexToString(sayVote);
  return say;
}

async function main() {
  // Script addresses to filter out
  const contributionScriptAddr = "addr_test1wpjqgeeaatmfee304p9e9a3t24pej3ef2xws7lucphscg0gvckan9";
  const votingScriptAddr = "addr_test1wqkjgp3egxehpwgh0k0hfp66yypx7qqvsm2535ss5v424ms4chhyv";
  
  const filteredAddresses = [
    contributionScriptAddr,
    votingScriptAddr
  ];
  
  console.log("=== COLLECTING CONTRIBUTION DATA ===");
  
  // Step 1: Collect contribution data
  const contributionTxs = await blockchainProvider.fetchAddressTransactions(contributionScriptAddr);
  const contributionTxHashes = contributionTxs.map((tx) => tx.hash);
  
  let addressAmountPairs: [string, number][] = []; 
  
  for (const txHash of contributionTxHashes) {
    try {
      const tx = await fetchTxUtxos(txHash);
      if (tx && tx.inputs && tx.inputs.length > 0) {
        const address = tx.inputs[0].address;
        
        // Skip script addresses
        if (filteredAddresses.includes(address)) {
          continue;
        }
        
        const txs = await blockchainProvider.fetchUTxOs(txHash);
        const txx = txs[0];
        
        if (!txx.output.plutusData) {
          console.log(`No plutus data in transaction ${txHash}`);
          continue;
        }
        
        const datum = deserializeDatum(txx.output.plutusData);
        const lovelaceAmount = datum.fields[0].int;
        
        addressAmountPairs.push([address, lovelaceAmount]);
      }
    } catch (error) {
      console.error(`Error processing contribution transaction ${txHash}:`, error);
    }
  }
  
  // Group contributions by address and sum amounts
  const contributionsByAddress = new Map<string, number>();
  addressAmountPairs.forEach(pair => {
    const [address, amount] = pair;
    const currentTotal = contributionsByAddress.get(address) || 0;
    contributionsByAddress.set(address, currentTotal + amount);
  });
  
  // Calculate total contribution amount
  const totalContributionAmount = Array.from(contributionsByAddress.values()).reduce((sum, amount) => sum + amount, 0);
  
  console.log(`Total contribution amount: ${totalContributionAmount} lovelace (${totalContributionAmount / 1000000} ADA)`);
  
  console.log("\n=== COLLECTING VOTING DATA ===");
  
  // Step 2: Collect voting data
  const voteTxs = await blockchainProvider.fetchAddressTransactions(votingScriptAddr);
  const voteTxHashes = voteTxs.map((tx) => tx.hash);
  
  const latestVotes = new Map<string, string>();
  
  for(const txHash of voteTxHashes) {
    try {
      let tx = await fetchTxUtxos(txHash);
      let address;
      
      if(tx.inputs[0].address === votingScriptAddr) {
        address = tx.inputs[1].address;
      } else {
        address = tx.inputs[0].address;
      }
      
      // Skip filtered addresses
      if (filteredAddresses.includes(address)) {
        continue;
      }
      
      // Fetch UTXOs for this transaction
      let utxos = await blockchainProvider.fetchUTxOs(txHash);
      
      // Try each index in sequence
      const indicesToTry = [0, 1, 2];
      let success = false;

      for (const index of indicesToTry) {
        try {
          const vote = tryProcessUtxo(utxos, index);
          console.log(`Address ${address} voted: ${vote} (from txs[${index}])`);
          
          // Store this as the latest vote for this address
          latestVotes.set(address, vote.toLowerCase());
          
          success = true;
          break; // Exit the loop if successful
        } catch (error) {
          // Continue to the next index
        }
      }
    } catch (error) {
      console.error(`Error processing vote transaction ${txHash}:`, error);
    }
  }
  
  console.log("\n=== CALCULATING WEIGHTED VOTES ===");
  
  // Step 3: Calculate weighted votes
  let yesAmount = 0;
  let noAmount = 0;
  let undecidedAmount = 0;
  
  const weightedVotes = new Map<string, {vote: string, amount: number, weight: number}>();
  
  // Process all contributors, with or without votes
  for (const [address, contributionAmount] of contributionsByAddress.entries()) {
    const vote = latestVotes.get(address) || "no vote";
    const weight = (contributionAmount / totalContributionAmount) * 100;
    
    weightedVotes.set(address, {
      vote,
      amount: contributionAmount,
      weight
    });
    
    if (vote.includes("yes")) {
      yesAmount += contributionAmount;
    } else if (vote.includes("no")) {
      noAmount += contributionAmount;
    } else {
      undecidedAmount += contributionAmount;
    }
  }
  
  // Calculate percentages
  const yesPercentage = (yesAmount / totalContributionAmount) * 100;
  const noPercentage = (noAmount / totalContributionAmount) * 100;
  const undecidedPercentage = (undecidedAmount / totalContributionAmount) * 100;
  
  // Display results
  console.log("\n=== WEIGHTED VOTING RESULTS ===");
  console.log(`Total contributors: ${contributionsByAddress.size}`);
  console.log(`Total contribution amount: ${totalContributionAmount} lovelace (${totalContributionAmount / 1000000} ADA)`);
  console.log(`\nYES votes weight: ${yesPercentage.toFixed(2)}% (${yesAmount} lovelace)`);
  console.log(`NO votes weight: ${noPercentage.toFixed(2)}% (${noAmount} lovelace)`);
  console.log(`Undecided weight: ${undecidedPercentage.toFixed(2)}% (${undecidedAmount} lovelace)`);
  
  // Determine if proposal passes (yes > 50% of total weight)
  const proposalStatus = yesPercentage > 50 ? "PASSED" : "FAILED";
  console.log(`\nProposal status: ${proposalStatus}`);
  
  // Display detailed breakdown of votes by contributor
  console.log("\n=== DETAILED VOTE BREAKDOWN ===");
  console.log("Address                             | Contribution | Weight %  | Vote");
  console.log("-----------------------------------|-------------|----------|------");
  
  // Sort by contribution amount (highest first)
  const sortedWeightedVotes = Array.from(weightedVotes.entries())
    .sort((a, b) => b[1].amount - a[1].amount);
  
  for (const [address, data] of sortedWeightedVotes) {
    const shortAddr = `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
    const formattedAmount = `${data.amount} (${(data.amount / 1000000).toFixed(2)} ADA)`;
    console.log(`${shortAddr} | ${formattedAmount.padEnd(13)} | ${data.weight.toFixed(2).padEnd(8)}% | ${data.vote}`);
  }
}

main();