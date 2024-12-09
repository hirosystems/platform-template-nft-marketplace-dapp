/**
 * Formats a Stacks address for display by showing the first 6 and last 4 characters
 * @param address - The full STX address to format
 * @param chars - Optional parameter to specify how many characters to show (default: {start: 6, end: 4})
 * @returns Formatted address string
 */
export const formatStxAddress = (
  address: string,
  chars = { start: 6, end: 4 }
): string => {
  if (!address) return '';
  if (address.length <= chars.start + chars.end) return address;
  
  return `${address.slice(0, chars.start)}...${address.slice(-chars.end)}`;
};
