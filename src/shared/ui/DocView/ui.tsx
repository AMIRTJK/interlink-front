import React, { useState } from "react";
import { pdfjs } from 'react-pdf';
import { IDocFile, IDocView } from "./model";
import { DocPreview } from "./ui/Viewer";
import { DocSidebar } from "./ui/Sidebar";
import './style.css';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
export const DocView: React.FC<IDocView> = ({ files = [] }) => {
    const [activeFile, setActiveFile] = useState(files[0] || null);

  const mockFiles: IDocFile[] = [
    { id: 1, name: 'Договор.pdf', url: '/files/contract.pdf', type: 'pdf' },
    { id: 2, name: 'Смета.xls', url: '/files/budget.xls', type: 'xls' },
    { id: 3, name: 'Инструкция.doc', url: '/files/manual.doc', type: 'doc' },
];
    return (
        <div className="docView__content">
            {/* Левая часть */}
            <DocPreview 
                fileUrl={mockFiles[0].url} 
                docName={mockFiles[0].name} 
            />

            {/* Правая часть */}
            <DocSidebar 
                files={mockFiles} 
                activeFileId={activeFile?.id} 
                onFileSelect={setActiveFile} 
            />
        </div>
    );
};