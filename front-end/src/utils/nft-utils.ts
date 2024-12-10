
export const getPlaceholderImage = (tokenId: number) => {
  return `https://placedog.net/200/200?id=${tokenId % 16}`;
};