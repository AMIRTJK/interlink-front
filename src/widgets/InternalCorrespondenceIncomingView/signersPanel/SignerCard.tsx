import React from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { SignatureStamp } from "../SignatureStamp";
import { DocSignerItem } from "./signersPanelModel";

interface IProps {
  signer: DocSignerItem;
  idx: number;
}

export const SignerCard: React.FC<IProps> = ({ signer, idx }) => {
  return (
    <motion.div
      key={signer.id}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: idx * 0.06,
        duration: 0.22,
        ease: "easeOut",
      }}
      className="bg-slate-50 rounded-xl p-3 flex flex-col gap-2 border border-slate-100"
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${signer.gradientFrom}, ${signer.gradientTo})`,
          }}
        >
          {signer.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[13px] text-slate-800 leading-tight break-words">
            {signer.name}
          </p>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 bg-purple-50 text-purple-700 border-purple-200">
          {signer.role}
        </span>
      </div>

      <p className="text-[11px] text-slate-400 leading-tight">
        {signer.position}
      </p>

      {signer.signed && (
        <SignatureStamp
          name={signer.name}
          certSerial={`SN-2026-${signer.initials}-84201`}
          signedAt={signer.signedAt.split(" ")[0] || signer.signedAt}
          validUntil="аз 20.03.2025 то 20.03.2026"
        />
      )}

      {!signer.signed && (
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 border border-amber-200">
            <Clock size={9} className="text-amber-500" />
          </span>
          <span className="text-[11px] font-semibold text-amber-600">
            Ожидает подписи
          </span>
        </div>
      )}
    </motion.div>
  );
};
