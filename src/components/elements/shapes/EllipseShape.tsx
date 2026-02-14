import React from "react";
import { Ellipse } from "react-konva";

export interface EllipseProps {
	id?: string;
	x: number;
	y: number;
	radiusX: number;
	radiusY: number;
	width?: number;
	height?: number;
	fill: string;
	stroke?: string;
	strokeWidth?: number;
}

export interface Props {
	attrs: EllipseProps;
}

const EllipseShape: React.FC<Props> = ({ attrs }) => {
	return <Ellipse {...attrs} />;
};

export default EllipseShape;
