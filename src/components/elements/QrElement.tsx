import React, { useState, useEffect, useRef } from "react";
import { Image as KonvaImage } from "react-konva";
import QRCode from "qrcode";
import { OrganizationConfig } from "../../types/OrganizationConfig";

export interface QrProps {
	id?: string;
	x: number;
	y: number;
	size: number;
	stroke?: string;
	strokeWidth?: number;
}

export interface Props {
	attrs: QrProps;
	url: string;
	elementProps?: {[key:string]: string | object | boolean }
	isWhiteLabeled?: boolean
	orgConfig?: OrganizationConfig | null
}

const QrElement: React.FC<Props> = ({ attrs, url, elementProps, isWhiteLabeled, orgConfig }) => {
	const qrImageRef = useRef<HTMLImageElement | null>(null);
	const [qrImage, setQrImage] = useState<HTMLImageElement | null>(null);
	let logoRatio = 4;

	const gmcLogoUrl = 'https://gpnmjenofbfeawopmhkj.supabase.co/storage/v1/object/public/public/gmc_files/gmc_logo_sq_small_compress.png';
	const blankImageUrl = 'https://gpnmjenofbfeawopmhkj.supabase.co/storage/v1/object/public/public/gmc_files/blank.png?'
	let displayLogoOnQr = false
	let logoImgUrl = blankImageUrl

	// Priority: Org config QR logo > Custom logo > GMC logo > Blank
	if (orgConfig?.qrLogoUrl) {
		logoImgUrl = orgConfig.qrLogoUrl;
		displayLogoOnQr = true;
	} else if ( elementProps && elementProps['customLogo'] && (typeof elementProps['customLogoUrl'] === 'string') && elementProps['customLogoUrl'].toString().length > 0) {
		logoImgUrl = elementProps['customLogoUrl']
		displayLogoOnQr = true
	} else if ( elementProps && elementProps['gmcLogo']) {
		logoImgUrl = gmcLogoUrl
		displayLogoOnQr = true
	} else if (!isWhiteLabeled) {
		logoImgUrl = gmcLogoUrl
		displayLogoOnQr = true
	}
	
	const logoImg = new Image();
	logoImg.crossOrigin = "Anonymous";
	logoImg.src = logoImgUrl;

	const loadImage = async () => {
		let image = new window.Image();
		image.crossOrigin = "Anonymous";
		let data = await QRCode.toDataURL(url, {
			errorCorrectionLevel: "H",
			scale: 6,
		});
		image.src = data;
		qrImageRef.current = image;
		qrImageRef.current.addEventListener("load", () => {
			setQrImage(qrImageRef.current);
		});
	};

	useEffect(() => {
		loadImage();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [url]);

	return (
		<>
			{
				qrImage && 
				<KonvaImage 
					{...attrs} 
					height={attrs.size} 
					width={attrs.size} 
					image={qrImage} 
				/>
			}
			{
				displayLogoOnQr &&
				<KonvaImage
					height={attrs.size / logoRatio}
					width={attrs.size / logoRatio}
					image={logoImg}
					x={attrs.x + (attrs.size * (1 - 1 / logoRatio)) / 2}
					y={attrs.y + (attrs.size * (1 - 1 / logoRatio)) / 2}
				/>
			}
		</>
	);
};

export default QrElement;
