import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState as useNativeState } from "react";
import { useState, State } from "@hookstate/core";
import { Stage, Image, Layer } from "react-konva";
import { Layer as KonvaLayer } from "konva/lib/Layer";
import { ElementsType } from "./DrawingSheet";

import DrawingSheet from "./DrawingSheet";
import { Skeleton, Stack, useToast } from "@chakra-ui/react";
import { ImageElementsHolderType } from "../../pages/displayCertificate/DisplayCertificate";
import { OrganizationConfig } from "../../types/OrganizationConfig";

interface Bounds {
	height: number;
	width: number;
	top?: number;
	left?: number;
}

export interface Config {
	name: string;
	image_url: string;
	actual_dimensions: { width: number; height: number };
	rendered_dimensions: { width: number; height: number };
}

interface Props {
	elementsData: State<ElementsType | null>;
	configData: State<Config | null>;
	bg: string;
	imageLeftToRender?: number;
	isWhiteLabeled?: boolean;
	imageElementsHolder?: ImageElementsHolderType
	orgConfig?: OrganizationConfig | null
}

export interface PreviewCertificateType {
    getBase64Image: () => any,
}

const PreviewCertificate = forwardRef(({ elementsData, configData, bg, imageLeftToRender=0, isWhiteLabeled=false, imageElementsHolder, orgConfig }:Props, ref) => {
	const imageURL = useState<string>(bg);
	const isLoading = useState<boolean>(true);
	const [image, setImage] = useNativeState<HTMLImageElement | null>(null);

	const canvasBounds = useState<DOMRect>({ height: 1, width: 1 } as DOMRect);
	const konvaBounds = useState<Bounds>({ height: 1, width: 1 });
	const bgImgBounds = useState<Bounds>({ height: 1, width: 1 });
	const prevBounds = useState<Bounds>({ height: 0, width: 0 });
	const scale = useState<number>(1);
	const loader = useState<boolean>(false);
	const toast = useToast()

	const layerRef = useRef<KonvaLayer>(null);
	const imageRef = useRef<HTMLImageElement | null>(null);

	useImperativeHandle( ref, () => ({
        getBase64Image: () => {
			let pixelRatio = (configData && configData.value) ? (configData.value?.actual_dimensions.height / configData.value?.rendered_dimensions.height) : 1;
			if (layerRef.current) {
				let base64 = layerRef.current.toDataURL({ pixelRatio: pixelRatio / scale.value, mimeType: "image/jpeg" });
				return base64
			} else {
				toast({
					title: "Download Error",
					description: "Please wait while the canvas is loading",
					status: "error",
					duration: 10000,
					isClosable: true,
					position: "top-right",
				});
			}
			return null
        }
    }))

	const reDrawChildren = () => {
		if (layerRef?.current) {
			let { height, width } = prevBounds.get();
			Object.keys(elementsData).forEach((element) => {
				if (height > 0 && width > 0) {
					let factorX = konvaBounds.width.get() / width;
					let factorY = konvaBounds.height.get() / height;
					// @ts-ignore
					let attrs = elementsData[element].data;
					attrs.merge({ x: attrs.x.value * factorX, y: attrs.y.value * factorY });
					if ("fontSize" in attrs) attrs.fontSize.set(attrs.fontSize.value * factorX);

					if ("size" in attrs) attrs.merge({ size: attrs.size.value * factorX });

					// @ts-ignore
					if ("width" in attrs) attrs.merge({ width: attrs.width.value * factorX });
					// @ts-ignore
					if ("height" in attrs) attrs.merge({ height: attrs.height.value * factorY });
				}
			});
			// update the previous bounds of the board
			prevBounds.set({ ...konvaBounds.get() });
		}
	};

	const initRenderSizing = () => {
		if (loader.value) return;
		// @ts-ignore
		if (!configData.value.rendered_dimensions) return;
		// @ts-ignore
		scale.set(konvaBounds.value.height / configData.value?.rendered_dimensions.height);

		if (layerRef?.current) {
			Object.keys(elementsData).forEach((element) => {
				// @ts-ignore
				let attrs = elementsData[element].data;
				attrs.merge({ x: attrs.x.value * scale.value, y: attrs.y.value * scale.value });
				if ("fontSize" in attrs) attrs.fontSize.set(attrs.fontSize.value * scale.value);

				if ("size" in attrs) attrs.merge({ size: attrs.size.value * scale.value });

				// @ts-ignore
				if ("width" in attrs) attrs.merge({ width: attrs.width.value * scale.value });
				// @ts-ignore
				if ("height" in attrs) attrs.merge({ height: attrs.height.value * scale.value });
			});
			loader.set(true);
		}
	};

	const initKonvaSize = () => {
		let bounds = document.getElementById("preview_certificate")?.getBoundingClientRect();
		if (bounds) canvasBounds.set(bounds);
		if (canvasBounds && bgImgBounds) {
			// resize the canvas according to the image dimensions
			if (canvasBounds?.width.get() - bgImgBounds?.width.get() < canvasBounds.height.get() - bgImgBounds.height.get()) {
				konvaBounds.merge({
					height: (bgImgBounds.height.get() * canvasBounds.width.get()) / bgImgBounds.width.get(),
					width: canvasBounds.width.get(),
				});
			} else {
				konvaBounds.merge({
					height: canvasBounds.height.get(),
					width: (bgImgBounds.width.get() * canvasBounds.height.get()) / bgImgBounds.height.get(),
				});
			}
			// center align the canvas
			konvaBounds.merge({
				top: Math.abs(canvasBounds.height.get() - konvaBounds.height.get()) / 2,
				left: Math.abs(canvasBounds.width.get() - konvaBounds.width.get()) / 2,
			});
		}

		initRenderSizing();

		// redraw elements
		reDrawChildren();
	};

	const jugad = () => {
		Object.keys(elementsData).forEach((element) => {
			// @ts-ignore
			let attrs = elementsData[element].data;
			// @ts-ignore
			if (elementsData[element]['type'].value === 'text') {
				let realWidth = attrs.width.value
				attrs.width.set(realWidth - 1)
				attrs.width.set(realWidth)
			}
		});
		loader.set(true);
	}

	const handleImageLoaded = (width: number, height: number) => {
		setImage(imageRef.current);

		// bgImgBounds.set({ height: image?.height || 0, width: image?.width || 0 });
		bgImgBounds.set({ height: height || 0, width: width || 0 });
		isLoading.set(false);
		initKonvaSize();
		setTimeout(() => {
			//jugad
			jugad()
		}, 100);
	};

	const loadImage = () => {
		const img = new window.Image();
		img.src = bg;
		img.crossOrigin = "Anonymous";
		imageRef.current = img;
		imageRef.current.addEventListener("load", () => {
			handleImageLoaded(img.width, img.height);
		});
	};

	useEffect(() => {
		loadImage();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [bg]);

	useEffect(() => {
		window.onresize = () => {
			// clearTimeout(resizeTimeout);
			// resizeTimeout = setTimeout(initKonvaSize, 10);
			initKonvaSize();
		};
		return () => {
			window.onresize = null;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return !isLoading.get() && image ? (
		<>
			<Stage
				height={konvaBounds.height.get()}
				width={konvaBounds.width.get()}
				style={{ position: "absolute", marginLeft: konvaBounds.left.get(), marginTop: konvaBounds.top.get() }}>
				{imageURL.get().length > 0 && (
					<Layer ref={layerRef}>
						{/* Background Image should be the first element in this layer */}
						<Image height={konvaBounds.height.get()} width={konvaBounds.width.get()} image={image} />
						<DrawingSheet elementsData={elementsData} imageElementsHolder={imageElementsHolder} isWhiteLabeled={isWhiteLabeled} orgConfig={orgConfig} />
					</Layer>
				)}
			</Stage>
		</>
	) : (
		<Stack>
			<Skeleton height='75vh' />
		</Stack>
	);
});

export default PreviewCertificate;
