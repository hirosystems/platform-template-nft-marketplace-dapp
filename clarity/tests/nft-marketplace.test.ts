import { describe, expect, it } from "vitest";
import { Cl, ClarityType, SomeCV, TupleCV } from "@stacks/transactions";
import { initSimnet } from "@hirosystems/clarinet-sdk";

const simnet = await initSimnet();

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;

describe("nft marketplace", () => {
  it("prevents non-owner from setting whitelist status", () => {
    // Try to set whitelist status as non-owner (should fail)
    const response = simnet.callPublicFn(
      "nft-marketplace",
      "set-whitelisted",
      [Cl.principal(deployer), Cl.bool(false)],
      user1,
    );
    expect(response.result).toBeErr(Cl.uint(2001)); // ERR_UNAUTHORISED
  });

  describe("listing assets", () => {
    it("allows listing an NFT with valid parameters", () => {
      // First whitelist the NFT contract
      simnet.callPublicFn(
        "nft-marketplace",
        "set-whitelisted",
        [Cl.contractPrincipal(deployer, "funny-dog"), Cl.bool(true)],
        deployer,
      );

      // Mint an NFT for the user
      const mintResponse = simnet.callPublicFn(
        "funny-dog",
        "mint",
        [Cl.principal(user1)],
        deployer,
      );
      expect(mintResponse.result).toBeOk(Cl.uint(1));

      // Create listing
      const listingResponse = createListing(user1);
      expect(listingResponse.result).toBeOk(Cl.uint(0)); // First listing should have ID 0

      // Verify listing details
      const { result } = simnet.callReadOnlyFn(
        "nft-marketplace",
        "get-listing",
        [Cl.uint(0)],
        user1,
      );

      // Check that the listing exists and has correct details
      expect(result).toBeSome(
        Cl.tuple({
          expiry: Cl.uint(35),
          maker: Cl.principal(user1),
          "nft-asset-contract": Cl.contractPrincipal(deployer, "funny-dog"),
          "token-id": Cl.uint(1),
          price: Cl.uint(100),
          taker: Cl.none(),
          "payment-asset-contract": Cl.none(),
        }),
      );

      // Alternatively, the tuple value can be accessed directly
      const listing = (result as SomeCV<TupleCV>).value;
      expect(listing.value).toBeDefined();
      expect(listing.value.maker).toEqual(Cl.principal(user1));
      expect(listing.value["nft-asset-contract"]).toEqual(
        Cl.contractPrincipal(deployer, "funny-dog"),
      );
      expect(listing.value["token-id"]).toEqual(Cl.uint(1));
      expect(listing.value.expiry).toHaveClarityType(ClarityType.UInt);
      const expiry = listing.value.expiry as SomeCV;
      expect(Number(expiry.value)).toBeGreaterThan(Number(simnet.blockHeight));
      expect(listing.value.price).toEqual(Cl.uint(100));
      expect(listing.value.taker).toHaveClarityType(ClarityType.OptionalNone);
      expect(listing.value["payment-asset-contract"]).toHaveClarityType(
        ClarityType.OptionalNone,
      );
    });

    it("prevents listing with zero price", () => {
      const response = createListing(user1, { tokenId: 1, price: 0 });
      expect(response.result).toBeErr(Cl.uint(1001)); // ERR_PRICE_ZERO
    });

    it("prevents listing from non-whitelisted contract", () => {
      // First set the contract to false in whitelist
      simnet.callPublicFn(
        "nft-marketplace",
        "set-whitelisted",
        [Cl.contractPrincipal(deployer, "funny-dog"), Cl.bool(false)],
        deployer,
      );

      const response = createListing(user1);
      expect(response.result).toBeErr(Cl.uint(2007)); // ERR_ASSET_CONTRACT_NOT_WHITELISTED
    });
  });

  describe("canceling listings", () => {
    it("allows maker to cancel their listing", () => {
      // First whitelist the NFT contract
      simnet.callPublicFn(
        "nft-marketplace",
        "set-whitelisted",
        [Cl.contractPrincipal(deployer, "funny-dog"), Cl.bool(true)],
        deployer,
      );

      // Mint an NFT for the user
      const mintResponse = simnet.callPublicFn(
        "funny-dog",
        "mint",
        [Cl.principal(user1)],
        deployer,
      );
      expect(mintResponse.result).toBeOk(Cl.uint(1));

      // Create listing
      const listingResponse = createListing(user1);
      expect(listingResponse.result).toBeOk(Cl.uint(0)); // First listing should have ID 0

      // Cancel the listing
      const cancelResponse = simnet.callPublicFn(
        "nft-marketplace",
        "cancel-listing",
        [Cl.uint(0), Cl.contractPrincipal(deployer, "funny-dog")],
        user1,
      );
      expect(cancelResponse.result).toBeOk(Cl.bool(true));

      // Verify listing no longer exists
      const getListing = simnet.callReadOnlyFn(
        "nft-marketplace",
        "get-listing",
        [Cl.uint(0)],
        user1,
      );
      expect(getListing.result).toBeNone();
    });

    it("prevents non-maker from canceling listing", () => {
      // First whitelist the NFT contract
      simnet.callPublicFn(
        "nft-marketplace",
        "set-whitelisted",
        [Cl.contractPrincipal(deployer, "funny-dog"), Cl.bool(true)],
        deployer,
      );

      // Mint an NFT for user1
      const mintResponse = simnet.callPublicFn(
        "funny-dog",
        "mint",
        [Cl.principal(user1)],
        deployer,
      );
      expect(mintResponse.result).toBeOk(Cl.uint(1));

      // Create listing as user1
      const listingResponse = createListing(user1);
      expect(listingResponse.result).toBeOk(Cl.uint(0));

      // Try to cancel the listing as user2
      const cancelResponse = simnet.callPublicFn(
        "nft-marketplace",
        "cancel-listing",
        [Cl.uint(0), Cl.contractPrincipal(deployer, "funny-dog")],
        user2,
      );
      expect(cancelResponse.result).toBeErr(Cl.uint(2001)); // ERR_UNAUTHORISED
    });

    it("prevents canceling non-existent listing", () => {
      const cancelResponse = simnet.callPublicFn(
        "nft-marketplace",
        "cancel-listing",
        [
          Cl.uint(999), // Non-existent listing ID
          Cl.contractPrincipal(deployer, "funny-dog"),
        ],
        user1,
      );
      expect(cancelResponse.result).toBeErr(Cl.uint(2000)); // ERR_UNKNOWN_LISTING
    });

    it("prevents canceling with wrong NFT contract", () => {
      // First whitelist the NFT contract
      simnet.callPublicFn(
        "nft-marketplace",
        "set-whitelisted",
        [Cl.contractPrincipal(deployer, "funny-dog"), Cl.bool(true)],
        deployer,
      );

      // Mint an NFT for user1
      const mintResponse = simnet.callPublicFn(
        "funny-dog",
        "mint",
        [Cl.principal(user1)],
        deployer,
      );
      expect(mintResponse.result).toBeOk(Cl.uint(1));

      // Create listing
      const listingResponse = createListing(user1);
      expect(listingResponse.result).toBeOk(Cl.uint(0));

      // Try to cancel with nft-marketplace contract instead of funny-dog (wrong contract)
      const cancelResponse = simnet.callPublicFn(
        "nft-marketplace",
        "cancel-listing",
        [Cl.uint(0), Cl.contractPrincipal(deployer, "nft-marketplace")],
        user1,
      );
      expect(cancelResponse.result).toBeErr(Cl.uint(2003)); // ERR_NFT_ASSET_MISMATCH
    });
  });

  describe("fulfilling listings", () => {
    describe("with STX payment", () => {
      it("allows fulfilling a listing with STX", () => {
        // First whitelist the NFT contract
        simnet.callPublicFn(
          "nft-marketplace",
          "set-whitelisted",
          [Cl.contractPrincipal(deployer, "funny-dog"), Cl.bool(true)],
          deployer,
        );

        // Mint an NFT for user1
        const mintResponse = simnet.callPublicFn(
          "funny-dog",
          "mint",
          [Cl.principal(user1)],
          deployer,
        );
        expect(mintResponse.result).toBeOk(Cl.uint(1));

        // Create listing as user1
        const listingResponse = createListing(user1);
        expect(listingResponse.result).toBeOk(Cl.uint(0));

        // Fulfill listing as user2
        const fulfilResponse = simnet.callPublicFn(
          "nft-marketplace",
          "fulfil-listing-stx",
          [Cl.uint(0), Cl.contractPrincipal(deployer, "funny-dog")],
          user2,
        );
        expect(fulfilResponse.result).toBeOk(Cl.uint(0));

        // Verify listing no longer exists
        const getListing = simnet.callReadOnlyFn(
          "nft-marketplace",
          "get-listing",
          [Cl.uint(0)],
          user1,
        );
        expect(getListing.result).toBeNone();
      });

      it("prevents fulfilling an expired listing", () => {
        // Mint an NFT for the user
        const mintResponse = simnet.callPublicFn(
          "funny-dog",
          "mint",
          [Cl.principal(user1)],
          deployer,
        );
        expect(mintResponse.result).toBeOk(Cl.uint(1));

        // Create listing with expiry in the past
        simnet.callPublicFn(
          "nft-marketplace",
          "list-asset",
          [
            Cl.contractPrincipal(deployer, "funny-dog"),
            Cl.tuple({
              taker: Cl.none(),
              "token-id": Cl.uint(1),
              expiry: Cl.uint(simnet.blockHeight - 1), // Set expiry in the past
              price: Cl.uint(100),
              "payment-asset-contract": Cl.none(),
            }),
          ],
          user1,
        );

        // Attempt to fulfill the expired listing
        const fulfilResponse = simnet.callPublicFn(
          "nft-marketplace",
          "fulfil-listing-stx",
          [Cl.uint(0), Cl.contractPrincipal(deployer, "funny-dog")],
          user2,
        );
        expect(fulfilResponse.result).toBeErr(Cl.uint(2002)); // ERR_LISTING_EXPIRED
      });

      it("prevents maker from fulfilling their own listing", () => {
        // First whitelist the NFT contract
        simnet.callPublicFn(
          "nft-marketplace",
          "set-whitelisted",
          [Cl.contractPrincipal(deployer, "funny-dog"), Cl.bool(true)],
          deployer,
        );

        // Mint an NFT for user1
        const mintResponse = simnet.callPublicFn(
          "funny-dog",
          "mint",
          [Cl.principal(user1)],
          deployer,
        );
        expect(mintResponse.result).toBeOk(Cl.uint(1));

        // Create listing as user1
        const listingResponse = createListing(user1);
        expect(listingResponse.result).toBeOk(Cl.uint(0));

        // Try to fulfill own listing
        const fulfilResponse = simnet.callPublicFn(
          "nft-marketplace",
          "fulfil-listing-stx",
          [Cl.uint(0), Cl.contractPrincipal(deployer, "funny-dog")],
          user1,
        );
        expect(fulfilResponse.result).toBeErr(Cl.uint(2005)); // ERR_MAKER_TAKER_EQUAL
      });

      it("prevents fulfilling a listing with wrong NFT contract", () => {
        // First whitelist the NFT contract
        simnet.callPublicFn(
          "nft-marketplace",
          "set-whitelisted",
          [Cl.contractPrincipal(deployer, "funny-dog"), Cl.bool(true)],
          deployer,
        );

        // Mint an NFT for user1
        const mintResponse = simnet.callPublicFn(
          "funny-dog",
          "mint",
          [Cl.principal(user1)],
          deployer,
        );
        expect(mintResponse.result).toBeOk(Cl.uint(1));

        // Create listing as user1
        const listingResponse = createListing(user1);
        expect(listingResponse.result).toBeOk(Cl.uint(0));

        // Try to fulfill with wrong contract
        const fulfilResponse = simnet.callPublicFn(
          "nft-marketplace",
          "fulfil-listing-stx",
          [Cl.uint(0), Cl.contractPrincipal(deployer, "nft-marketplace")],
          user2,
        );
        expect(fulfilResponse.result).toBeErr(Cl.uint(2003)); // ERR_NFT_ASSET_MISMATCH
      });

      it("prevents fulfilling a non-existent listing", () => {
        const fulfilResponse = simnet.callPublicFn(
          "nft-marketplace",
          "fulfil-listing-stx",
          [Cl.uint(999), Cl.contractPrincipal(deployer, "funny-dog")],
          user2,
        );
        expect(fulfilResponse.result).toBeErr(Cl.uint(2000)); // ERR_UNKNOWN_LISTING
      });
    });
  });
});

// Helper function to create a basic listing
const createListing = (
  sender: string,
  params: { tokenId: number; price: number; taker?: string } = {
    tokenId: 1,
    price: 100,
  },
) => {
  return simnet.callPublicFn(
    "nft-marketplace",
    "list-asset",
    [
      Cl.contractPrincipal(deployer, "funny-dog"), // Using funny-dog NFT contract
      Cl.tuple({
        taker: params.taker ? Cl.some(Cl.principal(params.taker)) : Cl.none(),
        "token-id": Cl.uint(params.tokenId),
        expiry: Cl.uint(simnet.blockHeight + 30), // 30 blocks from now
        price: Cl.uint(params.price),
        "payment-asset-contract": Cl.none(),
      }),
    ],
    sender,
  );
};
