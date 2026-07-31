import mammoth from "mammoth";
import * as XLSX from "xlsx";

export const renderDOCXBuffer = async (data: ArrayBuffer): Promise<string> => {
  const result = await mammoth.convertToHtml({ arrayBuffer: data });
  return (
    result.value ||
    "<p style='text-align:center'>Пустой документ или не удалось распознать содержимое</p>"
  );
};

export const renderXLSBuffer = (data: ArrayBuffer): string => {
  const workbook = XLSX.read(data, { type: "array" });
  if (workbook.SheetNames.length > 0) {
    const sheetName = workbook.SheetNames[0];
    return XLSX.utils.sheet_to_html(workbook.Sheets[sheetName]);
  }
  return "<p>Пустой Excel файл</p>";
};
