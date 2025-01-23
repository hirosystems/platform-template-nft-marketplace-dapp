import { devnetWallets } from "@/lib/devnet-wallet-context";

export const MARKETPLACE_CONTRACT = {
  address: devnetWallets[0].stxAddress,
  name: "nft-marketplace"
} as const;

export const getContractIdentifier = () => {
  return `${MARKETPLACE_CONTRACT.address}.${MARKETPLACE_CONTRACT.name}`;
}; 
