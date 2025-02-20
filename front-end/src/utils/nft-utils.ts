import { getNftContract } from '@/constants/contracts';
import { Network } from '@/lib/network';

export const getPlaceholderImage = (
  network: Network,
  nftAssetContract: string,
  tokenId: number
) => {
  const { contractAddress, contractName } = getNftContract(network);
  if (nftAssetContract === `${contractAddress}.${contractName}`) {
    return `/images/dogs/${tokenId % 12}.webp`;
  }
  return null;
};
