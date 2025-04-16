'use client';
import { createContext, FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { getPersistedNetwork, persistNetwork } from '@/lib/network';
import { Network } from '@/lib/network';
import { connect, disconnect, isConnected, getLocalStorage } from '@stacks/connect';
interface HiroWallet {
  isWalletOpen: boolean;
  isWalletConnected: boolean;
  testnetAddress: string | null;
  mainnetAddress: string | null;
  network: Network | null;
  setNetwork: (network: Network) => void;
  authenticate: () => void;
  disconnect: () => void;
}

const HiroWalletContext = createContext<HiroWallet>({
  isWalletOpen: false,
  isWalletConnected: false,
  testnetAddress: null,
  mainnetAddress: null,
  network: 'mainnet',
  setNetwork: () => {},
  authenticate: () => {},
  disconnect: () => {},
});

interface ProviderProps {
  children: ReactNode | ReactNode[];
}

export const HiroWalletProvider: FC<ProviderProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [network, setNetwork] = useState<Network | null>(null);

  const updateNetwork = useCallback((newNetwork: Network) => {
    setNetwork(newNetwork);
    persistNetwork(newNetwork);
  }, []);

  useEffect(() => {
    const loadStacksConnect = async () => {
      try {
        setMounted(true);
        setIsWalletConnected(isConnected());
      } catch (error) {
        console.error('Failed to load @stacks/connect:', error);
      }
    };

    loadStacksConnect();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setNetwork(getPersistedNetwork());
    }
  }, []);

  const authenticate = useCallback(async () => {
    try {
      setIsWalletOpen(true);
      await connect();
      setIsWalletOpen(false);
      setIsWalletConnected(isConnected());
    } catch (error) {
      console.error('Connection failed:', error);
      setIsWalletOpen(false);
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setIsWalletConnected(false);
  }, []);

  const { testnetAddress, mainnetAddress } = useMemo(() => {
    if (!isWalletConnected) return { testnetAddress: null, mainnetAddress: null };

    const data = getLocalStorage();
    const stxAddresses = data?.addresses?.stx || [];

    // On connect there is only 1 address, which is the current address
    const address = stxAddresses.length > 0 ? stxAddresses[0].address : null;

    const isTestnet = address?.startsWith('ST');
    const isMainnet = address?.startsWith('SP');

    return {
      testnetAddress: isTestnet ? address : null,
      mainnetAddress: isMainnet ? address : null,
    };
  }, [isWalletConnected]);

  const value = useMemo(
    () => ({
      isWalletOpen,
      isWalletConnected,
      testnetAddress,
      mainnetAddress,
      network,
      setNetwork: updateNetwork,
      authenticate,
      disconnect: handleDisconnect,
    }),
    [
      isWalletOpen,
      isWalletConnected,
      testnetAddress,
      mainnetAddress,
      network,
      authenticate,
      handleDisconnect,
      updateNetwork,
    ]
  );

  if (!mounted) {
    return null;
  }

  return <HiroWalletContext.Provider value={value}>{children}</HiroWalletContext.Provider>;
};

export { HiroWalletContext };
