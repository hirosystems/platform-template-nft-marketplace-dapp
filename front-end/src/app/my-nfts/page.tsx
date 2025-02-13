"use client";

import {
  Container,
  SimpleGrid,
  VStack,
  Text,
  Center,
  Spinner,
  Button,
  useToast,
  Link,
  Box,
  Image,
} from "@chakra-ui/react";
import { NftCard } from "@/components/marketplace/NftCard";
import { useNftHoldings } from "@/hooks/useNftHoldings";
import { formatValue } from "@/lib/clarity-utils";
import { mintFunnyDogNFT } from "@/lib/nft/operations";
import { isTestnetEnvironment, useNetwork } from "@/lib/use-network";
import { useCurrentAddress } from "@/hooks/useCurrentAddress";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useState } from "react";

export default function MyNFTsPage() {
  const [lastTxId, setLastTxId] = useState<string | null>(null);
  const currentAddress = useCurrentAddress();
  console.log("currentAddress", currentAddress);
  const network = useNetwork();
  const { data: nftHoldings, isLoading: nftHoldingsLoading } = useNftHoldings(
    network,
    currentAddress || ""
  );

  const toast = useToast();
  const isTestnet = isTestnetEnvironment(network);
  const handleMintNFT = async () => {
    if (!currentAddress) return;

    try {
      const txId = await mintFunnyDogNFT(network, currentAddress);
      setLastTxId(txId);
      toast({
        title: "NFT Minting Started",
        description:
          "Your NFT is being minted. This process may take a few minutes.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      console.log("minted", txId);
    } catch (error) {
      toast({
        title: "Minting Failed",
        description: "There was an error minting your NFT",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const MintCard = () => (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg="white"
      boxShadow="md"
    >
      <Box position="relative" paddingTop="100%">
        <Center
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="gray.100"
        >
        </Center>
      </Box>
      <VStack p={4} spacing={3} align="stretch">
        <Text fontWeight="bold" fontSize="lg">
          Funny Dog NFT
        </Text>
        <Text fontSize="sm" color="gray.600">
          Mint a new Funny Dog NFT to your collection
        </Text>
        <Button
          colorScheme="blue"
          onClick={handleMintNFT}
          width="full"
          size="sm"
        >
          Mint NFT
        </Button>
        {lastTxId && (
          <Link
            href={`https://explorer.hiro.so/txid/${lastTxId.replace('0x', '')}?chain=${network}`}
            isExternal
            color="blue.500"
            fontSize="sm"
            textAlign="center"
          >
            View transaction in explorer <ExternalLinkIcon mx="2px" />
          </Link>
        )}
      </VStack>
    </Box>
  );

  if (!currentAddress) {
    return (
      <Center h="50vh">
        <Text>Please connect your wallet to view your NFTs</Text>
      </Center>
    );
  }

  if (nftHoldingsLoading) {
    return (
      <Center h="50vh">
        <Spinner />
      </Center>
    );
  }
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" fontWeight="bold">
          My NFTs
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {nftHoldings?.results && nftHoldings.results.length > 0 ? (
            nftHoldings.results.map((holding) => (
              <NftCard
                key={holding.asset_identifier}
                nft={{
                  nftAssetContract: holding.asset_identifier.split("::")[0],
                  tokenId: +formatValue(holding.value.hex).replace("u", ""),
                }}
              />
            ))
          ) : null}
          <MintCard />
        </SimpleGrid>
      </VStack>
    </Container>
  );
}
