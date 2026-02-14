import React from 'react'
import { HeaderNavbar } from '../../layout/headerNavbar/HeaderNavbar'
import { HEADER_LOGO_HEIGHT, HEADER_LOGO_SMALL_SCREEN_RATIO, HEADER_LOGO_SMALL_SCREEN_TEXT_SIZE } from '../../configs/LayoutConfigs'
import { ColorModeSwitcher } from '../../ColorModeSwitcher'
import { Logo } from '../logo/Logo'
import { LinkBox, LinkOverlay, Spacer } from '@chakra-ui/react'
import { useOrganizationConfig } from '../../context/OrganizationConfigContext'

export const Header = () => {
    const { config } = useOrganizationConfig();
    const headerLinkUrl = config?.headerLinkUrl || '#';
    
    return (
        <HeaderNavbar>
            <LinkBox>
                <Logo
                    src={config?.headerLogoUrl}
                    h={{
                        base: `${HEADER_LOGO_HEIGHT * HEADER_LOGO_SMALL_SCREEN_RATIO}rem`,
                        md: `${HEADER_LOGO_HEIGHT}rem`
                    }}
                    fontSize={{
                        base: HEADER_LOGO_SMALL_SCREEN_TEXT_SIZE,
                        md: 'inherit'
                    }}
                    ml={3}
                />
                <LinkOverlay href={headerLinkUrl} />
            </LinkBox>
            <Spacer />
            <ColorModeSwitcher mr={3} />
        </HeaderNavbar>
    )
}
