import React, { useEffect, useRef, useState } from "react";
import { Image as ImageKonva } from "react-konva";
import { Image as KonvaImage } from "konva/lib/shapes/Image";

export interface ImageProps {
	id?: string;
	x: number;
	y: number;
	width: number;
    height: number;
	stroke?: string;
	strokeWidth?: number;
    url: string
}

export interface Props {
	attrs: ImageProps;
	url: string;
	img?: HTMLImageElement | null;
}

const ImageElement: React.FC<Props> = ({ attrs, url, img }) => {
	const qrRef = useRef<KonvaImage>(null);
	const imageRef = useRef<HTMLImageElement | null>(null);
	const [image, setImage] = useState<HTMLImageElement | null>(null);

	// const [logoImg] = useImage(url || attrs.url)
	const logoImage = new Image();
	logoImage.crossOrigin = "Anonymous";
	logoImage.src = url || attrs.url;

	const handleImageLoaded = () => {
		setImage(imageRef.current);
	};

	const loadImage = () => {
		if (img) {
			imageRef.current = img;
			setImage(img)
		}else{
			const img = new window.Image();
			img.src = url || attrs.url;
			img.crossOrigin = "Anonymous";
			imageRef.current = img;
			imageRef.current.addEventListener("load", () => {
				handleImageLoaded();
			});
		}
	};

	useEffect(() => {
		loadImage();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [url]);

	return image && (
		<>
			<ImageKonva
				{...attrs}
				height={attrs.height}
				width={attrs.width}
				image={image}
				ref={qrRef}
				name='konva_object'
			/>
		</>
	)
};

export default ImageElement;
