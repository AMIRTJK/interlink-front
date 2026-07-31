import "./style.css";
import React from "react";
import { BookModalProps } from "./bookModal/bookModalModel";
import { useBookDocumentViewer } from "./bookModal/useBookDocumentViewer";
import { BookCoverFront } from "./bookModal/BookCoverFront";
import { BookControls } from "./bookModal/BookControls";
import { BookRightPanel } from "./bookModal/BookRightPanel";

export const BookModal: React.FC<BookModalProps> = ({
  isOpen,
  onClose,
  toNavigate,
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
  const {
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
  } = useBookDocumentViewer(isOpen);

  const isPdf = currentFile.type === "pdf";

  return (
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
          <BookCoverFront
            coverTitle={coverTitle}
            coverSubtitle={coverSubtitle}
            coverLogoSrc={coverLogoSrc}
            footerPhone={footerPhone}
          />

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
              <BookControls
                isPdf={isPdf}
                pageNum={pageNum}
                totalPages={totalPages}
                changePage={changePage}
                zoomInput={zoomInput}
                adjustZoom={adjustZoom}
                handleZoomInputChange={handleZoomInputChange}
                commitZoom={commitZoom}
                handleZoomInputKeyDown={handleZoomInputKeyDown}
              />
            </div>
          </div>
        </div>

        {/* ПРАВАЯ ЧАСТЬ */}
        <BookRightPanel
          currentFile={currentFile}
          onFileSelect={handleFileSelect}
          onDownload={downloadCurrentFile}
          onClose={onClose}
          toNavigate={toNavigate}
        />
      </div>
    </div>
  );
};
