"use client";

import { useState, useEffect } from "react";
import { Container, SimpleGrid, VStack, useColorMode } from "@chakra-ui/react";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { fetchListings, Listing } from "@/lib/marketplace/operations";

export default function BrowsePage() {
  const { setColorMode } = useColorMode();
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    setColorMode('light');
  }, []);

  const loadListings = async () => {
    const fetchedListings = await fetchListings();

    // Get the number of txids from localStorage
    const storedTxids = localStorage.getItem('txid')
      ? Object.keys(JSON.parse(localStorage.getItem('txid')!)).length
      : 0;
    console.log('storedTxids', storedTxids)

    // Limit the listings to the number of stored txids
    const limitedListings = fetchedListings.slice(0, storedTxids);

    console.log("Fetched listings:", limitedListings);
    setListings(limitedListings);
  };

  useEffect(() => {
    loadListings();
  }, []);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onRefresh={loadListings}
            />
          ))}
        </SimpleGrid>
      </VStack>
    </Container>
  );
}
