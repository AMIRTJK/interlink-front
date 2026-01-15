import "./style.css";
import React, { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

import downLoadLetterIcon from "../../assets/icons/dowload-letter-icon.svg";
import downloadAllFilesIcon from "../../assets/icons/download-all-files-icon.svg";
import pdfIcon from "../../assets/icons/pdf-icon.svg";
import xlsIcon from "../../assets/icons/xls-icon.svg";
import docIcon from "../../assets/icons/doc-icon.svg";
import { If, Breadcrumbs } from "@shared/ui";
import { ResolutionOfLetter } from "@widgets/ResolutionOfLetter";

// Подключение воркера
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

type FileType = "pdf" | "doc" | "xls";

interface FileItem {
  type: FileType;
  name: string;
  url: string;
  iconSrc: string;
}

const FILES: FileItem[] = [
  {
    type: "pdf",
    name: "Документ.pdf",
    url: "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
    iconSrc: pdfIcon,
  },
  {
    type: "xls",
    name: "Таблица.xls",
    url: "https://sheetjs.com/pres.xlsx",
    iconSrc: xlsIcon,
  },
  {
    type: "doc",
    name: "Письмо.doc",
    url: "https://raw.githubusercontent.com/open-xml-templating/docxtemplater/master/examples/tag-example.docx",
    iconSrc: docIcon,
  },
];

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  footerPhone?: string;
  coverTitle?: React.ReactNode;
  coverSubtitle?: React.ReactNode;
  coverLogoSrc?: string;
}

interface DragInfo {
  isDown: boolean;
  startX: number;
  startY: number;
  scrollLeft: number;
  scrollTop: number;
}

