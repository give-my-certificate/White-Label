// @ts-nocheck
import React, { useRef, useEffect } from "react";
import { Encoder, ErrorCorrectionLevel } from "@nuintun/qrcode";

const OGCertificate = ({ configData, elementsData, bg }) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	const resizeCertificate = (context: CanvasRenderingContext2D) => {
		if (canvasRef.current) {
			canvasRef.current.height = configData.actual_dimensions.height;
			canvasRef.current.width = configData.actual_dimensions.width;
			initCertificate(context);
		}
	};

	const initCertificate = (context: CanvasRenderingContext2D) => {
		let bgImg = new Image();
		bgImg.crossOrigin = "anonymous";
		bgImg.src = bg;
		bgImg.onload = function () {
			context.drawImage(bgImg, 0, 0, configData.actual_dimensions.width, configData.actual_dimensions.height);
			drawElements(context);
		};
	};

	const drawElements = (context: CanvasRenderingContext2D) => {
		const scaleFactor = configData.actual_dimensions.height / configData.rendered_dimensions.height;
		context.imageSmoothingEnabled = false;
		const qr = new Encoder();
		qr.setEncodingHint(true);
		qr.write(elementsData.gmc_link.data.text);
		qr.setErrorCorrectionLevel(ErrorCorrectionLevel.H);
		qr.make();

		Object.keys(elementsData).forEach((key: string) => {
			let element = elementsData[key];
			if (element.type === "text") {
				let textData = element.data;
				// TODO: fix textAlign
				// context.textAlign = textData.align;
				// let textWidth = context.measureText(textData.text).width;
				context.fillStyle = textData.fill;
				context.font = `${scaleFactor * textData.fontSize}px ${textData.fontFamily}`;
				context.fillText(textData.text, scaleFactor * textData.x, scaleFactor * textData.y);
			} else if (element.type === "qr") {
				let qrData = element.data;
				let qrImg = new Image();
				qrImg.crossOrigin = "anonymous";
				qrImg.src = qr.toDataURL();
				qrImg.onload = function () {
					context.drawImage(qrImg, scaleFactor * qrData.x, scaleFactor * qrData.y, scaleFactor * qrData.size, scaleFactor * qrData.size);
				};
			}
		});
	};

	useEffect(() => {
		if (canvasRef.current) {
			const context = canvasRef.current.getContext("2d");
			if (context) resizeCertificate(context);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return <canvas id='ogCertificateCanvas' ref={canvasRef} height={500} width={500} hidden />;
};

export default OGCertificate;
