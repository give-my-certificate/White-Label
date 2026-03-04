import React from "react";
import { Box, Text, useColorModeValue } from "@chakra-ui/react";

interface IssuedByCardProps {
  organizationName: string;
}

export const IssuedByCard: React.FC<IssuedByCardProps> = ({ organizationName }) => {
  const bg = useColorModeValue("orange.50", "orange.900");
  const labelColor = useColorModeValue("orange.600", "orange.200");
  const valueColor = useColorModeValue("gray.800", "gray.100");

  return (
    <Box bg={bg} p={5} rounded="lg" w="100%">
      <Text fontSize="xs" fontWeight="bold" color={labelColor} mb={1} textTransform="uppercase">
        Issued By
      </Text>
      <Text fontSize="md" fontWeight="semibold" color={valueColor}>
        {organizationName}
      </Text>
    </Box>
  );
};
