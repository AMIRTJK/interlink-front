import React, { useState } from "react";
import { Document, Page } from 'react-pdf';

interface IDocViewerProps {
    fileUrl?: string;
    docName?: string;
}

export const DocPreview: React.FC<IDocViewerProps> = ({ fileUrl, docName }) => {
    const [numPages, setNumPages] = useState<number | null>(null);

    return (
        <div className="docView__left">
            <div className="docView__left-header">
                <h3>{docName || 'Название документа'}</h3>
            </div>
            <div className="docView__preview">
                {fileUrl ? (
                    <Document
                        file={fileUrl}
                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                    >
                        {Array.from(new Array(numPages), (_, i) => (
                            <Page key={i} pageNumber={i + 1} width={800} />
                        ))}
                    </Document>
                ) : (
                    <div className="preview-stub">Файл не выбран</div>
                )}
            </div>
        </div>
    );
};