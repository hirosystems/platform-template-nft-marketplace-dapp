import { openContractCall } from "@stacks/connect";
import { PostConditionMode, stringAsciiCV } from "@stacks/transactions";
import { FUNNY_DOG_CONTRACT } from "@/constants/contracts";
import { getNetwork } from "@/lib/contract-utils";

export const mintFunnyDogNFT = async (recipientAddress: string): Promise<string> => {
  const { openContractCall } = await import("@stacks/connect");
  const functionArgs = [stringAsciiCV(recipientAddress)];
  
  return new Promise((resolve, reject) => {
    const options = {
      network: getNetwork(),
      anchorMode: 1,
      contractAddress: FUNNY_DOG_CONTRACT.address,
      contractName: FUNNY_DOG_CONTRACT.name,
      functionName: "mint",
      functionArgs,
      postConditionMode: PostConditionMode.Deny,
      postConditions: [],
      onFinish: (data: any) => {
        console.log("Minting finished:", data);
        resolve(data.txId);
      },
      onCancel: () => {
        reject(new Error("User cancelled the transaction"));
      },
    };

    openContractCall(options).catch(reject);
  });
};
