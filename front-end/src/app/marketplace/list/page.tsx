"use client";

import { useState } from "react";
import {
  Container,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Box,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { openContractCall } from "@stacks/connect";
import { listAsset } from "@/lib/marketplace/operations";
import { shouldUseDirectCall, executeContractCall } from '@/lib/contract-utils';
import { storeTxid } from '@/utils/localStorageUtils';

export default function ListPage() {
  const [tokenId, setTokenId] = useState("");
  const [price, setPrice] = useState("");
  const [nftContractAddress, setNftContractAddress] = useState("");
  const [nftContractName, setNftContractName] = useState("");
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const txOptions = await listAsset({
        nftContractAddress,
        nftContractName,
        tokenId: Number(tokenId),
        price: Number(price),
        expiry: 1000000000,
      });
      console.log('txOptions', txOptions)

      if (shouldUseDirectCall()) {
        const { txid } = await executeContractCall(txOptions);
        console.log('txid', txid);
        storeTxid(txid);
        toast({
          title: "NFT Listed",
          description: `Transaction broadcast with ID: ${txid}`,
          status: "success",
          duration: 3000,
        });
        router.push("/");
        return;
      }

      await openContractCall({
        ...txOptions,
        onFinish: (data) => {
          toast({
            title: "Success",
            description: "Listing created successfully!",
            status: "success",
            duration: 3000,

          });
          router.push("/");
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
        description: "Failed to create listing",
        status: "error",
      });
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Button 
          variant="outline" 
          onClick={() => router.push("/")}
          alignSelf="flex-start"
        >
          <Box as="span" mr={2}>←</Box>
        </Button>
        
        <Heading size="lg">Create New Listing</Heading>
        
        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={6}>
            <FormControl isRequired>
              <FormLabel>NFT Contract Address</FormLabel>
              <Input
                value={nftContractAddress}
                onChange={(e) => setNftContractAddress(e.target.value)}
                placeholder="e.g., SPVD6CE8RW90BGGKJZTKCSMGKS7HP0K8364TFR48"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>NFT Contract Name</FormLabel>
              <Input
                value={nftContractName}
                onChange={(e) => setNftContractName(e.target.value)}
                placeholder="e.g., doge-faces-airdrop"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Token ID</FormLabel>
              <Input
                type="number"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                placeholder="Enter token ID"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Price (STX)</FormLabel>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price in STX"
              />
            </FormControl>

            <Button type="submit" colorScheme="blue" width="full">
              Create Listing
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
} 