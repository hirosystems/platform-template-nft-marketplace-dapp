import { 
  listAsset, 
  cancelListing, 
  purchaseListingStx,
  ListAssetParams 
} from './operations';
import { 
  AnchorMode, 
  PostConditionMode,
  uintCV,
  principalCV,
  someCV,
  noneCV,
  contractPrincipalCV
} from '@stacks/transactions';
import { MARKETPLACE_CONTRACT } from '@/constants/marketplace';

describe('Marketplace Operations', () => {
  const mockNftContract = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  
  describe('listAsset', () => {
    it('should create correct contract call options for listing without taker', async () => {
      const params: ListAssetParams = {
        nftContract: mockNftContract,
        tokenId: 1,
        price: 100,
        expiry: 1000,
      };

      const result = await listAsset(params);

      expect(result).toEqual({
        network: expect.anything(),
        anchorMode: AnchorMode.Any,
        contractAddress: MARKETPLACE_CONTRACT.address,
        contractName: MARKETPLACE_CONTRACT.name,
        functionName: 'list-asset',
        functionArgs: [
          contractPrincipalCV(mockNftContract, 'nft-trait'),
          {
            tokenId: uintCV(1),
            price: uintCV(100),
            expiry: uintCV(1000),
            taker: noneCV(),
            paymentAssetContract: noneCV(),
          }
        ],
        postConditionMode: PostConditionMode.Deny,
      });
    });

    it('should create correct contract call options with intended taker', async () => {
      const params: ListAssetParams = {
        nftContract: mockNftContract,
        tokenId: 1,
        price: 100,
        expiry: 1000,
        intendedTaker: 'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      };

      const result = await listAsset(params);
      expect(result.functionArgs[1].taker).toEqual(
        someCV(principalCV(params.intendedTaker!))
      );
    });
  });

  describe('cancelListing', () => {
    it('should create correct contract call options for cancelling', async () => {
      const result = await cancelListing(1, mockNftContract);

      expect(result).toEqual({
        network: expect.anything(),
        anchorMode: AnchorMode.Any,
        contractAddress: MARKETPLACE_CONTRACT.address,
        contractName: MARKETPLACE_CONTRACT.name,
        functionName: 'cancel-listing',
        functionArgs: [
          uintCV(1),
          contractPrincipalCV(mockNftContract, 'nft-trait')
        ],
        postConditionMode: PostConditionMode.Deny,
      });
    });
  });

  describe('purchaseListingStx', () => {
    it('should create correct contract call options for STX purchase', async () => {
      const result = await purchaseListingStx(1, mockNftContract);

      expect(result).toEqual({
        network: expect.anything(),
        anchorMode: AnchorMode.Any,
        contractAddress: MARKETPLACE_CONTRACT.address,
        contractName: MARKETPLACE_CONTRACT.name,
        functionName: 'fulfil-listing-stx',
        functionArgs: [
          uintCV(1),
          contractPrincipalCV(mockNftContract, 'nft-trait')
        ],
        postConditionMode: PostConditionMode.Deny,
      });
    });
  });
}); 