import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { NonFungibleTokenHoldingsList } from '@stacks/stacks-blockchain-api-types';
import { TransactionsApi } from '@stacks/blockchain-api-client';
import { getApi } from '@/lib/stacks-api';
import { useNetwork } from '@/lib/use-network';

// Custom hook to fetch NFT holdings for a given address
export const useNftHoldings = (address?: string): UseQueryResult<NonFungibleTokenHoldingsList> => {
  const network = useNetwork();

  return useQuery<NonFungibleTokenHoldingsList>({
    queryKey: ['nftHoldings', address],
    queryFn: async () => {
      if (!address) throw new Error('Address is required');
      if (!network) throw new Error('Network is required');
      const api = getApi(network).nonFungibleTokensApi;
      const response = await api.getNftHoldings({
        principal: address,
        limit: 200,
      });
      return response as unknown as NonFungibleTokenHoldingsList;
    },
    enabled: !!address && !!network,
    retry: false,
    // Refetch every 10 seconds and whenever the window regains focus
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });
};

// Continuously query a transaction by txId until it is confirmed
export const useGetTxId = (txId: string) => {
  const network = useNetwork();
  return useQuery({
    queryKey: ['nftHoldingsByTxId', txId],
    queryFn: async () => {
      if (!txId) throw new Error('txId is required');
      if (!network) throw new Error('Network is required');
      const api = getApi(network).transactionsApi;
      return api.getTransactionById({ txId });
    },
    enabled: !!txId && !!network,
    refetchInterval: (data) => {
      // @ts-expect-error
      return data?.tx_status === 'pending' ? 5000 : false;
    },
    retry: false,
    refetchIntervalInBackground: true,
  });
};
