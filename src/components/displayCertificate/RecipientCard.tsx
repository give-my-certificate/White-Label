import React from "react";
import { Box, HStack, Icon, Text, useColorModeValue } from "@chakra-ui/react";
import { FaUserGraduate } from "react-icons/fa";

interface RecipientCardProps {
  name: string;
}

export const RecipientCard: React.FC<RecipientCardProps> = ({ name }) => {
  const cardBg = useColorModeValue("white", "gray.700");
  const labelColor = useColorModeValue("gray.500", "gray.400");
  const iconColor = useColorModeValue("blue.500", "blue.300");

  return (
    <Box bg={cardBg} p={5} rounded="lg" shadow="base" w="100%">
      <HStack spacing={3}>
        <Icon as={FaUserGraduate} color={iconColor} boxSize={5} />
        <Box>
          <Text fontSize="xs" fontWeight="bold" color={labelColor} textTransform="uppercase">
            Recipient
          </Text>
          <Text fontSize="lg" fontWeight="bold">
            {name}
          </Text>
        </Box>
      </HStack>
    </Box>
  );
};
