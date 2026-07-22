import { IApiFile } from "../lib";

export interface IPptxSlide {
	slideNumber: number;
	title: string;
	texts: string[];
}

export interface IExcelSheet {
	name: string;
	html: string;
}

export type TPreviewType =
	| "image"
	| "pdf"
	| "html-doc"
	| "html-xls"
	| "pptx"
	| "video"
	| "text"
	| "none";

export interface IPreviewModalProps {
	file: IApiFile | null;
	onClose: () => void;
	unavailableNotice?: string;
}
