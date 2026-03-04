import React from "react";
import { Box, Text, useColorModeValue } from "@chakra-ui/react";

interface ProgramNameCardProps {
  programName: string;
}

export const ProgramNameCard: React.FC<ProgramNameCardProps> = ({ programName }) => {
  const bg = useColorModeValue("teal.50", "teal.900");
  const labelColor = useColorModeValue("green.600", "green.200");
  const valueColor = useColorModeValue("gray.800", "gray.100");

  return (
    <Box bg={bg} p={5} rounded="lg" w="100%">
      <Text fontSize="xs" fontWeight="bold" color={labelColor} mb={1} textTransform="uppercase">
        Program / Event Name
      </Text>
      <Text fontSize="md" fontWeight="semibold" color={valueColor}>
        {programName}
      </Text>
    </Box>
  );
};
