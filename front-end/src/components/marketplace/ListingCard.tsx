"use client";

import { openContractCall } from "@stacks/connect";
import { CardFooter, Heading, Stack, CardBody, Card, useToast, Button, Text, Image, Box, Flex } from "@chakra-ui/react";
import { cancelListing, purchaseListingStx } from "@/lib/marketplace/operations";
import { useContext } from "react";
import HiroWalletContext from "../HiroWalletProvider";
import { useRouter } from "next/navigation";
import { shouldUseDirectCall } from "@/lib/contract-utils";
import { executeContractCall } from "@/lib/contract-utils";

interface ListingCardProps {
  listing: {
    id: number;
    maker: string;
    taker: string | null;
    tokenId: number;
    nftAssetContract: string;
    expiry: number;
    price: number;
    paymentAssetContract: string | null;
  };
  onRefresh: () => void;
}

export const ListingCard = ({ listing, onRefresh }: ListingCardProps) => {
  const { testnetAddress } = useContext(HiroWalletContext);
  const toast = useToast();
  const router = useRouter();

  const handlePurchase = async () => {
    try {
      const txOptions = await purchaseListingStx(listing.id, listing.nftAssetContract);
      console.log('txOptions', txOptions)
      
      if (shouldUseDirectCall()) {
        const { txid } = await executeContractCall(txOptions);
        // console.log('txid', txid);
        // storeTxid(txid);
        toast({
          title: "Purchase Successful",
          description: `Transaction broadcast with ID: ${txid}`,
          status: "success",
        });
        onRefresh();
        return;
      }

      await openContractCall({
        ...txOptions,
        onFinish: (data) => {
          toast({
            title: "Success",
            description: "Purchase successful!",
            status: "success",
          });
          onRefresh();
        },
        onCancel: () => {
          toast({
            title: "Cancelled",
            description: "Transaction was cancelled",
            status: "info",
          });
        },
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to purchase NFT",
        status: "error",
      });
    }
  };

  const handleCancel = async () => {
    if (listing.maker !== testnetAddress) return;

    try {
      const txOptions = await cancelListing(listing.id, listing.nftAssetContract);
      
      await openContractCall({
        ...txOptions,
        onFinish: (data) => {
          toast({
            title: "Success",
            description: "Listing cancelled successfully",
            status: "success",
          });
          onRefresh();
        },
        onCancel: () => {
          toast({
            title: "Cancelled",
            description: "Transaction was cancelled",
            status: "info",
          });
        },
      });
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to cancel listing",
        status: "error",
      });
    }
  };

  const getPlaceholderImage = (tokenId: number) => {
      return `https://placedog.net/300/200?id=${tokenId % 16}`;
  };

  return (
    <Card
      maxW="sm"
      cursor="pointer"
      transition="transform 0.2s"
      _hover={{ transform: 'scale(1.02)' }}
      overflow="hidden"
      boxShadow="lg"
    >
      <CardBody padding={0}>
        <Box aspectRatio={1} overflow="hidden">
          <Image
            src={getPlaceholderImage(listing.tokenId)}
            alt={`NFT #${listing.tokenId}`}
            width="100%"
            height="100%"
            objectFit="cover"
          />
        </Box>
        <Stack spacing={2} p={4}>
          <Heading size="md">NFT #{listing.tokenId}</Heading>
          <Text fontSize="sm" color="gray.500">
            Collection Name
          </Text>
          <Flex justify="space-between" align="center">
            <Text color="orange.500" fontWeight="bold">
              {listing.price} STX
            </Text>
            <Text fontSize="xs" color="gray.400">
              By {listing.maker.slice(0, 6)}...
            </Text>
          </Flex>
        </Stack>
      </CardBody>
      <CardFooter pt={0} px={4} pb={4}>
        <Stack spacing={2} width="100%">
          {listing.maker === testnetAddress ? (
            <Button colorScheme="orange" onClick={handleCancel}>
              Cancel Listing
            </Button>
          ) : (
            <Button
              colorScheme="orange"
              onClick={handlePurchase}
              isDisabled={listing.taker !== null && listing.taker !== testnetAddress}
            >
              Purchase
            </Button>
          )}
        </Stack>
      </CardFooter>
    </Card>
  );
}; 