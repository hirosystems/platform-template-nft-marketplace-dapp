'use client';
import { useState, useEffect, useContext } from 'react';
import { HiroWalletContext } from '@/components/HiroWalletProvider';
import { Network } from '@/lib/network';
export const useNetwork = () => {
  const [network, setNetwork] = useState<Network | null>(null);
  const { network: contextNetwork } = useContext(HiroWalletContext);

  useEffect(() => {
    setNetwork(contextNetwork);
  }, [contextNetwork]);

  return network;
};

export const isDevnetEnvironment = () => {
  return process.env.NEXT_PUBLIC_STACKS_NETWORK === 'devnet' && process.env.NEXT_PUBLIC_PLATFORM_HIRO_API_KEY;
};

export const isTestnetEnvironment = (network: Network | null) => {
  return network === 'testnet';
};

export const isMainnetEnvironment = (network: Network | null) => {
  return network === 'mainnet';
};
