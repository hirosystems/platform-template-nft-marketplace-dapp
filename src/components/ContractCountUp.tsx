"use client";

import React, { useContext } from "react";
import { STACKS_TESTNET } from "@stacks/network";
import {
  AnchorMode,
  PostConditionMode,
} from "@stacks/transactions";
import HiroWalletContext from "./HiroWalletProvider";
import { CONTRACTS } from "@/constants/contracts";
import { shouldUseDirectCall, executeContractCall } from '@/lib/contract-utils';
import { useToast } from "@chakra-ui/react";
import { openContractCall } from "@stacks/connect";
import { DEVNET_NETWORK } from "@/constants/devnet";

const ContractCountUp = () => {
  const { isWalletConnected } = useContext(HiroWalletContext);
  const toast = useToast();

  async function countUp() {
    const txOptions = {
      network: DEVNET_NETWORK,
      anchorMode: AnchorMode.Any,
      contractAddress: CONTRACTS.COUNTER.ADDRESS,
      contractName: CONTRACTS.COUNTER.NAME,
      functionName: "count-up",
      functionArgs: [],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [],
    };

    try {
      if (shouldUseDirectCall()) {
        try {
          const { txid } = await executeContractCall(txOptions);
          toast({
            title: "Success",
            description: `Transaction broadcast with ID: ${txid}`,
            status: "success",
          });
        } catch (execError) {
          console.error('Contract execution error:', execError);
          toast({
            title: "Error",
            description: "Failed to execute contract call. Check console for details.",
            status: "error",
          });
        }
        return;
      }

      await openContractCall({
        ...txOptions,
        onFinish: (data) => {
          toast({
            title: "Success",
            description: "Count increased successfully!",
            status: "success",
          });
        },
        onCancel: () => {
          toast({
            title: "Cancelled",
            description: "Transaction was cancelled",
            status: "info",
          });
        },
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to increase count",
        status: "error",
      });
    }
  }

  // if (!isWalletConnected) {
  //   return null;
  // }

  return (
    <div className="Container">
      <h3>Increment Your Count</h3>
      <button className="CountUp" onClick={countUp}>
        Count Up
      </button>
    </div>
  );
};

export default ContractCountUp; 