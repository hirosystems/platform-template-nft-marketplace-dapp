export const MARKETPLACE_CONTRACT = {
  address: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  name: "nft-marketplace"
} as const;

export const getContractIdentifier = () => {
  return `${MARKETPLACE_CONTRACT.address}.${MARKETPLACE_CONTRACT.name}`;
}; 