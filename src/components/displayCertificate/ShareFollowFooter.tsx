import React from "react";
import { Box, Button, HStack, IconButton, Text, Tooltip, useClipboard, useColorModeValue, useToast } from "@chakra-ui/react";
import { FaCopy, FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

interface ShareFollowFooterProps {
  shareUrl: string;
  socialLinks?: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
}

export const ShareFollowFooter: React.FC<ShareFollowFooterProps> = ({
  shareUrl,
  socialLinks,
}) => {
  const bg = useColorModeValue("red.50", "red.900");
  const labelColor = useColorModeValue("red.500", "red.300");
  const { hasCopied, onCopy } = useClipboard(shareUrl);
  const toast = useToast();

  const handleCopy = () => {
    onCopy();
    toast({
      title: "Link copied!",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const hasSocialLinks = socialLinks && (
    socialLinks.facebook || socialLinks.linkedin || socialLinks.twitter || socialLinks.instagram
  );

  return (
    <Box bg={bg} p={5} rounded="lg" w="100%">
      <Text fontSize="xs" fontWeight="bold" color={labelColor} mb={3} textTransform="uppercase">
        Share & Follow
      </Text>
      <HStack spacing={3} flexWrap="wrap">
        <Button
          size="sm"
          leftIcon={<FaCopy />}
          variant="outline"
          colorScheme="red"
          onClick={handleCopy}
        >
          {hasCopied ? "Copied!" : "Copy Link"}
        </Button>

        {hasSocialLinks && (
          <HStack spacing={2}>
            {socialLinks?.facebook && (
              <Tooltip label="Follow on Facebook">
                <IconButton
                  aria-label="Follow on Facebook"
                  icon={<FaFacebook />}
                  size="sm"
                  colorScheme="facebook"
                  variant="ghost"
                  onClick={() => window.open(socialLinks.facebook, "_blank")}
                />
              </Tooltip>
            )}
            {socialLinks?.linkedin && (
              <Tooltip label="Follow on LinkedIn">
                <IconButton
                  aria-label="Follow on LinkedIn"
                  icon={<FaLinkedin />}
                  size="sm"
                  colorScheme="linkedin"
                  variant="ghost"
                  onClick={() => window.open(socialLinks.linkedin, "_blank")}
                />
              </Tooltip>
            )}
            {socialLinks?.twitter && (
              <Tooltip label="Follow on Twitter">
                <IconButton
                  aria-label="Follow on Twitter"
                  icon={<FaTwitter />}
                  size="sm"
                  colorScheme="twitter"
                  variant="ghost"
                  onClick={() => window.open(socialLinks.twitter, "_blank")}
                />
              </Tooltip>
            )}
            {socialLinks?.instagram && (
              <Tooltip label="Follow on Instagram">
                <IconButton
                  aria-label="Follow on Instagram"
                  icon={<FaInstagram />}
                  size="sm"
                  colorScheme="orange"
                  variant="ghost"
                  onClick={() => window.open(socialLinks.instagram, "_blank")}
                />
              </Tooltip>
            )}
          </HStack>
        )}
      </HStack>
    </Box>
  );
};
