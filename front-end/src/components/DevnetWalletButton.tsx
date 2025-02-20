'use client';

import {
  Box,
  Button,
  Flex,
  Tooltip,
  Tag,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Link,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { DevnetWallet } from '@/lib/devnet-wallet-context';
import { formatStxAddress } from '@/lib/address-utils';
import { DEVNET_STACKS_BLOCKCHAIN_API_URL } from '@/constants/devnet';

interface DevnetWalletButtonProps {
  currentWallet: DevnetWallet | null;
  wallets: DevnetWallet[];
  onWalletSelect: (wallet: DevnetWallet) => void;
}

export const DevnetWalletButton = ({
  currentWallet,
  wallets,
  onWalletSelect,
}: DevnetWalletButtonProps) => {
  return (
    <Menu>
      <Flex align="center">
        <Link
          href={`https://explorer.hiro.so/address/${currentWallet?.stxAddress}?chain=testnet&api=${DEVNET_STACKS_BLOCKCHAIN_API_URL}`}
          target="_blank"
          _hover={{ textDecoration: 'none' }}
        >
          <Button variant="ghost" rightIcon={<ChevronDownIcon visibility="hidden" />}>
            <Tooltip label="Devnet connection detected, click to view in explorer" bg="gray.800">
              <Flex align="center" gap={2}>
                <Box
                  fontSize="sm"
                  fontFamily="mono"
                  width="140px"
                  overflow="hidden"
                  textOverflow="ellipsis"
                >
                  {formatStxAddress(currentWallet?.stxAddress || '')}
                </Box>
                <Tag size="sm" colorScheme="purple" borderRadius="full">
                  devnet
                </Tag>
              </Flex>
            </Tooltip>
          </Button>
        </Link>
        <MenuButton
          as={IconButton}
          variant="ghost"
          icon={<ChevronDownIcon />}
          aria-label="Select wallet"
          size="md"
        />
      </Flex>
      <MenuList width={'100%'}>
        {wallets.map((wallet) => (
          <MenuItem key={wallet.stxAddress} onClick={() => onWalletSelect(wallet)}>
            <Flex align="center" gap={2}>
              <Box
                fontSize="sm"
                fontFamily="mono"
                width="140px"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {formatStxAddress(wallet.stxAddress)}
              </Box>
              {wallet.label && (
                <Tag size="sm" colorScheme="gray" borderRadius="full">
                  {wallet.label}
                </Tag>
              )}
            </Flex>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
