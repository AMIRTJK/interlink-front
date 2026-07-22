import {
	FileText,
	FileSpreadsheet,
	Presentation,
	Video,
	Image as ImageIcon,
	Archive,
} from "lucide-react";

interface IProps {
	type: string;
}

export const FormatIcon = ({ type }: IProps) => {
	const iconSize = 48;

	switch (type) {
		case "pdf":
			return <FileText size={iconSize} className="text-red-500!" />;
		case "spreadsheet":
			return <FileSpreadsheet size={iconSize} className="text-green-500!" />;
		case "presentation":
			return <Presentation size={iconSize} className="text-amber-500!" />;
		case "video":
			return <Video size={iconSize} className="text-violet-500!" />;
		case "image":
			return <ImageIcon size={iconSize} className="text-rose-500!" />;
		case "archive":
			return <Archive size={iconSize} className="text-amber-500!" />;
		case "document":
		default:
			return <FileText size={iconSize} className="text-blue-500!" />;
	}
};
