import React from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "./QRCodeSVG";

export const DSStamp = ({
  name,
  certSerial,
  signedAt,
  validUntil,
}: {
  name: string;
  certSerial: string;
  signedAt: string;
  validUntil: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.93, y: 4 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.28, ease: "easeOut" }}
    className="flex items-stretch rounded-md overflow-hidden shadow-sm"
    style={{ border: "1.5px solid #3b82f6", background: "#fff", minWidth: 0 }}
  >
    <div className="flex flex-col flex-shrink-0" style={{ width: 7 }}>
      <div style={{ flex: 1, background: "#CC0001" }} />
      <div
        style={{
          flex: 1,
          background: "#FFFFFF",
          borderTop: "0.5px solid #e2e8f0",
          borderBottom: "0.5px solid #e2e8f0",
        }}
      />
      <div style={{ flex: 1, background: "#009A44" }} />
    </div>
    <div
      className="flex-1 px-2.5 py-2 min-w-0"
      style={{ background: "#eff6ff" }}
    >
      <p
        style={{
          fontFamily: "Times New Roman, serif",
          fontWeight: 700,
          fontSize: 11,
          color: "#1e3a8a",
          textAlign: "center",
          lineHeight: 1.3,
          marginBottom: 2,
        }}
      >
        Имзои электронии раками
      </p>
      <div style={{ borderTop: "1px solid #93c5fd", marginBottom: 4 }} />
      <p
        style={{
          fontFamily: "Times New Roman, serif",
          fontWeight: 600,
          fontSize: 9,
          color: "#1d4ed8",
          textAlign: "center",
          lineHeight: 1.3,
          marginBottom: 5,
        }}
      >
        Маълумоти имзои электронии раками
      </p>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            flex: 1,
            minWidth: 0,
          }}
        >
          {[
            ["Сертификат:", certSerial],
            ["Дорандаи имзо:", name],
            ["Санаи имзо:", signedAt],
            ["Санаи додод:", validUntil],
          ].map(([label, val], i) => (
            <div key={i} style={{ display: "flex", gap: 4 }}>
              <span
                style={{
                  fontSize: 8.5,
                  fontWeight: 700,
                  color: "#1e40af",
                  whiteSpace: "nowrap",
                  minWidth: 60,
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontSize: 8.5,
                  color: "#1e293b",
                  fontFamily: label === "Сертификат:" ? "monospace" : undefined,
                  wordBreak: "break-all",
                }}
              >
                {val}
              </span>
            </div>
          ))}
        </div>
        <div
          style={{
            flexShrink: 0,
            border: "1px solid #bfdbfe",
            borderRadius: 3,
            padding: 2,
            background: "#fff",
          }}
        >
          <QRCodeSVG value={`${certSerial}|${name}|${signedAt}`} size={52} />
        </div>
      </div>
    </div>
  </motion.div>
);
