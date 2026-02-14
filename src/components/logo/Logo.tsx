import { Flex, HTMLChakraProps, Image, useToken, Text } from '@chakra-ui/react'
import * as React from 'react'
import GMCLogSq from '../../assets/images/GMCLogSq.png'

export const Logo = (props: HTMLChakraProps<'div'> & {
  iconColor?: string;
  src?: string;  // Allow custom logo URL
}) => {
  const { iconColor = 'currentColor', src, ...rest } = props
  const color = useToken('colors', iconColor)
  const logoSrc = src || GMCLogSq;  // Use custom src if provided, else default

  return (
    <Flex
      alignItems="center"
      {...rest}
    >
      <Image
        src={logoSrc}
        h="inherit"
        mr={2}
        color={color}
      />
      {/* <Text
        fontSize="28px"
        color="#ed2b36"
        fontWeight="700"
      >
        Mind Merge
      </Text> */}
    </Flex>
  )
}
