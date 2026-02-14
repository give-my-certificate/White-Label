import React from "react";
import { Rect } from "react-konva";

export interface RectProps {
	id?: string;
	x: number;
	y: number;
	width: number;
	height: number;
	fill: string;
	stroke?: string;
	strokeWidth?: number;
}

export interface Props {
	attrs: RectProps;
}

const RectangleShape: React.FC<Props> = ({ attrs }) => {
	return <Rect {...attrs} />;
};

export default RectangleShape;
