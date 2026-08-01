import {
  useEffect,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";

import type { RecipientOption } from "../../types";
import { recipientFromComposeCreator } from "./documentPrefillMappers";

interface IComposeSourceLetter {
  subject?: string;
  creator?: {
    id?: string | number;
    full_name?: string;
    position?: string;
    department?: string;
  };
}

interface IParams {
  composeMode?: "reply" | "forward";
  sourceLetter?: IComposeSourceLetter;
  composeAppliedRef: RefObject<boolean>;
  setSubject: Dispatch<SetStateAction<string>>;
  setTo: Dispatch<SetStateAction<RecipientOption[]>>;
}

/**
 * Предзаполнение при «Ответить»/«Перенаправить» (один раз при монтировании).
 * Ответить → тема «Ответ: …», «Кому» = отправитель входящего письма.
 * Перенаправить → тема «Перенаправление: …», «Кому» остаётся пустым.
 */
export const useComposeReplyPrefill = ({
  composeMode,
  sourceLetter,
  composeAppliedRef,
  setSubject,
  setTo,
}: IParams) => {
  useEffect(() => {
    if (composeAppliedRef.current) return;
    if (!composeMode || !sourceLetter) return;
    composeAppliedRef.current = true;

    setSubject(
      `${composeMode === "reply" ? "Ответ" : "Перенаправление"}: ${
        sourceLetter.subject || ""
      }`,
    );

    if (composeMode === "reply" && sourceLetter.creator?.id != null) {
      setTo([recipientFromComposeCreator(sourceLetter.creator)]);
    }
  }, [composeMode, sourceLetter]);
};