export const BookModal: React.FC<BookModalProps> = ({
  isOpen,
  onClose,
  footerPhone = "тел: 1310 - 1334",
  coverTitle = (
    <>
      ВАЗОРАТИ МОЛИЯИ
      <br />
      ҶУМҲУРИИ ТОҶИКИСТОН
    </>
  ),
  coverSubtitle = (
    <>
      КОРХОНАИ ВОҲИДИ ДАВЛАТИИ
      <br />
      «МАРКАЗИ ТЕХНОЛОГИЯҲОИ
      <br />
      ИТТИЛООТИИ МОЛИЯВӢ»
    </>
  ),
  coverLogoSrc = "https://upload.wikimedia.org/wikipedia/commons/9/9f/Emblem_of_Tajikistan.svg",
}) => {
  const [isLetterExecutionVisible, setIsLetterExecutionVisible] =
    useState(false);
  const [activeClass, setActiveClass] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [noPerspective, setNoPerspective] = useState(false);

  const [currentFile, setCurrentFile] = useState<FileItem>(FILES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Строгая типизация для PDF документа
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [zoomInput, setZoomInput] = useState("100");
  const [htmlContent, setHtmlContent] = useState<string>("");

  const viewportRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const dragInfo = useRef<DragInfo>({
    isDown: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

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
        await renderDOCX(buffer);
      } else if (file.type === "xls") {
        await renderXLS(buffer);
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

  const renderDOCX = async (data: ArrayBuffer) => {
    try {
      const result = await mammoth.convertToHtml({ arrayBuffer: data });
      const content =
        result.value ||
        "<p style='text-align:center'>Пустой документ или не удалось распознать содержимое</p>";
      setHtmlContent(content);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(`Ошибка DOCX: ${e.message}`);
      }
    }
  };

  const renderXLS = (data: ArrayBuffer) => {
    try {
      const workbook = XLSX.read(data, { type: "array" });
      if (workbook.SheetNames.length > 0) {
        const sheetName = workbook.SheetNames[0];
        const html = XLSX.utils.sheet_to_html(workbook.Sheets[sheetName]);
        setHtmlContent(html);
      } else {
        setHtmlContent("<p>Пустой Excel файл</p>");
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(`Ошибка XLS: ${e.message}`);
      }
    }
  };

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

  useEffect(() => {
    setZoomInput(String(Math.round(scale * 100)));
  }, [scale]);

  const adjustZoom = (delta: number) => {
    let newPercent = Math.round(scale * 10) * 10;
    newPercent += delta * 100;
    if (newPercent < 20) newPercent = 20;
    if (newPercent > 300) newPercent = 300;
    setScale(newPercent / 100);
  };

  // Просто обновляем текст при вводе (разрешаем пустую строку и любые цифры)
  const handleZoomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoomInput(e.target.value);
  };

  // Валидируем и применяем масштаб только при завершении ввода
  const commitZoom = () => {
    let percent = parseInt(zoomInput);

    if (isNaN(percent)) {
      // Если ввели чушь, возвращаем текущий реальный масштаб
      setZoomInput(String(Math.round(scale * 100)));
      return;
    }

    // Ограничиваем диапазон
    if (percent < 20) percent = 20;
    if (percent > 300) percent = 300;

    setScale(percent / 100);
    setZoomInput(String(percent)); // Форматируем инпут красиво
  };

  // Обработка нажатия Enter
  const handleZoomInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      commitZoom();
      (e.target as HTMLInputElement).blur(); // Убираем фокус
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

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (
      clientX > viewportRef.current.clientWidth ||
      clientY > viewportRef.current.clientHeight
    )
      return;

    dragInfo.current = {
      isDown: true,
      startX: e.pageX - viewportRef.current.offsetLeft,
      startY: e.pageY - viewportRef.current.offsetTop,
      scrollLeft: viewportRef.current.scrollLeft,
      scrollTop: viewportRef.current.scrollTop,
    };
    viewportRef.current.classList.add("grabbing");
    document.body.style.userSelect = "none";
  };

  const stopDrag = () => {
    dragInfo.current.isDown = false;
    if (viewportRef.current) viewportRef.current.classList.remove("grabbing");
    document.body.style.userSelect = "";
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!viewportRef.current) return;

    const rect = viewportRef.current.getBoundingClientRect();
    const isOverScroll =
      e.clientX - rect.left > viewportRef.current.clientWidth ||
      e.clientY - rect.top > viewportRef.current.clientHeight;
    viewportRef.current.style.cursor = isOverScroll
      ? "default"
      : dragInfo.current.isDown
        ? "grabbing"
        : "grab";

    if (!dragInfo.current.isDown) return;
    e.preventDefault();
    const x = e.pageX - viewportRef.current.offsetLeft;
    const y = e.pageY - viewportRef.current.offsetTop;
    const walkX = x - dragInfo.current.startX;
    const walkY = y - dragInfo.current.startY;
    viewportRef.current.scrollLeft = dragInfo.current.scrollLeft - walkX;
    viewportRef.current.scrollTop = dragInfo.current.scrollTop - walkY;
  };

  const isPdf = currentFile.type === "pdf";

  return (
    <>
      <div
        className={`modal-overlay ${activeClass ? "active" : ""}`}
        id="modalOverlay"
      >
        <div
          className={`book-card ${cardOpen ? "is-open" : ""} ${noPerspective ? "no-perspective" : ""}`}
          id="bookCard"
        >
          {/* ЛЕВАЯ ЧАСТЬ */}
          <div className="cover">
            <div className="face front">
              {/* ДИНАМИЧЕСКИЙ ЗАГОЛОВОК */}
              <div className="cover-header">{coverTitle}</div>

              {/* ДИНАМИЧЕСКИЙ ПОДЗАГОЛОВОК */}
              <div className="cover-subheader">{coverSubtitle}</div>

              {/* ДИНАМИЧЕСКИЙ ЛОГОТИП */}
              <img src={coverLogoSrc} alt="Emblem" className="cover-emblem" />

              {/* ФУТЕР */}
              <div className="cover-footer">
                <div className="cover-footer-line"></div>
                <div className="cover-footer-text">{footerPhone}</div>
              </div>
            </div>

            <div className="face back">
              <div className="modal-header-half">
                <div className="modal-title">Документ от Название компании</div>
              </div>
              <div className="body-half body-left">
                <div
                  className="viewer-viewport"
                  id="viewport"
                  ref={viewportRef}
                  onMouseDown={handleMouseDown}
                  onMouseLeave={stopDrag}
                  onMouseUp={stopDrag}
                  onMouseMove={handleMouseMove}
                >
                  <div id="viewerWrapper" ref={wrapperRef}>
                    {isLoading && <div className="loader"></div>}
                    {error && (
                      <div
                        style={{
                          color: "red",
                          padding: "30px",
                          textAlign: "center",
                        }}
                      >
                        {error}
                      </div>
                    )}

                    {!isPdf && htmlContent && (
                      <div
                        className={`rendered-paper ${currentFile.type === "doc" ? "doc-mode" : "xls-mode"}`}
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                      />
                    )}
                  </div>
                </div>

                {/* ПАНЕЛЬ УПРАВЛЕНИЯ */}
                <div className="floating-controls">
                  <div className="ctrl-group">
                    <button
                      className="ctrl-btn"
                      disabled={!isPdf || pageNum <= 1}
                      onClick={() => changePage(-1)}
                    >
                      <svg
                        className="icon-svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </button>
                    <span
                      className="ctrl-val"
                      style={{ opacity: isPdf ? 1 : 0.5 }}
                    >
                      {isPdf ? `${pageNum} / ${totalPages}` : "- / -"}
                    </span>
                    <button
                      className="ctrl-btn"
                      disabled={!isPdf || pageNum >= totalPages}
                      onClick={() => changePage(1)}
                    >
                      <svg
                        className="icon-svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  </div>
                  <div className="ctrl-sep"></div>

                  <div className="ctrl-group">
                    <button
                      className="ctrl-btn"
                      onClick={() => adjustZoom(-0.1)}
                    >
                      <svg
                        className="icon-svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                    <div className="zoom-input-wrapper">
                      <input
                        type="number"
                        className="zoom-input"
                        value={zoomInput} // Используем локальный стейт
                        min="20"
                        max="300"
                        onChange={handleZoomInputChange} // Просто ввод
                        onBlur={commitZoom} // Применение при потере фокуса (клик вне поля)
                        onKeyDown={handleZoomInputKeyDown} // Применение по Enter
                      />
                      <span className="zoom-percent-sign">%</span>
                    </div>
                    <button
                      className="ctrl-btn"
                      onClick={() => adjustZoom(0.1)}
                    >
                      <svg
                        className="icon-svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ПРАВАЯ ЧАСТЬ */}
          <div className="content">
            <div className="modal-header-half">
              {/* <Breadcrumbs 
                items={[{ label: 'Документ', isActive: true }]} 
                style={{ marginLeft: '24px' }}
              /> */}
              <button className="close-btn" onClick={onClose}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13 1L1 13M1 1L13 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="body-half body-right">
              <div className="section-title">Вложения</div>
              <div className="action-links">
                <a onClick={downloadCurrentFile} className="action-link">
                  <img
                    src={downLoadLetterIcon}
                    alt="Download Letter"
                    width="18"
                    height="18"
                  />
                  Скачать письмо
                </a>
                <a onClick={downloadCurrentFile} className="action-link">
                  <img
                    src={downloadAllFilesIcon}
                    alt="Download All"
                    width="18"
                    height="18"
                  />
                  Скачать все файлы
                </a>
              </div>

              <div className="attachments-grid">
                {FILES.map((file, idx) => (
                  <div
                    key={idx}
                    className={`file-card ${currentFile.type === file.type ? "active" : ""}`}
                    onClick={() => handleFileSelect(file)}
                  >
                    <div
                      className="file-icon"
                      style={{ background: "transparent" }}
                    >
                      <img
                        src={file.iconSrc}
                        alt={file.type}
                        style={{ width: "36px", height: "36px" }}
                      />
                    </div>
                    <div className="file-name">{file.name}</div>
                  </div>
                ))}
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline-red" onClick={onClose}>
                  Отказать
                </button>
                <button className="btn btn-outline-blue">Ознакомлен</button>
                <button
                  onClick={() => setIsLetterExecutionVisible(true)}
                  className="btn btn-solid-blue"
                >
                  Создать визу
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <If is={isLetterExecutionVisible}>
        <ResolutionOfLetter
          isLetterExecutionVisible={isLetterExecutionVisible}
          setIsLetterExecutionVisible={setIsLetterExecutionVisible}
        />
      </If>
    </>
  );
};
