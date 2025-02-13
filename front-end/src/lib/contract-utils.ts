import { networkFromName } from '@stacks/network';
import { DEVNET_NETWORK } from '@/constants/devnet';
import { ContractCallRegularOptions as ContractCallRegularOptionsType } from '@stacks/connect';
import {
  makeContractCall,
  broadcastTransaction,
  SignedContractCallOptions,
  ClarityValue,
  PostCondition,
  PostConditionMode,
  AnchorMode
} from '@stacks/transactions';
import { generateWallet } from '@stacks/wallet-sdk';
import { DevnetWallet } from './devnet-wallet-context';
import { Network } from '@/components/NetworkSelector';
import { isDevnetEnvironment } from './use-network';

export type ContractCallRegularOptions = ContractCallRegularOptionsType;

interface DirectCallResponse {
  txid: string;
}

export const shouldUseDirectCall = isDevnetEnvironment

export const executeContractCall = async (
  txOptions: ContractCallRegularOptions,
  currentWallet: DevnetWallet | null
): Promise<DirectCallResponse> => {
  const mnemonic = currentWallet?.mnemonic;
  if (!mnemonic) throw new Error('Devnet wallet not configured');

  const wallet = await generateWallet({
    secretKey: mnemonic,
    password: 'password',
  });

  const contractCallTxOptions: SignedContractCallOptions = {
    ...txOptions,
    network: DEVNET_NETWORK,
    senderKey: wallet.accounts[0].stxPrivateKey,
    functionArgs: txOptions.functionArgs as ClarityValue[],
    postConditions: txOptions.postConditions as PostCondition[],
    postConditionMode: PostConditionMode.Allow,
    fee: 1000,
  };

  const transaction = await makeContractCall(contractCallTxOptions);

  const response = await broadcastTransaction({
    transaction,
    network: contractCallTxOptions.network
  });

  if ('error' in response) {
    throw new Error(response.error || 'Transaction failed');
  }

  return { txid: response.txid };
};

export const openContractCall = async (options: ContractCallRegularOptions) => {
  try {
    const { openContractCall: stacksOpenContractCall } = await import('@stacks/connect');
    return stacksOpenContractCall(options);
  } catch (error) {
    console.error('Failed to load @stacks/connect:', error);
    throw error;
  }
};