import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const address1 = accounts.get("wallet_1")!;

describe("nft-marketplace contract", () => {
  it("mints a funny dog NFT for testing", () => {
    // Mint NFT for wallet_1
    const mintResult = simnet.callPublicFn(
      "funny-dog",  // contract name
      "mint",       // function name
      [
        Cl.standardPrincipal(address1)  // recipient
      ],
      address1     // sender
    );

    // Verify mint was successful by checking we got (ok u1)
    expect(mintResult.result).toBeOk(Cl.uint(1));
  });

  it("allows listing an NFT for sale", () => {
    // First whitelist the funny-dog contract
    const whitelistResult = simnet.callPublicFn(
      "nft-marketplace",
      "set-whitelisted",
      [
        Cl.contractPrincipal(deployer, 'funny-dog'),
        Cl.bool(true)
      ],
      deployer  // Only contract owner can whitelist
    );

    expect(whitelistResult.result).toBeOk(Cl.bool(true));

    // Set up test parameters
    const nftId = 1;
    const price = 100;
    const blockHeight = simnet.blockHeight;
    const expiry = blockHeight + 30; // 30 blocks from current height


    // Call the list-asset function
    const listingResult = simnet.callPublicFn(
      "nft-marketplace",
      "list-asset",
      [
        Cl.contractPrincipal(deployer, 'funny-dog'),  // nft-asset-contract
        Cl.tuple({
          'taker': Cl.none(),
          'token-id': Cl.uint(nftId),
          'expiry': Cl.uint(expiry),
          'price': Cl.uint(price),
          'payment-asset-contract': Cl.none()
        })
      ],
      address1
    );


    // Debug: Check if it's an error and what error code
    if (listingResult.result.type === 8) {
      /* Error codes from contract:
        ERR_EXPIRY_IN_PAST (err u1000)
        ERR_PRICE_ZERO (err u1001)
        ERR_UNKNOWN_LISTING (err u2000)
        ERR_UNAUTHORISED (err u2001)
        ERR_LISTING_EXPIRED (err u2002)
        ERR_NFT_ASSET_MISMATCH (err u2003)
        ERR_PAYMENT_ASSET_MISMATCH (err u2004)
        ERR_MAKER_TAKER_EQUAL (err u2005)
        ERR_UNINTENDED_TAKER (err u2006)
        ERR_ASSET_CONTRACT_NOT_WHITELISTED (err u2007)
        ERR_PAYMENT_CONTRACT_NOT_WHITELISTED (err u2008)
      */
    }

    // Verify the listing was successful
    expect(listingResult.result).toBeOk(Cl.uint(1)); // First listing should have ID 1

    // Get the listing details
    const listing = simnet.callReadOnlyFn(
      "nft-marketplace",
      "get-listing",
      [Cl.uint(1)],  // listing ID 1
      address1
    );

    // Verify the listing details
    expect(listing.result).toStrictEqual(Cl.some(Cl.tuple({
      'maker': address1,
      'taker': Cl.none(),
      'token-id': Cl.uint(nftId),
      'nft-asset-contract': Cl.contractPrincipal(deployer, 'funny-dog'),
      'expiry': Cl.uint(expiry),
      'price': Cl.uint(price),
      'payment-asset-contract': Cl.none()
    })));
  });
}); 