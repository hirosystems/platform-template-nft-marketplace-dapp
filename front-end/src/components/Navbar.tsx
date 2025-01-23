"use client";

import { Box, Button, Container, Flex, Link } from "@chakra-ui/react";
import { useContext } from "react";
import HiroWalletContext from "./HiroWalletProvider";
import { showConnect } from "@stacks/connect";
import { isDevnetEnvironment } from "@/lib/contract-utils";
import { useDevnetWallet } from "@/lib/devnet-wallet-context";
import { DevnetWalletButton } from "./DevnetWalletButton";

export const Navbar = () => {
  const { isWalletConnected } = useContext(HiroWalletContext);
  const { currentWallet, wallets, setCurrentWallet } = useDevnetWallet();

  return (
    <Box as="nav" bg="white" boxShadow="sm">
      <Container maxW="container.xl">
        <Flex justify="space-between" h={16} align="center">
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
            <Link href="/" textDecoration="none">
              <Box fontSize="lg" fontWeight="bold" color="gray.900" ml={4}>
                NFT Marketplace
              </Box>
            </Link>
          </Flex>
          <Flex align="center" gap={4}>
            <Link href="/my-nfts">
              <Box>My NFTs</Box>
            </Link>
            {isDevnetEnvironment() ? (
              <DevnetWalletButton
                currentWallet={currentWallet}
                wallets={wallets}
                onWalletSelect={setCurrentWallet}
              />
            ) : (
              <Button
                onClick={() => {
                  if (!isWalletConnected) {
                    showConnect({
                      appDetails: {
                        name: "NFT Marketplace",
                        icon: "https://freesvg.org/img/1541103084.png",
                      },
                      onFinish: () => {
                        window.location.reload();
                      },
                      onCancel: () => {
                        console.log("popup closed!");
                      },
                    });
                  }
                }}
              >
                {isWalletConnected ? "Connected" : "Connect Wallet"}
              </Button>
            )}
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
};
