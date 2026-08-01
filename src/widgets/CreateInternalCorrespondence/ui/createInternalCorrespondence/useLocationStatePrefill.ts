import {
  useEffect,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";

import { splitDocLayout, type DocLayout } from "./docLayout";

interface IParams {
  id?: string | number;
  /** Тема и тело, переданные через navigate state при переходе на страницу. */
  locationState: { subject?: string; body?: string } | null;
  subject: string;
  editorContent: string;
  editorRef: RefObject<HTMLDivElement | null>;
  applyDocLayout: (layout: DocLayout | null) => void;
  setSubject: Dispatch<SetStateAction<string>>;
  setEditorContent: Dispatch<SetStateAction<string>>;
}

/**
 * Префилл НОВОГО письма из navigate state. Открытый черновик наполняет ответ
 * бэкенда (см. useSavedDocumentPrefill), поэтому при наличии id ничего не
 * делаем; уже введённые тему и тело не перетираем.
 */
export const useLocationStatePrefill = ({
  id,
  locationState,
  subject,
  editorContent,
  editorRef,
  applyDocLayout,
  setSubject,
  setEditorContent,
}: IParams) => {
  useEffect(() => {
    if (!id && locationState) {
      if (locationState.subject && !subject) {
        setSubject(locationState.subject);
      }
      if (locationState.body && !editorContent) {
        // Префилл может прийти из письма, сохранённого этим редактором, —
        // раскладку из него применяем, а маркер в редактор не пускаем.
        const { layout, body } = splitDocLayout(locationState.body);
        if (layout) applyDocLayout(layout);
        setEditorContent(body);
        if (editorRef.current) {
          editorRef.current.innerHTML = body;
        }
      }
    }
  }, [id, locationState]);
};
