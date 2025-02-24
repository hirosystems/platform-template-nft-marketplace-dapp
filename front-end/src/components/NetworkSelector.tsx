'use client';
import { FC, useContext } from 'react';
import { HiroWalletContext } from './HiroWalletProvider';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Text,
  Box,
  Flex,
  Badge,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { Network } from '@/lib/network';

export const NetworkSelector: FC = () => {
  const { network, setNetwork } = useContext(HiroWalletContext);
  const menuBg = useColorModeValue('white', 'gray.800');
  const menuHoverBg = useColorModeValue('gray.50', 'gray.700');

  const networks = [
    // {
    //   name: 'Stacks Mainnet',
    //   value: 'mainnet' as Network,
    //   endpoint: 'api.hiro.so',
    //   status: 'online',
    // },
    {
      name: 'Stacks Testnet',
      value: 'testnet' as Network,
      endpoint: 'api.testnet.hiro.so',
      status: 'online',
    },
    {
      name: 'Devnet',
      value: 'devnet' as Network,
      endpoint: '',
      status: 'offline',
    },
  ];

  if (!network) return null;

  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        variant="outline"
        colorScheme="purple"
        size="md"
      >
        {network.charAt(0).toUpperCase() + network.slice(1)}
      </MenuButton>
      <MenuList bg={menuBg}>
        {networks.map((net) => (
          <MenuItem
            key={net.value}
            onClick={() => setNetwork(net.value)}
            bg={menuBg}
            _hover={{ bg: menuHoverBg }}
          >
            <Flex direction="column" w="full">
              <Text fontWeight="medium">{net.name}</Text>
              <Flex justify="space-between" align="center">
                <Text fontSize="sm" color="gray.500">
                  {net.endpoint}
                </Text>
                {net.status === 'offline' && (
                  <Badge colorScheme="red" ml={2}>
                    Offline
                  </Badge>
                )}
              </Flex>
            </Flex>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
