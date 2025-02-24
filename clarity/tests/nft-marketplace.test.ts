import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import { initSimnet } from "@hirosystems/clarinet-sdk";

const simnet = await initSimnet();

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;


describe("nft marketplace", () => {
  it("prevents non-owner from setting whitelist status", async () => {
    // Try to set whitelist status as non-owner (should fail)
    const response = await simnet.callPublicFn(
      "nft-marketplace",
      "set-whitelisted",
      [Cl.principal(deployer), Cl.bool(false)],
      user1
    );
    expect(response.result).toBeErr(Cl.uint(2001)); // ERR_UNAUTHORISED
  });

  describe("listing assets", () => {
    it("allows listing an NFT with valid parameters", async () => {
      // First whitelist the NFT contract
      await simnet.callPublicFn(
        "nft-marketplace",
        "set-whitelisted",
        [Cl.contractPrincipal(deployer, 'funny-dog'), Cl.bool(true)],
        deployer
      );

      // Mint an NFT for the user
      const mintResponse = await simnet.callPublicFn(
        "funny-dog",
        "mint",
        [Cl.principal(user1)],
        deployer
      );
      expect(mintResponse.result).toBeOk(Cl.uint(1));

      // Create listing
      const listingResponse = await createListing(user1);
      expect(listingResponse.result).toBeOk(Cl.uint(0)); // First listing should have ID 0

      // Verify listing details
      const getListing = await simnet.callReadOnlyFn(
        "nft-marketplace",
        "get-listing",
        [Cl.uint(0)],
        user1
      );

      // Check that the listing exists and has correct details
      const listing = getListing.result.value as any;
      expect(listing.data).toBeDefined();
      expect(listing.data.maker).toEqual(Cl.principal(user1));
      expect(listing.data['nft-asset-contract']).toEqual(Cl.contractPrincipal(deployer, 'funny-dog'));
      expect(listing.data['token-id']).toEqual(Cl.uint(1));
      expect(listing.data.expiry.type).toEqual(1); // uint type
      expect(Number(listing.data.expiry.value)).toBeGreaterThan(Number(simnet.blockHeight)); // expiry should be in the future
      expect(listing.data.price).toEqual(Cl.uint(100));
      expect(listing.data.taker.type).toEqual(9); // none type
      expect(listing.data['payment-asset-contract'].type).toEqual(9); // none type
    });

    it("prevents listing with zero price", async () => {
      const response = await createListing(user1, { tokenId: 1, price: 0 });
      expect(response.result).toBeErr(Cl.uint(1001)); // ERR_PRICE_ZERO
    });

    it("prevents listing from non-whitelisted contract", async () => {
      // First set the contract to false in whitelist
      await simnet.callPublicFn(
        "nft-marketplace",
        "set-whitelisted",
        [Cl.contractPrincipal(deployer, 'funny-dog'), Cl.bool(false)],
        deployer
      );

      const response = await createListing(user1);
      expect(response.result).toBeErr(Cl.uint(2007)); // ERR_ASSET_CONTRACT_NOT_WHITELISTED
    });
  });

  describe("canceling listings", () => {
    it("allows maker to cancel their listing", async () => {
      // First whitelist the NFT contract
      await simnet.callPublicFn(
        "nft-marketplace",
        "set-whitelisted",
        [Cl.contractPrincipal(deployer, 'funny-dog'), Cl.bool(true)],
        deployer
      );

      // Mint an NFT for the user
      const mintResponse = await simnet.callPublicFn(
        "funny-dog",
        "mint",
        [Cl.principal(user1)],
        deployer
      );
      expect(mintResponse.result).toBeOk(Cl.uint(1));

      // Create listing
      const listingResponse = await createListing(user1);
      expect(listingResponse.result).toBeOk(Cl.uint(0)); // First listing should have ID 0

      // Cancel the listing
      const cancelResponse = await simnet.callPublicFn(
        "nft-marketplace",
        "cancel-listing",
        [
          Cl.uint(0),
          Cl.contractPrincipal(deployer, 'funny-dog')
        ],
        user1
      );
      expect(cancelResponse.result).toBeOk(Cl.bool(true));

      // Verify listing no longer exists
      const getListing = await simnet.callReadOnlyFn(
        "nft-marketplace",
        "get-listing",
        [Cl.uint(0)],
        user1
      );
      expect(getListing.result).toBeNone();
    });

    it("prevents non-maker from canceling listing", async () => {
      // First whitelist the NFT contract
      await simnet.callPublicFn(
        "nft-marketplace",
        "set-whitelisted",
        [Cl.contractPrincipal(deployer, 'funny-dog'), Cl.bool(true)],
        deployer
      );

      // Mint an NFT for user1
      const mintResponse = await simnet.callPublicFn(
        "funny-dog",
        "mint",
        [Cl.principal(user1)],
        deployer
      );
      expect(mintResponse.result).toBeOk(Cl.uint(1));

      // Create listing as user1
      const listingResponse = await createListing(user1);
      expect(listingResponse.result).toBeOk(Cl.uint(0));

      // Try to cancel the listing as user2
      const cancelResponse = await simnet.callPublicFn(
        "nft-marketplace",
        "cancel-listing",
        [
          Cl.uint(0),
          Cl.contractPrincipal(deployer, 'funny-dog')
        ],
        user2
      );
      expect(cancelResponse.result).toBeErr(Cl.uint(2001)); // ERR_UNAUTHORISED
    });

    it("prevents canceling non-existent listing", async () => {
      const cancelResponse = await simnet.callPublicFn(
        "nft-marketplace",
        "cancel-listing",
        [
          Cl.uint(999), // Non-existent listing ID
          Cl.contractPrincipal(deployer, 'funny-dog')
        ],
        user1
      );
      expect(cancelResponse.result).toBeErr(Cl.uint(2000)); // ERR_UNKNOWN_LISTING
    });

    it("prevents canceling with wrong NFT contract", async () => {
      // First whitelist the NFT contract
      await simnet.callPublicFn(
        "nft-marketplace",
        "set-whitelisted",
        [Cl.contractPrincipal(deployer, 'funny-dog'), Cl.bool(true)],
        deployer
      );

      // Mint an NFT for user1
      const mintResponse = await simnet.callPublicFn(
        "funny-dog",
        "mint",
        [Cl.principal(user1)],
        deployer
      );
      expect(mintResponse.result).toBeOk(Cl.uint(1));

      // Create listing
      const listingResponse = await createListing(user1);
      expect(listingResponse.result).toBeOk(Cl.uint(0));

      // Try to cancel with nft-marketplace contract instead of funny-dog (wrong contract)
      const cancelResponse = await simnet.callPublicFn(
        "nft-marketplace",
        "cancel-listing",
        [
          Cl.uint(0),
          Cl.contractPrincipal(deployer, 'nft-marketplace')
        ],
        user1
      );
      expect(cancelResponse.result).toBeErr(Cl.uint(2003)); // ERR_NFT_ASSET_MISMATCH
    });
  });

  describe("fulfilling listings", () => {
    describe("with STX payment", () => {
      it("allows fulfilling a listing with STX", async () => {
        // First whitelist the NFT contract
        await simnet.callPublicFn(
          "nft-marketplace",
          "set-whitelisted",
          [Cl.contractPrincipal(deployer, 'funny-dog'), Cl.bool(true)],
          deployer
        );

        // Mint an NFT for user1
        const mintResponse = await simnet.callPublicFn(
          "funny-dog",
          "mint",
          [Cl.principal(user1)],
          deployer
        );
        expect(mintResponse.result).toBeOk(Cl.uint(1));

        // Create listing as user1
        const listingResponse = await createListing(user1);
        expect(listingResponse.result).toBeOk(Cl.uint(0));

        // Fulfill listing as user2
        const fulfilResponse = await simnet.callPublicFn(
          "nft-marketplace",
          "fulfil-listing-stx",
          [
            Cl.uint(0),
            Cl.contractPrincipal(deployer, 'funny-dog')
          ],
          user2
        );
        expect(fulfilResponse.result).toBeOk(Cl.uint(0));

        // Verify listing no longer exists
        const getListing = await simnet.callReadOnlyFn(
          "nft-marketplace",
          "get-listing",
          [Cl.uint(0)],
          user1
        );
        expect(getListing.result).toBeNone();
      });

      it("prevents fulfilling an expired listing", async () => {
        // Mint an NFT for the user
        const mintResponse = await simnet.callPublicFn(
          "funny-dog",
          "mint",
          [Cl.principal(user1)],
          deployer
        );
        expect(mintResponse.result).toBeOk(Cl.uint(1));

        // Create listing with expiry in the past
        await simnet.callPublicFn(
          "nft-marketplace",
          "list-asset",
          [
            Cl.contractPrincipal(deployer, 'funny-dog'),
            Cl.tuple({
              'taker': Cl.none(),
              'token-id': Cl.uint(1),
              'expiry': Cl.uint(simnet.blockHeight - 1), // Set expiry in the past
              'price': Cl.uint(100),
              'payment-asset-contract': Cl.none()
            })
          ],
          user1
        );

        // Attempt to fulfill the expired listing
        const fulfilResponse = await simnet.callPublicFn(
          "nft-marketplace",
          "fulfil-listing-stx",
          [Cl.uint(0), Cl.contractPrincipal(deployer, 'funny-dog')],
          user2
        );
        expect(fulfilResponse.result).toBeErr(Cl.uint(2002)); // ERR_LISTING_EXPIRED
      });

      it("prevents maker from fulfilling their own listing", async () => {
        // First whitelist the NFT contract
        await simnet.callPublicFn(
          "nft-marketplace",
          "set-whitelisted",
          [Cl.contractPrincipal(deployer, 'funny-dog'), Cl.bool(true)],
          deployer
        );

        // Mint an NFT for user1
        const mintResponse = await simnet.callPublicFn(
          "funny-dog",
          "mint",
          [Cl.principal(user1)],
          deployer
        );
        expect(mintResponse.result).toBeOk(Cl.uint(1));

        // Create listing as user1
        const listingResponse = await createListing(user1);
        expect(listingResponse.result).toBeOk(Cl.uint(0));

        // Try to fulfill own listing
        const fulfilResponse = await simnet.callPublicFn(
          "nft-marketplace",
          "fulfil-listing-stx",
          [
            Cl.uint(0),
            Cl.contractPrincipal(deployer, 'funny-dog')
          ],
          user1
        );
        expect(fulfilResponse.result).toBeErr(Cl.uint(2005)); // ERR_MAKER_TAKER_EQUAL
      });

      it("prevents fulfilling a listing with wrong NFT contract", async () => {
        // First whitelist the NFT contract
        await simnet.callPublicFn(
          "nft-marketplace",
          "set-whitelisted",
          [Cl.contractPrincipal(deployer, 'funny-dog'), Cl.bool(true)],
          deployer
        );

        // Mint an NFT for user1
        const mintResponse = await simnet.callPublicFn(
          "funny-dog",
          "mint",
          [Cl.principal(user1)],
          deployer
        );
        expect(mintResponse.result).toBeOk(Cl.uint(1));

        // Create listing as user1
        const listingResponse = await createListing(user1);
        expect(listingResponse.result).toBeOk(Cl.uint(0));

        // Try to fulfill with wrong contract
        const fulfilResponse = await simnet.callPublicFn(
          "nft-marketplace",
          "fulfil-listing-stx",
          [
            Cl.uint(0),
            Cl.contractPrincipal(deployer, 'nft-marketplace')
          ],
          user2
        );
        expect(fulfilResponse.result).toBeErr(Cl.uint(2003)); // ERR_NFT_ASSET_MISMATCH
      });

      it("prevents fulfilling a non-existent listing", async () => {
        const fulfilResponse = await simnet.callPublicFn(
          "nft-marketplace",
          "fulfil-listing-stx",
          [
            Cl.uint(999),
            Cl.contractPrincipal(deployer, 'funny-dog')
          ],
          user2
        );
        expect(fulfilResponse.result).toBeErr(Cl.uint(2000)); // ERR_UNKNOWN_LISTING
      });
    });
  });
});

// Helper function to create a basic listing
const createListing = async (sender: string, params: { tokenId: number, price: number, taker?: string } = { tokenId: 1, price: 100 }) => {
  return simnet.callPublicFn(
    "nft-marketplace",
    "list-asset",
    [
      Cl.contractPrincipal(deployer, 'funny-dog'),  // Using funny-dog NFT contract
      Cl.tuple({
        'taker': params.taker ? Cl.some(Cl.principal(params.taker)) : Cl.none(),
        'token-id': Cl.uint(params.tokenId),
        'expiry': Cl.uint(simnet.blockHeight + 30),  // 30 blocks from now
        'price': Cl.uint(params.price),
        'payment-asset-contract': Cl.none()
      })
    ],
    sender
  );
};