'use client';

import { useState, useEffect } from 'react';
import { Container, SimpleGrid, VStack, Button, Text, Center, Spinner } from '@chakra-ui/react';
import { ListingCard } from '@/components/marketplace/ListingCard';
import { fetchListings, Listing } from '@/lib/marketplace/operations';
import { useNftHoldings } from '@/hooks/useNftHoldings';
import { useDevnetWallet } from '@/lib/devnet-wallet-context';
import { useNetwork } from '@/lib/use-network';

export default function BrowsePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);

  const { currentWallet } = useDevnetWallet();
  const network = useNetwork();
  const { data: nftHoldings, isLoading: nftHoldingsLoading } = useNftHoldings(
    currentWallet?.stxAddress || ''
  );

  const loadListings = async () => {
    if (!network) return;
    const fetchedListings = await fetchListings(network);
    setListings(fetchedListings);
    setIsLoadingListings(false);
  };

  useEffect(() => {
    (async () => {
      await loadListings();

      // Set up interval for subsequent updates
      const intervalId = setInterval(() => {
        loadListings();
      }, 10000);

      return () => clearInterval(intervalId);
    })();
  }, [network]);

  if (!network) {
    return (
      <Center minH="50vh">
        <VStack spacing={4}>
          <Spinner />
        </VStack>
      </Center>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {nftHoldingsLoading || isLoadingListings ? (
          <Center minH="50vh">
            <VStack spacing={4}>
              <Text>Loading NFT holdings and listings...</Text>
              <Button isLoading colorScheme="blue" variant="ghost">
                Loading
              </Button>
            </VStack>
          </Center>
        ) : listings.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} onRefresh={loadListings} />
            ))}
          </SimpleGrid>
        ) : (
          <Center minH="50vh">
            <VStack spacing={4}>
              <Text fontSize="xl">No NFTs listed yet</Text>
              <Button as="a" href="/my-nfts" colorScheme="blue" size="lg" px={8}>
                List Your First NFT
              </Button>
            </VStack>
          </Center>
        )}
      </VStack>
    </Container>
  );
}
