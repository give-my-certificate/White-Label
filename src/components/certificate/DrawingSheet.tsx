import React from "react";
import { useState, State } from "@hookstate/core";
import RectangleShape, { RectProps } from "../elements/shapes/RectangleShape";
import EllipseShape, { EllipseProps } from "../elements/shapes/EllipseShape";
import TextElement, { TextProps } from "../elements/TextElement";
import QrElement, { QrProps } from "../elements/QrElement";
import ImageElement, { ImageProps } from "../elements/ImageElement";
import { ImageElementsHolderType } from "../../pages/displayCertificate/DisplayCertificate";
import { OrganizationConfig } from "../../types/OrganizationConfig";

export interface ElementType {
	type: string;
	data: RectProps | EllipseProps | TextProps | QrProps;
	header: string;
	required?: boolean;
	auto?: boolean;
}
export interface ElementsType {
	[id: string]: { type: string; data: RectProps | EllipseProps | TextProps | QrProps; header: string; required?: boolean; auto?: boolean };
}

interface Props {
	elementsData: State<ElementsType | null>;
	isWhiteLabeled?: boolean;
	imageElementsHolder?: ImageElementsHolderType
	orgConfig?: OrganizationConfig | null
}

const DrawingSheet: React.FC<Props> = ({ elementsData, imageElementsHolder, isWhiteLabeled=false, orgConfig }) => {
	const elements = useState<ElementsType | null>(elementsData);

	return (
		<>
			{Object.keys(elements).map((key) => {
				// @ts-ignore
				let element = elements[key];
				switch (element.type.get()) {
					default:
						return <></>;
					case "rect":
						return <RectangleShape key={key} attrs={{ ...element.data.get(), id: key } as RectProps} />;
					case "ellipse":
						return <EllipseShape key={key} attrs={{ ...element.data.get(), id: key } as EllipseProps} />;
					case "text":
						return <TextElement key={key} attrs={{ ...element.data.get(), id: key } as TextProps} />;
					case "qr":
						return <QrElement key={key} elementProps={element.get()} url={element.data.url.get()} attrs={{ ...element.data.get(), id: key } as QrProps} isWhiteLabeled={isWhiteLabeled} orgConfig={orgConfig} />;
					case "image":
						return (
							<ImageElement
								key={key}
								attrs={{ ...element.data.get(), id: key } as ImageProps}
								url={element.data.url.get()}
								img={(imageElementsHolder)?imageElementsHolder[key]:null}
							/>
						);
				}
			})}
		</>
	);
};

export default DrawingSheet;
