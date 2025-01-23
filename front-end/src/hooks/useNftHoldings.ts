import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { NonFungibleTokenHoldingsList } from '@stacks/stacks-blockchain-api-types';
import { TransactionsApi } from '@stacks/blockchain-api-client';
import { getApi } from '@/lib/stacks-api';
import { DEVNET_STACKS_BLOCKCHAIN_API_URL } from '@/constants/devnet';

// Custom hook to fetch NFT holdings for a given address
export const useNftHoldings = (
  address?: string,
): UseQueryResult<NonFungibleTokenHoldingsList> => {
  const api = getApi(DEVNET_STACKS_BLOCKCHAIN_API_URL).nonFungibleTokensApi;
  return useQuery<NonFungibleTokenHoldingsList>({
    queryKey: ['nftHoldings', address],
    queryFn: async () => {
      if (!address) throw new Error('Address is required');
      const response = await api.getNftHoldings({
        principal: address,
        limit: 200,
      });
      return response as unknown as NonFungibleTokenHoldingsList;
    },
    enabled: !!address,
    retry: false,
  });
};

// Continuously query a transaction by txId until it is confirmed
export const useGetTxId = (api: TransactionsApi, txId: string) => {
  return useQuery({
    queryKey: ['nftHoldingsByTxId', txId],
    queryFn: async () => {
      if (!txId) throw new Error('txId is required');
      return api.getTransactionById({ txId });
    },
    enabled: !!txId,
    refetchInterval: (data) => {
      // @ts-expect-error
      return data?.tx_status === "pending" ? 5000 : false;
    },
    retry: false,
    refetchIntervalInBackground: true,
  });
};