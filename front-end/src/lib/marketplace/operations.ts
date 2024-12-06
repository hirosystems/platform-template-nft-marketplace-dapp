import { ContractCallRegularOptions } from '@stacks/connect';
import { 
  AnchorMode, 
  PostConditionMode,
  uintCV,
  principalCV,
  someCV,
  noneCV,
  contractPrincipalCV,
  tupleCV,
} from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import { MARKETPLACE_CONTRACT } from '@/constants/marketplace';

const baseContractCall = {
  network: STACKS_TESTNET,
  anchorMode: AnchorMode.Any,
  contractAddress: MARKETPLACE_CONTRACT.address,
  contractName: MARKETPLACE_CONTRACT.name,
  postConditionMode: PostConditionMode.Deny,
};

export interface ListAssetParams {
  nftContractAddress: string;
  nftContractName: string;
  tokenId: number;
  price: number;
  expiry: number;
  intendedTaker?: string;
}

export const listAsset = (params: ListAssetParams): ContractCallRegularOptions => {
  const nftAsset = {
    'token-id': uintCV(params.tokenId),
    'price': uintCV(params.price),
    'expiry': uintCV(params.expiry),
    'taker': params.intendedTaker ? someCV(principalCV(params.intendedTaker)) : noneCV(),
    'payment-asset-contract': noneCV(),
  };

  return {
    ...baseContractCall,
    functionName: 'list-asset',
    functionArgs: [
      contractPrincipalCV(params.nftContractAddress, params.nftContractName),
      tupleCV(nftAsset)
    ],
  };
};

export const cancelListing = async (
  listingId: number, 
  nftContract: string
): Promise<ContractCallRegularOptions> => {
  return {
    ...baseContractCall,
    functionName: 'cancel-listing',
    functionArgs: [
      uintCV(listingId),
      contractPrincipalCV(nftContract, 'nft-trait')
    ],
  };
};

export const contractToPrincipalCV = (contract: string) => {
  return contractPrincipalCV(contract.split('.')[0], contract.split('.')[1])
}

export const purchaseListingStx = async (
  listingId: number,
  nftContract: string
): Promise<ContractCallRegularOptions> => {
  return {
    ...baseContractCall,
    functionName: 'fulfil-listing-stx',
    functionArgs: [
      uintCV(listingId),
      contractToPrincipalCV(nftContract)
    ],
  };
};

export interface Listing {
  id: number;
  maker: string;
  taker: string | null;
  tokenId: number;
  nftAssetContract: string;
  expiry: number;
  price: number;
  paymentAssetContract: string | null;
}

// Mock data for development - replace with actual API calls later
const mockListings: Listing[] = [
  {
    id: 0,
    maker: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    taker: null,
    tokenId: 1,
    nftAssetContract: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.funny-dog",
    expiry: 100000,
    price: 10,
    paymentAssetContract: null,
  },
  {
    id: 1,
    maker: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    taker: null,
    tokenId: 2,
    nftAssetContract: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.funny-dog",
    expiry: 100000,
    price: 10,
    paymentAssetContract: null,
  },
  {
    id: 2,
    maker: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    taker: null,
    tokenId: 3,
    nftAssetContract: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.funny-dog",
    expiry: 100000,
    price: 10,
    paymentAssetContract: null,
  }

];

export const fetchListings = async (): Promise<Listing[]> => {
  // TODO: Replace with actual API call to your backend or smart contract
  return mockListings;
};
