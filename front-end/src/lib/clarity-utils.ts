import { deserialize, prettyPrint } from "@stacks/transactions/dist/cl";

export function formatValue(hex: string) {
  const value = deserialize(hex);
  const formattedString = prettyPrint(value, 2);
  return formattedString;
}