import { STACKS_TESTNET, StacksNetwork } from "@stacks/network";

export const DEVNET_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

export const DEVNET_STACKS_BLOCKCHAIN_API_URL = `https://api.platform.hiro.so/v1/ext/${process.env.NEXT_PUBLIC_PLATFORM_HIRO_API_KEY}/stacks-blockchain-api`;

console.log('api', DEVNET_STACKS_BLOCKCHAIN_API_URL)
// export const DEVNET_NETWORK = { ...STACKS_TESTNET, url: DEVNET_STACKS_BLOCKCHAIN_API_URL };
export const DEVNET_NETWORK: StacksNetwork = {
  ...STACKS_TESTNET,
  client: { baseUrl: DEVNET_STACKS_BLOCKCHAIN_API_URL },
};
