import { Flex, useColorModeValue, BoxProps } from '@chakra-ui/react'
import React from 'react'
import { HEADER_NAVBAR_HEIGHT } from '../../configs/LayoutConfigs'

export const HeaderNavbar = ( props: BoxProps ) => {
    return (
        <Flex
            h={`${HEADER_NAVBAR_HEIGHT}rem`}
            w="100vw"
            alignItems="center"
            bg={useColorModeValue('white', 'gray.700')}
            borderBottomWidth={1}
            shadow="md"
            position="fixed"
            top="0"
            zIndex={100}
            {...props}
        />
    )
}
