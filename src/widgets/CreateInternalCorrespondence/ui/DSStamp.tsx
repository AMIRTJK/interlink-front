import React from "react";
import { motion } from "framer-motion";
import { TajikFlag } from "./TajikFlag";
import { TJK_EMBLEM_DATA_URI } from "../lib/tjkEmblem";

const SANS = "'Arial', 'Helvetica', sans-serif";

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
}) => {
  const rows: [string, string][] = [
    ["Сертификат:", certSerial],
    ["Дорандаи имзо:", name],
    ["Санаи имзо:", signedAt],
    ["Эътибор дорад:", validUntil],
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.93, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="overflow-hidden"
      style={{
        border: "2.5px solid #111111",
        borderRadius: 12,
        background: "#ffffff",
        minWidth: 0,
      }}
    >
      {/* Шапка: флаг · заголовок · герб */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
        }}
      >
        <TajikFlag width={44} height={30} />
        <p
          style={{
            flex: 1,
            minWidth: 0,
            textAlign: "center",
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 14,
            letterSpacing: 0.2,
            color: "#0f0f0f",
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          Имзои электронии рақамӣ
        </p>
        <img
          src={TJK_EMBLEM_DATA_URI}
          alt="Герб Республики Таджикистан"
          style={{ width: 36, height: 36, flexShrink: 0, display: "block" }}
        />
      </div>

      {/* Тёмная полоса подзаголовка */}
      <div style={{ background: "#2b2b2b", padding: "5px 10px" }}>
        <p
          style={{
            textAlign: "center",
            fontFamily: SANS,
            fontWeight: 500,
            fontSize: 10.5,
            letterSpacing: 0.2,
            color: "#ffffff",
            margin: 0,
          }}
        >
          Маълумоти имзои электронии рақамӣ
        </p>
      </div>

      {/* Реквизиты сертификата с водяным знаком-гербом */}
      <div
        style={{
          position: "relative",
          padding: "9px 13px 11px",
          overflow: "hidden",
        }}
      >
        <img
          src={TJK_EMBLEM_DATA_URI}
          alt=""
          aria-hidden
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 86,
            height: 86,
            opacity: 0.06,
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {rows.map(([label, val], i) => (
            <p
              key={i}
              style={{
                margin: 0,
                fontFamily: SANS,
                fontSize: 10.5,
                color: "#111111",
                lineHeight: 1.45,
              }}
            >
              <span style={{ whiteSpace: "nowrap" }}>{label}</span>{" "}
              <span style={{ wordBreak: "break-all" }}>{val}</span>
            </p>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
