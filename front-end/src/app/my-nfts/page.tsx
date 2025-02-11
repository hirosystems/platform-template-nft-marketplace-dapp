"use client";

import {
  Container,
  SimpleGrid,
  VStack,
  Text,
  Center,
  Spinner,
} from "@chakra-ui/react";
import { NftCard } from "@/components/marketplace/NftCard";
import { useNftHoldings } from "@/hooks/useNftHoldings";
import { useDevnetWallet } from "@/lib/devnet-wallet-context";
import { formatValue } from "@/lib/clarity-utils";

export default function MyNFTsPage() {
  const { currentWallet } = useDevnetWallet();
  const { data: nftHoldings, isLoading: nftHoldingsLoading } = useNftHoldings(
    currentWallet?.stxAddress || ""
  );

  if (!currentWallet) {
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
        {nftHoldings?.results && nftHoldings.results.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {nftHoldings.results.map((holding) => (
              <NftCard
                key={holding.asset_identifier}
                nft={{
                  nftAssetContract: holding.asset_identifier.split("::")[0],
                  tokenId: +formatValue(holding.value.hex).replace("u", ""),
                }}
              />
            ))}
          </SimpleGrid>
        ) : (
          <Center h="30vh">
            <Text>
              You don't own any NFTs yet. You need to mint some first before you
              can list them!
            </Text>
          </Center>
        )}
      </VStack>
    </Container>
  );
}
