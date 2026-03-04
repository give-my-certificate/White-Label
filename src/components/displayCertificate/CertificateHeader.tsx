import React from "react";
import { Avatar, Flex, HStack, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { ColorModeSwitcher } from "../../ColorModeSwitcher";

interface CertificateHeaderProps {
  orgName: string;
  orgSubtitle?: string;
  orgLogoUrl?: string;
}

export const CertificateHeader: React.FC<CertificateHeaderProps> = ({
  orgName,
  orgSubtitle,
  orgLogoUrl,
}) => {
  const bg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const subtitleColor = useColorModeValue("gray.500", "gray.400");

  return (
    <Flex
      w="100%"
      bg={bg}
      borderBottomWidth={1}
      borderColor={borderColor}
      shadow="sm"
      px={{ base: 4, md: 8 }}
      py={3}
      alignItems="center"
      justifyContent="space-between"
      position="fixed"
      top="0"
      zIndex={100}
    >
      <HStack spacing={3}>
        <Avatar size="sm" src={orgLogoUrl} name={orgName} />
        <VStack spacing={0} alignItems="flex-start">
          <Text fontSize="sm" fontWeight="bold" lineHeight="short">
            {orgName}
          </Text>
          {orgSubtitle && (
            <Text fontSize="xs" color={subtitleColor} lineHeight="short">
              {orgSubtitle}
            </Text>
          )}
        </VStack>
      </HStack>
      <ColorModeSwitcher />
    </Flex>
  );
};
