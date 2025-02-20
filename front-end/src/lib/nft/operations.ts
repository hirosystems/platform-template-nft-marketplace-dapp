import { PostConditionMode, principalCV } from '@stacks/transactions';
import { getNftContract } from '@/constants/contracts';
import { Network } from '@/lib/network';
export const mintFunnyDogNFT = async (
  network: Network | null,
  recipientAddress: string
): Promise<string> => {
  if (!network) throw new Error('Network is required');
  const { openContractCall } = await import('@stacks/connect');
  const recipient = principalCV(recipientAddress);
  const functionArgs = [recipient];
  const contract = getNftContract(network);

  return new Promise((resolve, reject) => {
    const options = {
      ...contract,
      network,
      anchorMode: 1,
      functionName: 'mint',
      functionArgs,
      postConditionMode: PostConditionMode.Deny,
      postConditions: [],
      onFinish: (data: any) => {
        console.log('Minting finished:', data);
        resolve(data.txId);
      },
      onCancel: () => {
        reject(new Error('User cancelled the transaction'));
      },
    };

    console.log('options', options);
    openContractCall(options).catch(reject);
  });
};
