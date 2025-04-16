import { DEVNET_STACKS_BLOCKCHAIN_API_URL } from '@/constants/devnet';
import {
  Configuration,
  SmartContractsApi,
  AccountsApi,
  InfoApi,
  TransactionsApi,
  MicroblocksApi,
  BlocksApi,
  FaucetsApi,
  FeesApi,
  SearchApi,
  RosettaApi,
  FungibleTokensApi,
  NonFungibleTokensApi,
  ConfigurationParameters,
} from '@stacks/blockchain-api-client';
import { isDevnetEnvironment, isTestnetEnvironment } from './use-network';
import { Network } from '@/lib/network';
type HTTPHeaders = Record<string, string>;

function createConfig(stacksApiUrl: string, headers?: HTTPHeaders): Configuration {
  const configParams: ConfigurationParameters = {
    basePath: stacksApiUrl,
    headers,
    fetchApi: fetch,
  };
  return new Configuration(configParams);
}

export function apiClients(config: Configuration) {
  const smartContractsApi = new SmartContractsApi(config);
  const accountsApi = new AccountsApi(config);
  const infoApi = new InfoApi(config);
  const transactionsApi = new TransactionsApi(config);
  const microblocksApi = new MicroblocksApi(config);
  const blocksApi = new BlocksApi(config);
  const faucetsApi = new FaucetsApi(config);
  const feesApi = new FeesApi(config);
  const searchApi = new SearchApi(config);
  const rosettaApi = new RosettaApi(config);
  const fungibleTokensApi = new FungibleTokensApi(config);
  const nonFungibleTokensApi = new NonFungibleTokensApi(config);

  return {
    smartContractsApi,
    accountsApi,
    infoApi,
    transactionsApi,
    microblocksApi,
    blocksApi,
    faucetsApi,
    feesApi,
    searchApi,
    rosettaApi,
    fungibleTokensApi,
    nonFungibleTokensApi,
    config,
  };
}

export function getApiUrl(network: Network) {
  if (isDevnetEnvironment()) {
    return DEVNET_STACKS_BLOCKCHAIN_API_URL || 'http://localhost:3999';
  }
  if (isTestnetEnvironment(network)) {
    return 'https://api.testnet.hiro.so';
  }
  return 'https://api.mainnet.hiro.so';
}

export function getApi(network: Network, stacksApiUrl?: string, headers?: HTTPHeaders) {
  const apiUrl = stacksApiUrl || getApiUrl(network);
  const apiKey = process.env.NEXT_PUBLIC_PLATFORM_HIRO_API_KEY || '';
  const apiHeaders = { 'x-api-key': apiKey, ...headers };
  const config = createConfig(apiUrl, apiHeaders);
  return apiClients(config);
}
