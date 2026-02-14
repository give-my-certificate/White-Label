import { Box, Center, Divider, Flex, Heading, HStack, IconButton, Img, Link, Text, Tooltip, useColorModeValue } from '@chakra-ui/react'
import React from 'react'
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa'
import { Card } from '../../components/card/Card'
import { PoweredBy } from '../../components/poweredBy/PoweredBy'

export const Unknown = () => {
    const textColor = useColorModeValue('gray.600', 'gray.400')
    
    return (
        <Center>
            <Card w={['90%', null, '60%', '60%']}>
                <Center w="100%" h="100%" mb="5">
                    <Img
                        htmlWidth="150px"
                        htmlHeight="150px"
                        height='150px'
                        objectFit="cover"
                        src="https://gpnmjenofbfeawopmhkj.supabase.co/storage/v1/object/public/public/gmc_files/frustated_cat.gif"
                        alt="You shouldn't be here"
                    />
                </Center>
                <Divider my={5} />
                <Box textAlign="center">
                    <Heading size="lg" mb="5">
                        You shouldn't be here
                    </Heading>
                    <Text>
                        We have dispatched some highly trained cats to find this page. If you 
                        think its a mistake contact us at {" "}
                        <Link 
                            href="mailto:support@givemycertificate.com"
                        >
                            support@givemycertificate.com
                        </Link>
                    </Text>
                </Box>
                <Divider mt={5} mb={2} />
                <Flex justifyContent="center" mb="3">
                    <Text color={textColor}>
                        Follow us at
                    </Text>
                </Flex>
                <Flex justifyContent="center">
                    <HStack>
                        <Tooltip label="Follow on facebook" aria-label="Follow on facebook">
                            <IconButton 
                                aria-label="Follow on facebook"
                                icon={<FaFacebook />}
                                colorScheme="facebook"
                                onClick={() => window.open('https://m.facebook.com/973567756011049/', "_blank")}
                            />
                        </Tooltip>
                        <Tooltip label="Follow on Twitter" aria-label="Follow on Twitter">
                            <IconButton 
                                aria-label="Follow on Twitter"
                                icon={<FaTwitter />}
                                colorScheme="twitter"
                                onClick={() => window.open('https://twitter.com/upGrad_edu?t=7AbSK__vCVefE0d8WMNTgQ&s=09', "_blank")}
                            />
                        </Tooltip>
                        <Tooltip label="Follow on Linked In" aria-label="Follow on Linked In">
                            <IconButton 
                                aria-label="Follow on Linked In"
                                icon={<FaLinkedin />}
                                colorScheme="linkedin"
                                onClick={() => window.open('https://www.linkedin.com/company/ueducation/', "_blank")}
                            />
                        </Tooltip>
                        <Tooltip label="Follow on Instagram" aria-label="Follow on Instagram">
                            <IconButton 
                                aria-label="Follow on Instagram"
                                icon={<FaInstagram />}
                                colorScheme="orange"
                                onClick={() => window.open('https://instagram.com/upgrad_edu?igshid=YmMyMTA2M2Y=', "_blank")}
                            />
                        </Tooltip>
                    </HStack>
                </Flex>
                <PoweredBy />
            </Card>
        </Center>
    )
}
