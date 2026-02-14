import { Box, useColorModeValue, BoxProps } from '@chakra-ui/react'
import React from 'react'
import { HEADER_NAVBAR_HEIGHT } from '../../configs/LayoutConfigs'

export const MainSection = ( props: BoxProps ) => {
    return (
        <Box
            mt={`${HEADER_NAVBAR_HEIGHT}rem`}
            p={{
                base: 3,
                md: 5
            }}
            bg={useColorModeValue('gray.50', 'inherit')}
            {...props}
        />
    )
}
