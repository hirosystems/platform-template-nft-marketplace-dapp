"use client";
import { useState, useEffect, useContext } from "react";
import { HiroWalletContext } from "@/components/HiroWalletProvider";
import { Network } from "@/lib/network";
export const useNetwork = () => {
  const [network, setNetwork] = useState<Network | null>(null);
  const { network: contextNetwork } = useContext(HiroWalletContext);

  useEffect(() => {
    setNetwork(contextNetwork);
  }, [contextNetwork]);

  return network;
};

export const isDevnetEnvironment = (network: Network | null) => {
  return network === "devnet";
};

export const isTestnetEnvironment = (network: Network | null) => {
  return network === "testnet";
};

export const isMainnetEnvironment = (network: Network | null) => {
  return network === "mainnet";
};
