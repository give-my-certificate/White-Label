import React from "react";
import { Box, Text, useColorModeValue } from "@chakra-ui/react";

interface MetadataItemProps {
  label: string;
  value: string;
  lightBg: string;
  darkBg: string;
  lightLabelColor: string;
  darkLabelColor: string;
}

export const MetadataItem: React.FC<MetadataItemProps> = ({
  label,
  value,
  lightBg,
  darkBg,
  lightLabelColor,
  darkLabelColor,
}) => {
  const bg = useColorModeValue(lightBg, darkBg);
  const labelColor = useColorModeValue(lightLabelColor, darkLabelColor);
  const valueColor = useColorModeValue("gray.800", "gray.100");

  return (
    <Box bg={bg} p={4} rounded="lg" minW="0">
      <Text fontSize="xs" fontWeight="bold" color={labelColor} mb={1} textTransform="uppercase">
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="semibold" color={valueColor} isTruncated>
        {value}
      </Text>
    </Box>
  );
};
