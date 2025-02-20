'use client';
import { createContext, FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { getPersistedNetwork, persistNetwork } from '@/lib/network';
import { Network } from '@/lib/network';
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
  const [stacksConnect, setStacksConnect] = useState<any>(null);
  const [userSession, setUserSession] = useState<any>(null);
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
        const { AppConfig, showConnect, UserSession } = await import('@stacks/connect');
        const appConfig = new AppConfig(['store_write', 'publish_data']);
        const session = new UserSession({ appConfig });

        setStacksConnect({ showConnect });
        setUserSession(session);
        setMounted(true);
        setIsWalletConnected(session.isUserSignedIn());
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

  const authenticate = useCallback(() => {
    if (!stacksConnect || !userSession) {
      console.log('Authentication failed: stacksConnect or userSession not initialized');
      return;
    }

    setIsWalletOpen(true);
    stacksConnect.showConnect({
      appDetails: {
        name: 'Hiro',
        icon: `${window.location.origin}/logo512.png`,
      },
      redirectTo: '/',
      onFinish: async () => {
        setIsWalletOpen(false);
        setIsWalletConnected(userSession.isUserSignedIn());
      },
      onCancel: () => {
        setIsWalletOpen(false);
      },
      userSession,
    });
  }, [stacksConnect, userSession]);

  const disconnect = useCallback(() => {
    if (!userSession) return;
    userSession.signUserOut(window.location?.toString());
    setIsWalletConnected(false);
  }, [userSession]);

  const testnetAddress = useMemo(
    () =>
      isWalletConnected && userSession
        ? userSession.loadUserData().profile.stxAddress.testnet
        : null,
    [isWalletConnected, userSession]
  );

  const mainnetAddress = useMemo(
    () =>
      isWalletConnected && userSession
        ? userSession.loadUserData().profile.stxAddress.mainnet
        : null,
    [isWalletConnected, userSession]
  );

  const value = useMemo(
    () => ({
      isWalletOpen,
      isWalletConnected,
      testnetAddress,
      mainnetAddress,
      network,
      setNetwork: updateNetwork,
      authenticate,
      disconnect,
    }),
    [
      isWalletOpen,
      isWalletConnected,
      testnetAddress,
      mainnetAddress,
      network,
      authenticate,
      disconnect,
      updateNetwork,
    ]
  );

  if (!mounted) {
    return null;
  }

  return <HiroWalletContext.Provider value={value}>{children}</HiroWalletContext.Provider>;
};

export { HiroWalletContext };
