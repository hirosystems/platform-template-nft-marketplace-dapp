import { isDevnetEnvironment, isTestnetEnvironment } from "@/lib/use-network";
import { Network } from "@/lib/network";
export const getNftContractAddress = (network: Network) => {
  if (isDevnetEnvironment(network)) {
    return process.env.NEXT_PUBLIC_DEPLOYER_ACCOUNT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  }
  if (isTestnetEnvironment(network)) {
    // return 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    return 'ST2CEP848SACBBX7KHVC4TBZXBV0JH6SC0WF439NF'
  }
  // Mainnet address (never used)
  return 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
};

export const getNftContract = (network: Network) => {
  return {
    contractAddress: getNftContractAddress(network),
    contractName: "funny-dog",
  } as const;
};

export const getMarketplaceContractAddress = (network: Network) => {
  if (isDevnetEnvironment(network)) {
    return process.env.NEXT_PUBLIC_DEPLOYER_ACCOUNT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  }
  if (isTestnetEnvironment(network)) {
    return 'ST2CEP848SACBBX7KHVC4TBZXBV0JH6SC0WF439NF';
  }
  // Mainnet address (never used)
  return 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
};

export const getMarketplaceContract = (network: Network) => {
  return {
    contractAddress: getMarketplaceContractAddress(network),
    // contractName: "marketplace",
    contractName: "nft-marketplace-1",
  } as const;
};
