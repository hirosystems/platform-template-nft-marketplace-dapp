'use client';
import { Box, Button, Flex, Icon, Text, Tooltip, IconButton } from '@chakra-ui/react';
import { useContext, useState } from 'react';
import { HiroWalletContext } from './HiroWalletProvider';
import { RiFileCopyLine, RiCloseLine } from 'react-icons/ri';

interface ConnectWalletButtonProps {
  children?: React.ReactNode;
  [key: string]: any;
}

export const ConnectWalletButton = (buttonProps: ConnectWalletButtonProps) => {
  const { children } = buttonProps;
  const [didCopyAddress, setDidCopyAddress] = useState(false);
  const { authenticate, isWalletConnected, mainnetAddress, testnetAddress, network, disconnect } =
    useContext(HiroWalletContext);

  const currentAddress = network === 'mainnet' ? mainnetAddress : testnetAddress;

  const copyAddress = () => {
    if (currentAddress) {
      navigator.clipboard.writeText(currentAddress);
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
    <Flex align="center" gap={2} p={2} borderRadius="md" bg="gray.200">
      <Text color="gray.800" fontSize="sm">
        {truncateMiddle(currentAddress)}
      </Text>
      <Tooltip label="Copy address" isOpen={didCopyAddress ? true : undefined}>
        <IconButton
          aria-label="Copy address"
          icon={<Icon as={RiFileCopyLine} />}
          size="sm"
          variant="ghost"
          onClick={copyAddress}
          minW="8"
          p="1"
        />
      </Tooltip>
      <Tooltip label="Disconnect wallet">
        <IconButton
          aria-label="Disconnect wallet"
          icon={<Icon as={RiCloseLine} />}
          size="sm"
          variant="ghost"
          onClick={disconnect}
          data-testid="disconnect-wallet-address-button"
          minW="8"
          p="1"
        />
      </Tooltip>
    </Flex>
  ) : (
    <Button size="sm" onClick={authenticate} data-testid="wallet-connect-button" {...buttonProps}>
      {children || 'Connect Wallet'}
    </Button>
  );
};
