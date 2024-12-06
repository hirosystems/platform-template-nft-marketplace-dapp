"use client";
import {
  Box,
  Button,
  Flex,
  Icon,
  Text,
} from "@chakra-ui/react";
import { useContext, useState } from "react";
import HiroWalletContext from "./HiroWalletProvider";
import { RiFileCopyLine } from "react-icons/ri";

interface ConnectWalletButtonProps {
  children?: React.ReactNode;
  [key: string]: any;
}

export const ConnectWalletButton = (buttonProps: ConnectWalletButtonProps) => {
  const { children } = buttonProps;
  const [didCopyAddress, setDidCopyAddress] = useState(false);
  const { authenticate, isWalletConnected, mainnetAddress, disconnect } =
    useContext(HiroWalletContext);

  const copyAddress = () => {
    if (mainnetAddress) {
      navigator.clipboard.writeText(mainnetAddress);
      setDidCopyAddress(true);
      setTimeout(() => {
        setDidCopyAddress(false);
      }, 1000);
    }
  };

  const truncateMiddle = (str: string | null) => {
    if (!str) return '';
    if (str.length <= 12) return str;
    return `${str.slice(0, 6)}...${str.slice(-4)}`;
  };

  return isWalletConnected ? (
    <Flex direction="column" gap={2}>
      <Flex gap="1.5" align="center">
        <Text color="gray.300">Connected:</Text>
        <Box>{truncateMiddle(mainnetAddress)}</Box>
      </Flex>

      <Button
        size="sm"
        onClick={disconnect}
        data-testid="disconnect-wallet-address-button"
      >
        Disconnect
      </Button>
    </Flex>
  ) : (
    <Button
      size="sm"
      onClick={authenticate}
      data-testid="wallet-connect-button"
      {...buttonProps}
    >
      <Flex gap="2" align="center">
        {children || "Connect Wallet"}
      </Flex>
    </Button>
  );
};
