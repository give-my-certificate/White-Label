import { Flex, IconButton, Link, Spacer, Text } from "@chakra-ui/react";
import React from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

export const PoweredBy = ({ forcedColumnLayout = false }: { forcedColumnLayout?: boolean }) => {
	return (
		<Spacer />
		// <Flex justifyContent='flex-end' mt={10}>
		// 	<Flex direction={forcedColumnLayout ? "column" : ["column", null, "row", null]}>
		// 		<Text fontSize='12px'>
		// 			Powered By :-{" "}
		// 			<Link href='https://givemycertificate.com' target='_blank'>
		// 				Give My Certificate
		// 			</Link>
		// 		</Text>
		// 		<Flex justifyContent='flex-end' mt={forcedColumnLayout ? "4" : ["4", null, "0", "0"]}>
		// 			<IconButton
		// 				aria-label='Follow on Instagram'
		// 				size='sm'
		// 				variant='link'
		// 				icon={<FaInstagram />}
		// 				colorScheme='orange'
		// 				onClick={() => window.open("https://www.instagram.com/givemycertificate", "_blank")}
		// 			/>
		// 			<IconButton
		// 				aria-label='Follow on Linked In'
		// 				size='sm'
		// 				variant='link'
		// 				icon={<FaLinkedin />}
		// 				colorScheme='linkedin'
		// 				onClick={() => window.open("https://www.linkedin.com/company/givemycertificate/", "_blank")}
		// 			/>
		// 			<IconButton
		// 				aria-label='Follow on Twitter'
		// 				size='sm'
		// 				variant='link'
		// 				icon={<FaTwitter />}
		// 				colorScheme='twitter'
		// 				onClick={() => window.open("https://twitter.com/givemycert", "_blank")}
		// 			/>
		// 			<IconButton
		// 				aria-label='Follow on Facebook'
		// 				size='sm'
		// 				variant='link'
		// 				icon={<FaFacebook />}
		// 				colorScheme='facebook'
		// 				onClick={() => window.open("https://www.instagram.com/givemycertificate/", "_blank")}
		// 			/>
		// 		</Flex>
		// 	</Flex>
		// </Flex>
	);
};
