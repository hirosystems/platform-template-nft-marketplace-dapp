'use client';

import { ReactNode, useState } from 'react';
import { DevnetWalletContext, DevnetWallet, devnetWallets } from '@/lib/devnet-wallet-context';

interface DevnetWalletProviderProps {
  children: ReactNode;
}

export function DevnetWalletProvider({ children }: DevnetWalletProviderProps) {
  const [currentWallet, setCurrentWallet] = useState<DevnetWallet>(devnetWallets[0]);

  return (
    <DevnetWalletContext.Provider
      value={{
        currentWallet,
        wallets: devnetWallets,
        setCurrentWallet,
      }}
    >
      {children}
    </DevnetWalletContext.Provider>
  );
}
