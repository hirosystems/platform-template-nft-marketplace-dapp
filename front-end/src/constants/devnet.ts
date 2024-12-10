import { STACKS_TESTNET, StacksNetwork } from "@stacks/network";

export const DEVNET_STACKS_BLOCKCHAIN_API_URL = `https://api.platform.${
  process.env.NEXT_PUBLIC_PLATFORM_ENV
    ? `${process.env.NEXT_PUBLIC_PLATFORM_ENV}.`
    : ""
}hiro.so/v1/ext/${
  process.env.NEXT_PUBLIC_PLATFORM_HIRO_API_KEY
}/stacks-blockchain-api`;
// export const DEVNET_STACKS_BLOCKCHAIN_API_URL = `http://localhost:3999`;

export const DEVNET_NETWORK: StacksNetwork = {
  ...STACKS_TESTNET,
  client: { baseUrl: DEVNET_STACKS_BLOCKCHAIN_API_URL },
};
