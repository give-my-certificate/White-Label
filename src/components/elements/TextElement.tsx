import React from "react";
import { Text } from "react-konva";

export interface TextProps {
	id?: string;
	x: number;
	y: number;
	fill: string;
	text: string;
	fontSize: number;
	width?: number;
	height?: number;
	stroke?: string;
	strokeWidth?: number;
	align?: string;
	fontStyle?: string;
	textDecoration?: string;
	fontFamily?: string;
}

export interface Props {
	attrs: TextProps;
}

const TextElement: React.FC<Props> = ({ attrs }) => {
	return <Text {...attrs} />;
};

export default TextElement;
