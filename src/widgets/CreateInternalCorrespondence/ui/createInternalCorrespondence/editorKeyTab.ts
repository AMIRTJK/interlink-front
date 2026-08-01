import { topLevelBlockOf } from "./editorBlocks";
import {
  TAB_STEP_CM,
  closestLiOf,
  deleteTabBeforeCaret,
  getTextIndentCm,
  makeTabSpacer,
  tabNbspCount,
} from "./editorTabs";
import type { TEditorKeyHandler } from "./editorKeyModel";

/**
 * Tab / Shift+Tab — контекстное поведение как в Word:
 *  • в списке   → изменение уровня пункта (indent/outdent);
 *  • Shift+Tab  → удаление табулятора слева (фокус НЕ уводим из редактора —
 *                 дефолт браузера перенёс бы его на предыдущий элемент);
 *  • иначе      → вставка ВЫДЕЛЯЕМОГО табулятора (прогон неразрывных
 *                 пробелов). В т.ч. в начале абзаца: НЕ используем CSS
 *                 text-indent — он не содержимое и не попадает в Ctrl+A.
 */
export const handleTabKey: TEditorKeyHandler = (
  e,
  editor,
  { commitHistoryNow, execCmd, syncEditorAfterDomEdit },
) => {
  if (e.key !== "Tab") return false;

  e.preventDefault();
  if (!editor || !editor.isContentEditable) return true;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return true;
  const range = selection.getRangeAt(0);
  if (!editor.contains(range.startContainer)) return true;

  // 1) Список — менять уровень пункта
  if (closestLiOf(editor, range.startContainer)) {
    execCmd(e.shiftKey ? "outdent" : "indent");
    return true;
  }

  const block = topLevelBlockOf(editor, range.startContainer);

  if (e.shiftKey) {
    // Убрать табулятор слева (или тот, внутри которого стоит каретка).
    if (deleteTabBeforeCaret(range)) {
      selection.removeAllRanges();
      selection.addRange(range);
      syncEditorAfterDomEdit();
      return true;
    }
    // Легаси/импорт из Word: уменьшить красную строку, заданную в стиле.
    const indent = getTextIndentCm(block);
    if (block && indent > 0) {
      commitHistoryNow();
      const next = Math.max(0, indent - TAB_STEP_CM);
      block.style.textIndent = next > 0 ? `${next}cm` : "";
      syncEditorAfterDomEdit();
    }
    return true;
  }

  // Tab (в т.ч. в начале абзаца) — вставляем ВЫДЕЛЯЕМЫЙ табулятор.
  const blockWasEmpty =
    !!block &&
    !(block.textContent || "").length &&
    !block.querySelector("img,table");
  range.deleteContents();
  const tabNode = makeTabSpacer(tabNbspCount(editor));
  range.insertNode(tabNode);
  // Пустой блок держал placeholder <br> — после вставки табулятора он лишний
  // (иначе под строкой осталась бы пустая строка).
  if (blockWasEmpty && block) {
    block.querySelectorAll(":scope > br").forEach((br) => br.remove());
  }
  range.setStartAfter(tabNode);
  range.setEndAfter(tabNode);
  selection.removeAllRanges();
  selection.addRange(range);
  // Вставка через Range идёт мимо события input — синхронизируем стейт
  // и историю вручную (иначе Tab не попадал ни в тело письма, ни в undo).
  syncEditorAfterDomEdit();
  return true;
};
