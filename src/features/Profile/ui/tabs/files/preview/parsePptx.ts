import { IPptxSlide } from "./types";
import { fetchFileBuffer } from "./lib";

export const parsePptx = async (
	url: string,
	originalName: string,
): Promise<IPptxSlide[]> => {
	const response = await fetchFileBuffer(url, "blob");
	const arrayBuffer = await response.data.arrayBuffer();

	try {
		const JSZip = (await import("jszip")).default;
		const zip = await JSZip.loadAsync(arrayBuffer);
		const slideFiles = Object.keys(zip.files).filter((fileName) =>
			/^ppt\/slides\/slide\d+\.xml$/i.test(fileName),
		);

		slideFiles.sort((a, b) => {
			const numA = parseInt(a.match(/\d+/)?.[0] || "0", 10);
			const numB = parseInt(b.match(/\d+/)?.[0] || "0", 10);
			return numA - numB;
		});

		const slides: IPptxSlide[] = [];
		const parser = new DOMParser();

		for (let i = 0; i < slideFiles.length; i++) {
			const xmlStr = await zip.file(slideFiles[i])?.async("string");
			if (xmlStr) {
				const xmlDoc = parser.parseFromString(xmlStr, "application/xml");
				const textNodes = Array.from(xmlDoc.getElementsByTagName("a:t"));
				const slideTexts = textNodes
					.map((node) => node.textContent?.trim() || "")
					.filter(Boolean);
				const title = slideTexts[0] || `Слайд ${i + 1}`;
				const bodyTexts = slideTexts.slice(1);
				slides.push({
					slideNumber: i + 1,
					title,
					texts: bodyTexts,
				});
			}
		}

		if (slides.length > 0) {
			return slides;
		}
		return [
			{
				slideNumber: 1,
				title: originalName,
				texts: ["Презентация PowerPoint"],
			},
		];
	} catch (e) {
		console.error("PPTX parse failed", e);
		return [
			{
				slideNumber: 1,
				title: originalName,
				texts: ["Не удалось извлечь содержимое слайдов"],
			},
		];
	}
};
