export const EXPORT_FIX_STYLES =
  "data:text/css;charset=utf-8," +
  encodeURIComponent(`
    /* 1. Возвращаем отступы параграфам (которые убил Tailwind) */
    p {
        margin-top: 0;
        margin-bottom: 1em; /* Отступ снизу как в обычном тексте */
        line-height: 1.5;
    }

    /* 2. Заодно чиним заголовки */
    h1, h2, h3 {
        margin-top: 1.2em;
        margin-bottom: 0.5em;
        font-weight: bold;
    }
    
    /* 3. И списки */
    ul, ol {
        margin-bottom: 1em;
        padding-left: 20px;
    }

    /* 4. ВАЖНО: Фикс того самого бага с гигантскими отступами в PDF */
    html, body {
        height: auto !important;
        min-height: 0 !important;
    }
`);
