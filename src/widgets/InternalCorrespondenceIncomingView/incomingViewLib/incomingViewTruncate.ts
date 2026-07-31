const ATOMIC = new Set(["TABLE", "IMG", "FIGURE", "SVG", "VIDEO", "CANVAS"]);

export const truncateToChars = (node: Node, budget: { left: number }) => {
  const children = Array.from(node.childNodes);
  for (const c of children) {
    if (budget.left <= 0) {
      node.removeChild(c);
      continue;
    }
    if (c.nodeType === Node.TEXT_NODE) {
      const len = c.textContent?.length ?? 0;
      if (len <= budget.left) budget.left -= len;
      else {
        c.textContent = (c.textContent || "").slice(0, budget.left);
        budget.left = 0;
      }
    } else {
      truncateToChars(c, budget);
    }
  }
};

export const dropChars = (node: Node, budget: { left: number }) => {
  const children = Array.from(node.childNodes);
  for (const c of children) {
    if (budget.left <= 0) return;
    if (c.nodeType === Node.TEXT_NODE) {
      const len = c.textContent?.length ?? 0;
      if (len <= budget.left) {
        budget.left -= len;
        (c as ChildNode).remove();
      } else {
        c.textContent = (c.textContent || "").slice(budget.left);
        budget.left = 0;
      }
    } else if (c.nodeType === Node.ELEMENT_NODE) {
      const el = c as Element;
      const textLen = (el.textContent || "").length;
      if (textLen === 0) {
        el.remove();
        continue;
      }
      if (
        textLen <= budget.left &&
        !el.querySelector("br,img,svg,video,canvas")
      ) {
        budget.left -= textLen;
        el.remove();
      } else {
        dropChars(el, budget);
        if (
          !(el.textContent || "").length &&
          !el.querySelector("br,img,svg,video,canvas")
        ) {
          el.remove();
        }
      }
    } else {
      (c as ChildNode).remove();
    }
  }
};

export const brAtCharBoundary = (root: HTMLElement, k: number): boolean => {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    null
  );
  let acc = 0;
  let n: Node | null;
  while ((n = walker.nextNode())) {
    if (n.nodeType === Node.TEXT_NODE) {
      const len = n.textContent?.length ?? 0;
      if (acc + len > k) return false;
      acc += len;
    } else if ((n as Element).nodeName === "BR") {
      if (acc === k) return true;
    }
  }
  return false;
};

export const removeLeadingBr = (root: HTMLElement): void => {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    null
  );
  let n: Node | null;
  while ((n = walker.nextNode())) {
    if (n.nodeType === Node.TEXT_NODE) {
      if ((n.textContent || "").length) return;
      continue;
    }
    const el = n as Element;
    if (el.nodeName === "BR") {
      el.remove();
      return;
    }
    if (ATOMIC.has(el.nodeName)) return;
  }
};
