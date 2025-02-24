'use client';

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
} from '@chakra-ui/react';
import { NftCard } from '@/components/marketplace/NftCard';
import { useNftHoldings, useGetTxId } from '@/hooks/useNftHoldings';
import { formatValue } from '@/lib/clarity-utils';
import { mintFunnyDogNFT } from '@/lib/nft/operations';
import { useNetwork } from '@/lib/use-network';
import { useCurrentAddress } from '@/hooks/useCurrentAddress';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { useState, useEffect } from 'react';
import { shouldUseDirectCall, executeContractCall, openContractCall } from '@/lib/contract-utils';
import { useDevnetWallet } from '@/lib/devnet-wallet-context';
import { getExplorerLink } from '@/utils/explorer-links';

export default function MyNFTsPage() {
  const [lastTxId, setLastTxId] = useState<string | null>(null);
  const currentAddress = useCurrentAddress();
  const network = useNetwork();
  const { currentWallet } = useDevnetWallet();
  const { data: nftHoldings, isLoading: nftHoldingsLoading } = useNftHoldings(currentAddress || '');
  const { data: txData } = useGetTxId(lastTxId || '');
  const toast = useToast();

  useEffect(() => {
    // @ts-ignore
    if (txData && txData.tx_status === 'success') {
      toast({
        title: 'Minting Confirmed',
        description: 'Your NFT has been minted successfully',
        status: 'success',
      });
      setLastTxId(null);
      // @ts-ignore
    } else if (txData && txData.tx_status === 'abort_by_response') {
      toast({
        title: 'Minting Failed',
        description: 'The transaction was aborted',
        status: 'error',
      });
      setLastTxId(null);
    }
  }, [txData, toast]);

  const handleMintNFT = async () => {
    if (!network || !currentAddress) return;

    try {
      const txOptions = mintFunnyDogNFT(network, currentAddress);

      if (shouldUseDirectCall()) {
        const { txid } = await executeContractCall(txOptions, currentWallet);
        setLastTxId(txid);
        toast({
          title: 'Minting Submitted',
          description: `Transaction broadcast with ID: ${txid}`,
          status: 'info',
        });
        return;
      }

      await openContractCall({
        ...txOptions,
        onFinish: (data) => {
          setLastTxId(data.txId);
          toast({
            title: 'Success',
            description: 'Minting submitted!',
            status: 'success',
          });
        },
        onCancel: () => {
          toast({
            title: 'Cancelled',
            description: 'Transaction was cancelled',
            status: 'info',
          });
        },
      });
    } catch (error) {
      console.error('Error minting NFT:', error);
      toast({
        title: 'Error',
        description: 'Failed to mint NFT',
        status: 'error',
      });
    }
  };

  const MintCard = () => (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" bg="white" boxShadow="md">
      <Box position="relative" paddingTop="100%">
        <Center position="absolute" top={0} left={0} right={0} bottom={0} bg="gray.100"></Center>
      </Box>
      <VStack p={4} spacing={3} align="stretch">
        <Text fontWeight="bold" fontSize="lg">
          Funny Dog NFT
        </Text>
        <Text fontSize="sm" color="gray.600">
          Mint a new Funny Dog NFT to your collection
        </Text>
        <Button colorScheme="blue" onClick={handleMintNFT} width="full" size="sm">
          Mint NFT
        </Button>
        {lastTxId && (
          <Link
            href={getExplorerLink(lastTxId, network)}
            isExternal
            color="blue.500"
            fontSize="sm"
            textAlign="center"
          >
            View your latest transaction <ExternalLinkIcon mx="2px" />
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
          {nftHoldings?.results && nftHoldings.results.length > 0
            ? nftHoldings.results.map((holding) => (
                <NftCard
                  key={holding.asset_identifier}
                  nft={{
                    nftAssetContract: holding.asset_identifier.split('::')[0],
                    tokenId: +formatValue(holding.value.hex).replace('u', ''),
                  }}
                />
              ))
            : null}
          <MintCard />
        </SimpleGrid>
      </VStack>
    </Container>
  );
}
