import { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { FileItem, FILES } from "./bookModalModel";
import { renderDOCXBuffer, renderXLSBuffer } from "./documentRenderers";
import { useBookDragAndZoom } from "./useBookDragAndZoom";

// Подключение воркера
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export const useBookDocumentViewer = (isOpen: boolean) => {
  const [activeClass, setActiveClass] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [noPerspective, setNoPerspective] = useState(false);

  const [currentFile, setCurrentFile] = useState<FileItem>(FILES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [htmlContent, setHtmlContent] = useState<string>("");

  const wrapperRef = useRef<HTMLDivElement>(null);

  const {
    scale,
    setScale,
    zoomInput,
    viewportRef,
    adjustZoom,
    handleZoomInputChange,
    commitZoom,
    handleZoomInputKeyDown,
    handleMouseDown,
    stopDrag,
    handleMouseMove,
  } = useBookDragAndZoom();

  // Блокировка скролла body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const loadViewer = async (file: FileItem) => {
    setIsLoading(true);
    setError(null);
    setHtmlContent("");
    setPdfDoc(null);
    setPageNum(1);
    setScale(1.0);

    const existingCanvas = wrapperRef.current?.querySelector("canvas");
    if (existingCanvas) {
      existingCanvas.remove();
    }

    try {
      const response = await fetch(file.url);
      if (!response.ok) throw new Error("Ошибка сети");
      const buffer = await response.arrayBuffer();

      if (file.type === "pdf") {
        await renderPDF(buffer);
      } else if (file.type === "doc") {
        const content = await renderDOCXBuffer(buffer);
        setHtmlContent(content);
      } else if (file.type === "xls") {
        const content = renderXLSBuffer(buffer);
        setHtmlContent(content);
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Неизвестная ошибка загрузки");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderPDF = async (data: ArrayBuffer) => {
    try {
      const doc = await pdfjsLib.getDocument(data).promise;
      setPdfDoc(doc);
      setTotalPages(doc.numPages);
      setPageNum(1);

      const page = await doc.getPage(1);
      if (viewportRef.current) {
        const containerWidth = viewportRef.current.clientWidth - 40;
        const unscaledViewport = page.getViewport({ scale: 1 });
        const fitScale = containerWidth / unscaledViewport.width;
        setScale(Math.floor(fitScale * 100) / 100);
      }
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof Error) {
        setError(`Ошибка PDF: ${e.message}`);
      }
    }
  };

  // Анимация открытия
  useEffect(() => {
    let t1: NodeJS.Timeout;
    let t2: NodeJS.Timeout;

    if (isOpen) {
      setActiveClass(true);
      setNoPerspective(false);

      setCurrentFile(FILES[0]);
      setPageNum(1);
      setScale(1.0);

      void loadViewer(FILES[0]);

      t1 = setTimeout(() => {
        setCardOpen(true);
        t2 = setTimeout(() => setNoPerspective(true), 1000);
      }, 700);
    } else {
      setNoPerspective(false);
      t1 = setTimeout(() => setCardOpen(false), 50);
      t2 = setTimeout(() => {
        setActiveClass(false);
        setPdfDoc(null);
        setHtmlContent("");
        if (wrapperRef.current) wrapperRef.current.innerHTML = "";
      }, 1000);
    }
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!pdfDoc) return;

    let isCancelled = false;
    const renderPage = async () => {
      try {
        const page: PDFPageProxy = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.id = "pdfCanvas";
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        if (wrapperRef.current) {
          wrapperRef.current.innerHTML = "";
          wrapperRef.current.appendChild(canvas);
        }

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        await page.render(renderContext as never).promise;

        if (!isCancelled) updateAlignment();
      } catch (err) {
        console.error("Render error:", err);
      }
    };

    void renderPage();

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, pageNum, scale]);

  const updateAlignment = () => {
    if (wrapperRef.current && viewportRef.current) {
      if (wrapperRef.current.scrollWidth > viewportRef.current.clientWidth) {
        viewportRef.current.style.alignItems = "flex-start";
      } else {
        viewportRef.current.style.alignItems = "center";
      }
    }
  };

  useEffect(() => {
    if (currentFile.type !== "pdf" && wrapperRef.current) {
      wrapperRef.current.style.zoom = String(scale);
      updateAlignment();
    }
  }, [scale, currentFile.type, htmlContent]);

  const changePage = (delta: number) => {
    if (!pdfDoc) return;
    const newPage = pageNum + delta;
    if (newPage >= 1 && newPage <= totalPages) {
      setPageNum(newPage);
    }
  };

  const downloadCurrentFile = () => {
    const link = document.createElement("a");
    link.href = currentFile.url;
    link.download =
      currentFile.type === "pdf"
        ? "doc.pdf"
        : currentFile.type === "doc"
          ? "doc.docx"
          : "table.xlsx";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = (file: FileItem) => {
    if (currentFile.type !== file.type) {
      setCurrentFile(file);
      void loadViewer(file);
    }
  };

  return {
    activeClass,
    cardOpen,
    noPerspective,
    currentFile,
    isLoading,
    error,
    pageNum,
    totalPages,
    zoomInput,
    htmlContent,
    viewportRef,
    wrapperRef,
    changePage,
    adjustZoom,
    handleZoomInputChange,
    commitZoom,
    handleZoomInputKeyDown,
    downloadCurrentFile,
    handleFileSelect,
    handleMouseDown,
    stopDrag,
    handleMouseMove,
  };
};
