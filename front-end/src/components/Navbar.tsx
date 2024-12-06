"use client";

import { Box, Button, Container, Flex, Tooltip, Tag } from "@chakra-ui/react";
import { useContext } from "react";
import HiroWalletContext from "./HiroWalletProvider";
import { showConnect } from "@stacks/connect";
import Link from "next/link";
import { isDevnetEnvironment } from '@/lib/contract-utils';

export const Navbar = () => {
  const { testnetAddress } = useContext(HiroWalletContext);

  const handleConnect = () => {
    showConnect({
      appDetails: {
        name: "Your App Name",
        icon: "/hiro-logo.png",
      },
      onFinish: () => {
        window.location.reload();
      },
    });
  };

  return (
    <Box as="nav" bg="white" boxShadow="sm" py={4}>
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center">
          <Flex align="center">
            <Flex
              bg="white"
              borderRadius="md"
              border="2px"
              borderColor="gray.700"
              letterSpacing="-.05em"
              fontSize="xl"
              fontWeight="bold"
              w="52px"
              h="52px"
              justify="center"
              align="center"
              color="gray.900"
              shrink="0"
            >
              /-/
            </Flex>
            <Box fontSize="lg" fontWeight="bold" color="gray.900" ml={4}>
              NFT Marketplace
            </Box>
          </Flex>
          <Flex gap={4} align="center">
            <Link href="/marketplace/list">
              <Box
                as="span"
                px={3}
                h="10"
                borderRadius="xl"
                cursor="pointer"
                fontSize="sm"
                fontWeight="medium"
                display="flex"
                alignItems="center"
                _hover={{ bg: "gray.100" }}
                transition="all 0.2s"
              >
                <Box as="span" mr={2}>+</Box>
                Create
              </Box>
            </Link>
            {isDevnetEnvironment() ? (
              <Tooltip label="Devnet connection detected, using the devnet wallet" bg="gray.800">
                <Flex align="center" gap={2}>
                  <Box fontSize="sm">
                    {testnetAddress?.slice(0, 6)}...{testnetAddress?.slice(-4)}
                  </Box>
                  <Tag size="sm" colorScheme="purple" borderRadius="full">
                    devnet
                  </Tag>
                </Flex>
              </Tooltip>
            ) : (
                <Button
                  colorScheme="orange"
                  borderRadius="full"
                  onClick={handleConnect}
                >
                  {testnetAddress
                    ? `${testnetAddress.slice(0, 6)}...${testnetAddress.slice(-4)}`
                    : "Connect Wallet"}
                </Button>
            )}
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}; 