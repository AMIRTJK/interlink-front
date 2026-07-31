import React from "react";

interface BookCoverFrontProps {
  coverTitle: React.ReactNode;
  coverSubtitle: React.ReactNode;
  coverLogoSrc: string;
  footerPhone: string;
}

export const BookCoverFront: React.FC<BookCoverFrontProps> = ({
  coverTitle,
  coverSubtitle,
  coverLogoSrc,
  footerPhone,
}) => {
  return (
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
  );
};
