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

export const getApi = (stacksApiUrl: string, headers?: HTTPHeaders) => {
  const config = createConfig(stacksApiUrl, headers);
  return apiClients(config);
}; 