"use client";

import {
  CardFooter,
  Heading,
  Stack,
  CardBody,
  Card,
  Text,
  Image,
  Box,
} from "@chakra-ui/react";
import { formatContractName } from "@/utils/formatting";
import { getPlaceholderImage } from "@/utils/nft-utils";

interface NftCardProps {
  nft: {
    nftAssetContract: string;
    tokenId: number;
  };
}

export const NftCard = ({ nft }: NftCardProps) => {
  const { nftAssetContract, tokenId } = nft;
  const contractName = formatContractName(nftAssetContract);

  return (
    <Card
      maxW="sm"
      cursor="pointer"
      transition="transform 0.2s"
      _hover={{ transform: "scale(1.02)" }}
      overflow="hidden"
      boxShadow="lg"
    >
      <CardBody padding={0}>
        <Box aspectRatio={1} overflow="hidden">
          <Image
            src={getPlaceholderImage(tokenId)}
            alt={`NFT #${tokenId}`}
            width="100%"
            height="100%"
            objectFit="cover"
          />
        </Box>
        <Stack spacing={2} p={4}>
          <Heading size="md">{contractName}</Heading>
          <Text fontSize="sm" color="gray.500">
            Token ID: {tokenId}
          </Text>
        </Stack>
      </CardBody>
      <CardFooter pt={0} px={4} pb={4}>
        <Text fontSize="xs" color="gray.400" isTruncated>
          {nftAssetContract}
        </Text>
      </CardFooter>
    </Card>
  );
};
