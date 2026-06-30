import React, { useState } from "react";
import { motion } from "framer-motion";

interface IProps {
  name: string;
  certSerial: string;
  signedAt: string;
  validUntil: string;
}

type TLanguage = "EN" | "RU" | "TJ";

const LOCALIZATION = {
  TJ: {
    ownerTitle: "Соҳиби сертификат",
    certNumberTitle: "Рақами сертификат",
    dateOfIssueTitle: "Санаи додан",
    validityTitle: "Мӯҳлати эътибор",
    fromText: "аз",
    toText: "то",
    statusText: "ACTIVE & VERIFIED",
    authorityText: "TJ-Root Certificate Authority",
    footerText: "Secured · Encrypted · Tamper-Proof",
    signatureText: "Имзои электронии рақамӣ",
  },
  RU: {
    ownerTitle: "Владелец сертификата",
    certNumberTitle: "Номер сертификата",
    dateOfIssueTitle: "Дата выдачи",
    validityTitle: "Срок действия",
    fromText: "с",
    toText: "по",
    statusText: "АКТИВЕН И ПОДТВЕРЖДЕН",
    authorityText: "TJ-Root Certificate Authority",
    footerText: "Защищено · Зашифровано · Безопасно",
    signatureText: "Электронная цифровая подпись",
  },
  EN: {
    ownerTitle: "Certificate holder",
    certNumberTitle: "Certificate number",
    dateOfIssueTitle: "Date of issue",
    validityTitle: "Validity period",
    fromText: "from",
    toText: "to",
    statusText: "ACTIVE & VERIFIED",
    authorityText: "TJ-Root Certificate Authority",
    footerText: "Secured · Encrypted · Tamper-Proof",
    signatureText: "Electronic Digital Signature",
  },
};

