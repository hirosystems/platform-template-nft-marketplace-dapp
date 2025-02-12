import { isDevnetEnvironment, isTestnetEnvironment } from "@/lib/contract-utils";

const getContractAddress = () => {
  if (isDevnetEnvironment()) {
    return process.env.NEXT_PUBLIC_DEPLOYER_ACCOUNT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  }
  if (isTestnetEnvironment()) {
    return 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  }
  // Mainnet address (never used)
  return 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
};

export const FUNNY_DOG_CONTRACT = {
  address: getContractAddress(),
  name: "funny-dog",
} as const;
