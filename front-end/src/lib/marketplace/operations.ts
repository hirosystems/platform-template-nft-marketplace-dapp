import { ContractCallRegularOptions } from '@/lib/contract-utils';
import {
  AnchorMode,
  PostConditionMode,
  uintCV,
  serializeCV,
  principalCV,
  someCV,
  noneCV,
  contractPrincipalCV,
  tupleCV,
  cvToValue,
  fetchCallReadOnlyFunction,
  deserializeCV,
  cvToString,
  ClarityType,
  ClarityValue,
  TupleCV,
  Pc,
  NonFungiblePostCondition,
  Cl,
  cvToJSON,
  StxPostCondition,
} from '@stacks/transactions';
import { getMarketplaceContract } from '@/constants/contracts';
import { getApi } from '@/lib/stacks-api';
import { Network } from '@/lib/network';
const baseContractCall = {
  anchorMode: AnchorMode.Any,
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

export const listAsset = (network: Network, params: ListAssetParams): ContractCallRegularOptions => {
  const marketplaceContract = getMarketplaceContract(network);
  const nftAsset = {
    'token-id': uintCV(params.tokenId),
    'price': uintCV(params.price),
    'expiry': uintCV(params.expiry),
    'taker': params.intendedTaker ? someCV(principalCV(params.intendedTaker)) : noneCV(),
    'payment-asset-contract': noneCV(),
  };
  console.log('nftAsset', nftAsset);

  return {
    ...baseContractCall,
    ...marketplaceContract,
    network,
    functionName: 'list-asset',
    functionArgs: [
      contractPrincipalCV(params.nftContractAddress, params.nftContractName),
      tupleCV(nftAsset)
    ],
    postConditionMode: PostConditionMode.Allow,
  };
};

export const cancelListing = async (
  network: Network,
  listingId: number,
  nftContract: string
): Promise<ContractCallRegularOptions> => {
  const marketplaceContract = getMarketplaceContract(network);
  const [contractAddress, contractName] = nftContract.split('.');
  return {
    ...baseContractCall,
    ...marketplaceContract,
    functionName: 'cancel-listing',
    postConditionMode: PostConditionMode.Allow,
    functionArgs: [
      uintCV(listingId),
      contractPrincipalCV(contractAddress, contractName)
    ],
  };
};

export const contractToPrincipalCV = (contract: string) => {
  return contractPrincipalCV(contract.split('.')[0], contract.split('.')[1])
}

export const purchaseListingStx = async (
  network: Network,
  currentAddress: string,
  listing: Listing
): Promise<ContractCallRegularOptions> => {
  const marketplaceContract = getMarketplaceContract(network);
  const { id, tokenId, price, nftAssetContract } = listing;
  // Split to follow the type asset: AssetString
  const [contractAddress, contractName] = nftAssetContract.split('.');

  return {
    ...baseContractCall,
    ...marketplaceContract,
    network,
    functionName: 'fulfil-listing-stx',
    functionArgs: [
      uintCV(id),
      contractToPrincipalCV(nftAssetContract)
    ],
    postConditionMode: PostConditionMode.Allow,
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

export interface ReadOnlyResponse {
  okay: boolean;
  result?: string | undefined;
}

export const parseReadOnlyResponse = ({ result }: ReadOnlyResponse) => {
  if (result === undefined) return undefined;
  const hex = result.slice(2);
  const bufferCv = Buffer.from(hex, 'hex');
  const clarityValue = deserializeCV(bufferCv);
  return clarityValue;
};

const parseListing = (listingId: number, cv: ClarityValue): Listing | undefined => {
  // If cv is of type "some", unwrap it to get the underlying tuple
  if (cv.type === "some") {
    cv = cv.value;
  }
  if (cv.type !== ClarityType.Tuple) return undefined;
  const tuple = cv as TupleCV<{
    id?: ClarityValue;
    maker: ClarityValue;
    taker: ClarityValue;
    'token-id': ClarityValue;
    'nft-asset-contract': ClarityValue;
    expiry: ClarityValue;
    price: ClarityValue;
    'payment-asset-contract': ClarityValue;
  }>;

  // const id = tuple.value.id ? Number(cvToString(tuple.value.id)) : Number(cvToString(tuple.value['token-id']));
  const maker = cvToString(tuple.value.maker);
  const taker = cvToString(tuple.value.taker) === 'none' ? null : cvToString(tuple.value.taker);
  const tokenId = Number(cvToValue(tuple.value['token-id']));
  const nftAssetContract = cvToString(tuple.value['nft-asset-contract']);
  const expiry = Number(cvToValue(tuple.value.expiry));
  const price = Number(cvToValue(tuple.value.price));
  const paymentAssetContract = cvToString(tuple.value['payment-asset-contract']) === 'none' ? null : cvToString(tuple.value['payment-asset-contract']);

  return {
    id: listingId,
    maker,
    taker,
    tokenId,
    nftAssetContract,
    expiry,
    price,
    paymentAssetContract
  };
};

const fetchListing = async (network: Network, listingId: number): Promise<Listing | undefined> => {
  const api = getApi(network).smartContractsApi;
  const marketplaceContract = getMarketplaceContract(network);
  try {
    const response = await api.callReadOnlyFunction({
      ...marketplaceContract,
      functionName: 'get-listing',
      readOnlyFunctionArgs: {
        sender: marketplaceContract.contractAddress,
        arguments: [`0x${serializeCV(uintCV(listingId)).toString()}`]
      },
    });

    const clarityValue = parseReadOnlyResponse(response);
    console.log(clarityValue);
    if (!clarityValue) return undefined;
    console.log(cvToString(clarityValue));
    console.log(cvToJSON(clarityValue));
    const listing = parseListing(listingId, clarityValue);
    if (!listing) return undefined;
    console.log(listing);
    return listing;
  } catch (error) {
    console.error(`Error fetching listing ${listingId}:`, error);
    return undefined;
  }
};

export async function fetchListings(network: Network, maxId: number = 10): Promise<Listing[]> {
  const listingPromises = Array.from({ length: maxId }, (_, i) => fetchListing(network, i));
  const listings = await Promise.all(listingPromises);
  return listings.filter((listing): listing is Listing => listing !== undefined);
}
