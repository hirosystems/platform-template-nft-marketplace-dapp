import { DEVNET_NETWORK } from '@/constants/devnet';
import { ContractCallRegularOptions, FinishedTxData, request } from '@stacks/connect';

import {
  makeContractCall,
  broadcastTransaction,
  SignedContractCallOptions,
  ClarityValue,
  PostCondition,
  PostConditionMode,
} from '@stacks/transactions';
import { generateWallet } from '@stacks/wallet-sdk';
import { DevnetWallet } from './devnet-wallet-context';
import { isDevnetEnvironment } from './use-network';
import { TransactionResult } from '@stacks/connect/dist/types/methods';

interface DirectCallResponse {
  txid: string;
}

export const shouldUseDirectCall = isDevnetEnvironment;

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
    network: contractCallTxOptions.network,
  });

  if ('error' in response) {
    throw new Error(response.error || 'Transaction failed');
  }

  return { txid: response.txid };
};

export const openContractCall = async (options: ContractCallRegularOptions) => {
  try {
    const contract = `${options.contractAddress}.${options.contractName}`;
    const params: any = {
      contract,
      functionName: options.functionName,
      functionArgs: options.functionArgs,
      network:
        typeof options.network === 'object'
          ? 'chainId' in options.network
            ? options.network.chainId === 1
              ? 'mainnet'
              : 'testnet'
            : options.network
          : options.network,
      postConditions: options.postConditions,
      postConditionMode: options.postConditionMode === PostConditionMode.Allow ? 'allow' : 'deny',
      sponsored: options.sponsored,
    };

    const result: TransactionResult = await request({}, 'stx_callContract', params);

    if (options.onFinish) {
      options.onFinish(result as FinishedTxData);
    }

    return result;
  } catch (error: unknown) {
    console.error('Failed to execute contract call:', error);
    if (error instanceof Error && error.message?.includes('cancelled') && options.onCancel) {
      options.onCancel();
    }
    throw error;
  }
};
