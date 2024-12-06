"use client";

import { Box, Container, Heading, VStack, Text, Stack } from "@chakra-ui/react";
import { ConnectWalletButton } from "@/components/ConnectWallet";
import ContractCountUp from "@/components/ContractCountUp";
import ContractGetCount from "@/components/ContractGetCount";

export default function CounterPage() {
  return (
    <Container maxW="container.md" py={8}>
      <Stack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="xl" mb={4}>
            Stacks Counter Demo
          </Heading>
          <Text mb={4}>
            Connect your wallet to interact with the counter contract
          </Text>
          <ConnectWalletButton />
        </Box>

        <VStack spacing={6} align="stretch">
          <ContractGetCount />
          <ContractCountUp />
        </VStack>
      </Stack>
    </Container>
  );
} 