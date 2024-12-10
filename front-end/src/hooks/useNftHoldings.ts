import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { NonFungibleTokenHoldingsList } from '@stacks/stacks-blockchain-api-types';
import { TransactionsApi } from '@stacks/blockchain-api-client';
import { getApi } from '@/lib/stacks-api';
import { DEVNET_STACKS_BLOCKCHAIN_API_URL } from '@/constants/devnet';

export const useNftHoldings = (
  address?: string,
  options: any = {}
): UseQueryResult<NonFungibleTokenHoldingsList> => {
  const api = getApi(DEVNET_STACKS_BLOCKCHAIN_API_URL).nonFungibleTokensApi;
  return useQuery({
    queryKey: ['nftHoldings', address],
    queryFn: async () => {
      if (!address) throw new Error('Address is required');
      return api.getNftHoldings({
        principal: address,
        limit: 200,
      });
    },
    enabled: !!address,
    ...options,
  });
};

// query given a txId fetched until it's confirmed
export const useGetTxId = (api: TransactionsApi, txId: string) => {
  return useQuery({
    queryKey: ['nftHoldingsByTxId', txId],
    queryFn: async () => {
      if (!txId) throw new Error('txId is required');
      return api.getTransactionById({ txId });
    },
    enabled: !!txId,
    refetchInterval: (data) => {
      // @ts-ignore
      return data?.tx_status === "pending" ? 5000 : false;
    },
    refetchIntervalInBackground: true,
  });
};