import { STACKS_TESTNET, StacksNetwork } from '@stacks/network';

// platform api domain
export const PLATFORM_API_DOMAIN = 'https://api.platform.hiro.so';

export const DEVNET_STACKS_BLOCKCHAIN_API_URL_PLATFORM = `${PLATFORM_API_DOMAIN}/v1/ext/${process.env.NEXT_PUBLIC_PLATFORM_HIRO_API_KEY}/stacks-blockchain-api`;
export const DEVNET_STACKS_BLOCKCHAIN_API_URL_LOCAL = `http://localhost:3999`;
export const DEVNET_STACKS_BLOCKCHAIN_API_URL =
  process.env.NEXT_PUBLIC_DEVNET_HOST === 'platform'
    ? DEVNET_STACKS_BLOCKCHAIN_API_URL_PLATFORM
    : DEVNET_STACKS_BLOCKCHAIN_API_URL_LOCAL;

export const DEVNET_NETWORK: StacksNetwork = {
  ...STACKS_TESTNET,
  client: { baseUrl: DEVNET_STACKS_BLOCKCHAIN_API_URL },
};
