export const EXPORT_FIX_STYLES =
  "data:text/css;charset=utf-8," +
  encodeURIComponent(`
    /* 1. БАЗА ДОКУМЕНТА */
    /* Задаем шрифт только для Body. Все остальные наследуют. */
    body, .ck-content {
        font-size: 12pt; /* Базовый размер документа */
        line-height: 1.5;
        font-family: "Times New Roman", serif;
    }

    /* 2. ВАЖНО: Убираем принудительные размеры у элементов контента */
    /* p, li, table, td, span - НЕ указываем здесь font-size, 
       чтобы работал выбор размера в редакторе (inline-styles) */

    p {
        margin-bottom: 10pt;
        margin-top: 0;
    }
    
    ul, ol {
        margin-bottom: 10pt;
        padding-left: 40px;
    }
    
    li {
        margin-bottom: 5pt;
    }

    /* 3. ЗАГОЛОВКИ */
    h1 { font-size: 24pt; margin-top: 20px; font-weight: bold; }
    h2 { font-size: 18pt; margin-top: 15px; font-weight: bold; }
    h3 { font-size: 14pt; margin-top: 10px; font-weight: bold; }

    /* 4. ФИКС ДЛЯ PDF */
    html, body {
        height: auto !important;
        min-height: 0 !important;
    }
`);
