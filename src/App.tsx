import React, { useEffect } from "react";
import { ChakraProvider, theme } from "@chakra-ui/react";
import Dashboard from "./pages/dashboard/Dashboard";
import { OrganizationConfigProvider } from "./context/OrganizationConfigContext";
import { DynamicHead } from "./components/DynamicHead";

export const App = () => {
	useEffect(() => {
		const el = document.querySelector(".container");
		if (el) {
		  el.remove();
		}
	}, []);
	return (
		<ChakraProvider theme={theme}>
			<OrganizationConfigProvider>
				<DynamicHead />
				<Dashboard />
			</OrganizationConfigProvider>
		</ChakraProvider>
	)
}
