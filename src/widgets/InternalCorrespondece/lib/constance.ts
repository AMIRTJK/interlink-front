export const EXPORT_FIX_STYLES =
  "data:text/css;charset=utf-8," +
  encodeURIComponent(`
    /* 1. БАЗА ДОКУМЕНТА */
    body, .ck-content {
        font-size: 14pt;
        line-height: 1;
        font-family: "Times New Roman", serif;
        /* ВАЖНО: Убрали padding отсюда! Отступы в PDF/Word задает сам конвертер. */
        margin: 0; 
        padding: 0;
    }

    /* 2. СБРОС ВНУТРЕННИХ ОТСТУПОВ */
    p {
        margin-bottom: 5pt;
        margin-top: 0;
    }
    
    ul, ol {
        margin-bottom: 5pt;
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
        background-color: #fff;
    }
`);
