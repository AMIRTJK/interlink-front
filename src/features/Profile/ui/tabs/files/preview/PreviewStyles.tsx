export const PreviewStyles = () => {
	const styles = `
    .file-preview-paper {
      background: white;
      color: #000;
      width: 100%;
      text-align: left;
    }
    .file-preview-paper.doc-mode {
      font-family: "Times New Roman", serif;
      line-height: 1.5;
    }
    .file-preview-paper.doc-mode p {
      margin-bottom: 12px;
    }
    .file-preview-paper.doc-mode table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
    }
    .file-preview-paper.doc-mode td,
    .file-preview-paper.doc-mode th {
      border: 1px solid #000;
      padding: 4px;
    }
    .file-preview-paper.xls-mode {
      font-family: Arial, sans-serif;
      font-size: 12px;
    }
    .file-preview-paper.xls-mode table {
      border-collapse: collapse;
      width: 100%;
    }
    .file-preview-paper.xls-mode td,
    .file-preview-paper.xls-mode th {
      border: 1px solid #ccc;
      padding: 5px;
      white-space: nowrap;
    }
    .file-preview-paper.xls-mode th {
      background: #f0fdf4;
      font-weight: bold;
      color: #166534;
      text-align: center;
    }
    .file-preview-text {
      white-space: pre-wrap;
      word-break: break-all;
      font-family: monospace;
      font-size: 13px;
    }
  `;

	return <style dangerouslySetInnerHTML={{ __html: styles }} />;
};
