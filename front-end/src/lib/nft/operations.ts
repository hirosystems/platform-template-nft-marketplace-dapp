import { PostConditionMode, principalCV } from "@stacks/transactions";
import { Network } from "@/components/NetworkSelector";
import { getNftContract } from "@/constants/contracts";

export const mintFunnyDogNFT = async (network: Network, recipientAddress: string): Promise<string> => {
  const { openContractCall } = await import("@stacks/connect");
  const recipient = principalCV(recipientAddress);
  const functionArgs = [recipient];
  const contract = getNftContract(network);

  return new Promise((resolve, reject) => {
    const options = {
      ...contract,
      network,
      anchorMode: 1,
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

    console.log("options", options);
    openContractCall(options).catch(reject);
  });
};
