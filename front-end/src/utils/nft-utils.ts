export const getPlaceholderImage = (tokenId: number) => {
  return `/images/dogs/dog-${tokenId % 12}.webp`;
};