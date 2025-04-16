import { PostConditionMode, principalCV } from '@stacks/transactions';
import { getNftContract } from '@/constants/contracts';
import { Network } from '@/lib/network';
import { ContractCallRegularOptions } from '@stacks/connect';

export const mintFunnyDogNFT = (
  network: Network,
  recipientAddress: string
): ContractCallRegularOptions => {
  const recipient = principalCV(recipientAddress);
  const functionArgs = [recipient];
  const contract = getNftContract(network);

  return {
    ...contract,
    network,
    anchorMode: 1,
    functionName: 'mint',
    functionArgs,
    postConditionMode: PostConditionMode.Deny,
    postConditions: [],
  };
};
