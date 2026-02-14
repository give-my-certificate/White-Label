// @ts-nocheck
import React, { useRef, useEffect } from "react";
import { Encoder, ErrorCorrectionLevel } from "@nuintun/qrcode";

const PreviewCertificate = ({ configData, elementsData, bg }) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	console.log('jjjjjj');
	

	const resizeCertificate = () => {
		if (canvasRef.current) {
			canvasRef.current.height = configData.rendered_dimensions.height;
			canvasRef.current.width = configData.rendered_dimensions.width;
		}
	};

	const drawElements = (context: CanvasRenderingContext2D) => {
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
				context.textAlign = textData.align;
				// let textWidth = context.measureText(textData.text).width;
				context.fillStyle = textData.fill;
				context.font = `${textData.fontSize}px ${textData.fontFamily}`;
				context.fillText(textData.text, textData.x, textData.y);
			} else if (element.type === "qr") {
				let qrData = element.data;
				let qrImg = new Image();
				qrImg.crossOrigin = "anonymous";
				qrImg.src = qr.toDataURL();
				qrImg.onload = function () {
					context.drawImage(qrImg, qrData.x, qrData.y, qrData.size, qrData.size);
				};
			}
		});
	};

	const initCertificate = (context: CanvasRenderingContext2D) => {
		let bgImg = new Image();
		bgImg.crossOrigin = "anonymous";
		bgImg.src = bg;
		bgImg.onload = function () {
			context.drawImage(bgImg, 0, 0, configData.rendered_dimensions.width, configData.rendered_dimensions.height);
			drawElements(context);
		};
	};

	useEffect(() => {
		const canvas = canvasRef.current;
		const context = canvas ? canvas.getContext("2d") : null;
		if (context) {
			resizeCertificate();
			initCertificate(context);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return <canvas id='certificateCanvas' ref={canvasRef} height={500} width={500} style={{ maxHeight: "100%" }} />;
};

export default PreviewCertificate;
