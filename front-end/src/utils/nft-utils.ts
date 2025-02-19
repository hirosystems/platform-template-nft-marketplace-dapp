export const getPlaceholderImage = (tokenId: number) => {
  return `/images/dogs/${tokenId % 12}.webp`;
};