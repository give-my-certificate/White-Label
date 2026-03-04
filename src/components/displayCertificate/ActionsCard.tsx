import React from "react";
import { Box, Button, Icon, VStack, useColorModeValue } from "@chakra-ui/react";
import { FaCheckCircle, FaDownload, FaLinkedin, FaShareAlt } from "react-icons/fa";

interface ActionsCardProps {
  onDownload: () => void;
  onDownloadPdf: () => void;
  onLinkedIn: () => void;
  onVerify: () => void;
  isDownloadLoading: boolean;
  isPdfLoading: boolean;
  isDisabled: boolean;
  isIdCard: boolean;
}

export const ActionsCard: React.FC<ActionsCardProps> = ({
  onDownload,
  onDownloadPdf,
  onLinkedIn,
  onVerify,
  isDownloadLoading,
  isPdfLoading,
  isDisabled,
  isIdCard,
}) => {
  const cardBg = useColorModeValue("white", "gray.700");
  const linkedInBorderColor = useColorModeValue("blue.400", "blue.300");
  const linkedInColor = useColorModeValue("blue.500", "blue.300");

  return (
    <Box bg={cardBg} p={6} rounded="lg" shadow="base" w="100%">
      <VStack spacing={3} w="100%">
        <Button
          w="100%"
          bgGradient="linear(to-r, red.500, red.600)"
          color="white"
          _hover={{ bgGradient: "linear(to-r, red.600, red.700)" }}
          leftIcon={<FaCheckCircle />}
          onClick={onVerify}
          size="md"
        >
          Verify Certificate
        </Button>
        <Button
          w="100%"
          colorScheme="blue"
          variant="outline"
          leftIcon={<FaDownload />}
          onClick={onDownload}
          isLoading={isDownloadLoading}
          loadingText="Downloading..."
          isDisabled={isDisabled}
          size="md"
        >
          Download Image
        </Button>
        <Button
          w="100%"
          colorScheme="red"
          variant="outline"
          leftIcon={<Icon as={FaDownload} />}
          onClick={onDownloadPdf}
          isLoading={isPdfLoading}
          loadingText="Downloading..."
          isDisabled={isDisabled}
          size="md"
        >
          Download PDF
        </Button>
        {!isIdCard && (
          <Button
            w="100%"
            variant="outline"
            borderColor={linkedInBorderColor}
            color={linkedInColor}
            leftIcon={<FaLinkedin />}
            onClick={onLinkedIn}
            size="md"
          >
            Add to LinkedIn
          </Button>
        )}
      </VStack>
    </Box>
  );
};
