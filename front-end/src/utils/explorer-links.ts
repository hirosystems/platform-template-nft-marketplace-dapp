import { PLATFORM_API_DOMAIN } from '@/constants/devnet';
import { Network } from '@/lib/network';
import { isDevnetEnvironment } from '@/lib/use-network';

export const getExplorerLink = (txId: string, network: Network | null): string => {
  const baseUrl = 'https://explorer.hiro.so/txid';
  const cleanTxId = txId.replace('0x', '');

  if (isDevnetEnvironment()) {
    return `${baseUrl}/${cleanTxId}?api=https://${PLATFORM_API_DOMAIN}/v1/ext/${process.env.NEXT_PUBLIC_PLATFORM_HIRO_API_KEY}/stacks-blockchain-api`;
  }

  return `${baseUrl}/${cleanTxId}?chain=${network}`;
};