export const DSStamp = ({
  name,
  certSerial,
  signedAt,
  validUntil,
}: IProps) => {
  const [lang, setLang] = useState<TLanguage>("TJ");

  const match = validUntil.match(/(?:аз|from|с)?\s*([\d.]+)\s*(?:то|to|по|-)\s*([\d.]+)/i);
  const fromDate = match ? match[1] : "30.03.2026";
  const toDate = match ? match[2] : "30.03.2027";

  const t = LOCALIZATION[lang];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.93, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="relative w-full max-w-[760px] rounded-2xl overflow-hidden bg-[#1a1a1a] shadow-[0_0_0_1px_rgba(255,107,0,0.3),0_24px_64px_rgba(0,0,0,0.7),0_4px_16px_rgba(255,107,0,0.12)] ds-stamp-container"
    >
      <style>{`
        .ds-stamp-container {
          container-type: inline-size;
          container-name: ds-stamp;
        }
        
        @container ds-stamp (max-width: 450px) {
          .ds-stamp-fingerprint {
            width: 120px !important;
            height: 120px !important;
            right: -20px !important;
            bottom: -20px !important;
          }
          .ds-stamp-header {
            padding: 4px 8px 3px !important;
            margin-bottom: 0px !important;
          }
          .ds-stamp-logo-text {
            font-size: 8px !important;
            letter-spacing: 0.12em !important;
          }
          .ds-stamp-logo-sub {
            font-size: 4px !important;
            letter-spacing: 0.15em !important;
          }
          .ds-stamp-lang-btn {
            font-size: 6px !important;
            padding: 0px 4px !important;
            letter-spacing: 0.05em !important;
          }
          .ds-stamp-owner-label {
            font-size: 6px !important;
            margin-bottom: 0px !important;
          }
          .ds-stamp-owner-name {
            font-size: 11px !important;
            line-height: 1.1 !important;
          }
          .ds-stamp-sig-type {
            font-size: 6px !important;
            margin-top: 1px !important;
          }
          .ds-stamp-body {
            padding: 4px 8px !important;
            gap: 4px !important;
          }
          .ds-stamp-col-gap {
            gap: 3px !important;
          }
          .ds-stamp-field-label {
            font-size: 6px !important;
            margin-bottom: 1px !important;
          }
          .ds-stamp-cert-box {
            padding: 2px 4px !important;
          }
          .ds-stamp-cert-code {
            font-size: 7px !important;
            line-height: 1 !important;
          }
          .ds-stamp-date-text {
            font-size: 9px !important;
          }
          .ds-stamp-date-icon {
            width: 8px !important;
            height: 8px !important;
          }
          .ds-stamp-valid-row {
            gap: 4px !important;
          }
          .ds-stamp-valid-val {
            font-size: 9px !important;
          }
          .ds-stamp-valid-label {
            font-size: 6px !important;
          }
          .ds-stamp-status-icon {
            width: 12px !important;
            height: 12px !important;
          }
          .ds-stamp-status-badge {
            font-size: 7px !important;
          }
          .ds-stamp-status-auth {
            font-size: 6px !important;
            line-height: 1 !important;
          }
          .ds-stamp-divider-y {
            margin-left: 2px !important;
            margin-right: 2px !important;
            display: flex !important;
          }
          .ds-stamp-footer {
            padding: 3px 8px !important;
          }
          .ds-stamp-footer-text {
            font-size: 6px !important;
            letter-spacing: 0.1em !important;
          }
          .ds-stamp-footer-icon {
            width: 8px !important;
            height: 8px !important;
          }
        }
      `}</style>

      <div className="pointer-events-none select-none absolute -right-[60px] -bottom-[60px] w-[360px] h-[360px] opacity-[0.055] z-0 ds-stamp-fingerprint">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={0.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-[#ffb800]"
          aria-hidden="true"
        >
          <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
          <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
          <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
          <path d="M2 12a10 10 0 0 1 18-6" />
          <path d="M2 16h.01" />
          <path d="M21.8 16c.2-2 .131-5.354 0-6" />
          <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
          <path d="M8.65 22c.21-.66.45-1.32.57-2" />
          <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
        </svg>
      </div>

      <div className="h-[3px] bg-[linear-gradient(90deg,transparent_0%,#ff6b00_20%,#ffb800_50%,#ff6b00_80%,transparent_100%)]" />

      <div className="px-6 pt-5 pb-4 bg-[linear-gradient(135deg,#2c2c2c_0%,#222222_100%)] relative z-10 ds-stamp-header">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <svg
              viewBox="0 0 1200 600"
              className="h-5 w-auto rounded-[2px]"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="1200" height="600" fill="#fff" />
              <rect width="1200" height="200" fill="#cc0000" />
              <rect width="1200" height="200" y="400" fill="#006600" />
              <g transform="translate(600,300)">
                <path
                  d="M -100 60 A 110 110 0 0 1 100 60 L 70 60 L 70 40 L 40 40 L 40 10 L -40 10 L -40 40 L -70 40 L -70 60 Z"
                  fill="#f8c400"
                />
                <g fill="#f8c400">
                  <circle cx="0" cy="-60" r="10" />
                  <circle cx="-50" cy="-45" r="10" />
                  <circle cx="50" cy="-45" r="10" />
                  <circle cx="-85" cy="-10" r="10" />
                  <circle cx="85" cy="-10" r="10" />
                  <circle cx="-100" cy="40" r="10" />
                  <circle cx="100" cy="40" r="10" />
                </g>
              </g>
            </svg>
            <div className="flex flex-col gap-0">
              <span className="font-sans font-bold text-[14px] tracking-[0.24em] text-white uppercase whitespace-nowrap leading-[1.2] ds-stamp-logo-text">
                INFRATECH
              </span>
              <span className="font-sans font-normal text-[7px] tracking-[0.3em] text-[#ffb800] uppercase whitespace-nowrap ds-stamp-logo-sub">
                {lang === "TJ" ? "ҲУВИЯТИ РАҚАМӢ" : lang === "RU" ? "ЦИФРОВАЯ ЛИЧНОСТЬ" : "DIGITAL IDENTITY"}
              </span>
            </div>
          </div>

          <div className="flex gap-0.5 rounded-full p-0.5 bg-white/6 border border-[#ff6b00]/30">
            <button
              onClick={() => setLang("EN")}
              className={`px-2.5 py-0.5 rounded-full transition-all duration-200 font-sans text-[9px] font-bold tracking-[0.1em] ds-stamp-lang-btn ${
                lang === "EN"
                  ? "bg-[linear-gradient(135deg,#ff6b00,#ffb800)] text-[#111111]"
                  : "bg-transparent text-white/45"
              }`}
              aria-label="Switch language to EN"
            >
              EN
            </button>
            <button
              onClick={() => setLang("RU")}
              className={`px-2.5 py-0.5 rounded-full transition-all duration-200 font-sans text-[9px] font-bold tracking-[0.1em] ds-stamp-lang-btn ${
                lang === "RU"
                  ? "bg-[linear-gradient(135deg,#ff6b00,#ffb800)] text-[#111111]"
                  : "bg-transparent text-white/45"
              }`}
              aria-label="Switch language to RU"
            >
              RU
            </button>
            <button
              onClick={() => setLang("TJ")}
              className={`px-2.5 py-0.5 rounded-full transition-all duration-200 font-sans text-[9px] font-bold tracking-[0.1em] ds-stamp-lang-btn ${
                lang === "TJ"
                  ? "bg-[linear-gradient(135deg,#ff6b00,#ffb800)] text-[#111111]"
                  : "bg-transparent text-white/45"
              }`}
              aria-label="Switch language to TJ"
            >
              TJ
            </button>
          </div>
        </div>

        <div className="mb-1">
          <p className="text-[10px] uppercase tracking-[0.22em] mb-1 font-medium text-[#ffb800] font-sans ds-stamp-owner-label">
            <span>{t.ownerTitle}</span>
          </p>
          <h1 className="font-bold leading-none tracking-tight text-[clamp(22px,4vw,30px)] text-white font-sans tracking-[-0.01em] ds-stamp-owner-name">
            {name}
          </h1>
        </div>
        <p className="text-[10px] mt-2 tracking-[0.15em] uppercase text-white/30 font-sans ds-stamp-sig-type">
          <span>{t.signatureText}</span>
        </p>
      </div>

      <div className="w-full h-px bg-[linear-gradient(90deg,transparent,#ff6b00,#ffb800,#ff6b00,transparent)]" />

      <div className="px-6 py-5 grid grid-cols-[1fr_auto_1fr] relative z-10 bg-[linear-gradient(135deg,#2c2c2c_0%,#222222_100%)] ds-stamp-body">
        <div className="flex flex-col gap-5 ds-stamp-col-gap">
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] mb-1.5 font-semibold text-[#ff6b00] ds-stamp-field-label">
              <span>{t.certNumberTitle}</span>
            </p>
            <div className="px-3 py-2 rounded-lg bg-white/4 border border-[#ff6b00]/20 ds-stamp-cert-box">
              <code className="text-[11px] font-mono break-all leading-snug block text-white/60 ds-stamp-cert-code">
                {certSerial}
              </code>
            </div>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] mb-1 font-semibold text-[#ff6b00] ds-stamp-field-label">
              <span>{t.dateOfIssueTitle}</span>
            </p>
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3.5 h-3.5 shrink-0 text-[#ffd166] ds-stamp-date-icon"
                aria-hidden="true"
              >
                <path d="M8 2v4" />
                <path d="M16 2v4" />
                <rect width="18" height="18" x="3" y="4" rx="2" />
                <path d="M3 10h18" />
              </svg>
              <span className="text-[15px] font-semibold text-white font-sans tracking-[0.04em] ds-stamp-date-text">
                {signedAt}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-center mx-2 self-stretch ds-stamp-divider-y">
          <div className="w-px flex-1 bg-[linear-gradient(transparent,#ff6b00,#ffb800,transparent)]" />
        </div>

        <div className="flex flex-col gap-5 ds-stamp-col-gap">
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] mb-1.5 font-semibold text-[#ff6b00] ds-stamp-field-label">
              <span>{t.validityTitle}</span>
            </p>
            <div className="flex items-center gap-3 ds-stamp-valid-row">
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[8px] uppercase tracking-wider text-white/40 ds-stamp-valid-label">
                  <span>{t.fromText}</span>
                </span>
                <span className="text-[14px] font-semibold text-white font-sans tracking-[0.04em] ds-stamp-valid-val">
                  {fromDate}
                </span>
              </div>
              <div className="flex-1 h-px bg-[linear-gradient(90deg,rgba(255,107,0,0.18),#ff6b00,#ffb800,rgba(255,107,0,0.18))]" />
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[8px] uppercase tracking-wider text-white/40 ds-stamp-valid-label">
                  <span>{t.toText}</span>
                </span>
                <span className="text-[14px] font-semibold text-white font-sans tracking-[0.04em] ds-stamp-valid-val">
                  {toDate}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-full shrink-0 bg-[#ff6b00]/18 border border-[#ff6b00]/40 ds-stamp-status-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-[#ff6b00]"
                aria-hidden="true"
              >
                <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold tracking-wide text-[#ffd166] ds-stamp-status-badge">
                <span>{t.statusText}</span>
              </span>
              <span className="text-[9px] text-white/35 ds-stamp-status-auth">
                <span>{t.authorityText}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-[linear-gradient(90deg,transparent,#ff6b00,#ffb800,#ff6b00,transparent)]" />

      <div className="px-6 py-3 flex items-center justify-between bg-black/22 relative z-10 ds-stamp-footer">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5 text-[#ff6b00] ds-stamp-footer-icon"
            aria-hidden="true"
          >
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          </svg>
          <span className="text-[9px] uppercase tracking-[0.18em] text-white/35 font-sans ds-stamp-footer-text">
            <span>{t.footerText}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3 h-3 text-white/22 ds-stamp-footer-icon"
            aria-hidden="true"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5 text-[#ffb800] ds-stamp-footer-icon"
            aria-hidden="true"
          >
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="m9 15 2 2 4-4" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};
