export const formatContractName = (contractAddress: string): string => {
  return contractAddress
    .split('.')[1]
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
