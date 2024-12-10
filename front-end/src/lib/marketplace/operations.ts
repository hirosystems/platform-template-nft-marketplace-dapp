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
  cvToValue,
  fetchCallReadOnlyFunction,
  cvToJSON,
  deserializeCV,
  cvToString,
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

export interface ReadOnlyResponse {
  okay: boolean;
  result: string;
}

export const parseReadOnlyResponse = ({ result }: ReadOnlyResponse) => {
  const hex = result.slice(2);
  const bufferCv = Buffer.from(hex, 'hex');
  const clarityValue = deserializeCV(bufferCv);
  return cvToString(clarityValue);
};


export const fetchListings = async (maxId: number = 10): Promise<Listing[]> => {
  const listings: Listing[] = [];

  for (let currentId = 0; currentId <= maxId; currentId++) {
    try {
      const response = await fetchCallReadOnlyFunction({
        ...baseContractCall,
        functionName: 'get-listing',
        functionArgs: [uintCV(currentId)],
        senderAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        client: { baseUrl: 'http://localhost:3999' },
      });
      console.log('Response:', response);

      const result = cvToValue(response)
      const value = result.value

      if (result) {
        listings.push({
          id: currentId,
          maker: value.maker.value,
          taker: value.taker?.value || null,
          tokenId: value['token-id'].value,
          nftAssetContract: value['nft-asset-contract'].value,
          price: value.price.value,
          expiry: value.expiry.value,
          paymentAssetContract: value['payment-asset-contract']?.value || null,
        });
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
      break;
    }
  }

  return listings;
};
