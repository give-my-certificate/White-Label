import { Box, Center, Divider, Heading, Img, Link, Text } from '@chakra-ui/react'
import React from 'react'
import { Card } from '../card/Card'
import { PoweredBy } from '../poweredBy/PoweredBy'

export const NotFound = () => {
    return (
        <Center>
            <Card w={['90%', null, '60%', '60%']}>
                <Center w="100%" h="100%" mb="5">
                    <Img
                        htmlWidth="150px"
                        htmlHeight="150px"
                        height='150px'
                        objectFit="cover"
                        src="https://thumbs.gfycat.com/SpecificSlimIndianringneckparakeet-small.gif"
                        alt="Certificate Not found"
                    />
                </Center>
                <Divider my={5} />
                <Box textAlign="center">
                    <Heading size="lg" mb="5">
                        Certificate Not Found
                    </Heading>
                    <Text>
                        We are unable to find any certificate associated with the provided certificate id. If you 
                        think its a mistake contact us at {" "}
                        <Link 
                            href="mailto:support@givemycertificate.com"
                        >
                            support@givemycertificate.com
                        </Link>
                    </Text>
                </Box>
                <PoweredBy />
            </Card>
        </Center>
    )
}
