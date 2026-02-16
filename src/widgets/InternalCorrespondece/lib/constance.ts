export const EXPORT_FIX_STYLES =
  "data:text/css;charset=utf-8," +
  encodeURIComponent(`
    /* 1. БАЗА ДОКУМЕНТА */
    body, .ck-content {
        /* УБРАЛИ "Lato", оставили только то, что в редакторе */
        font-family: "Times New Roman", serif; 
        font-size: 14pt;
        line-height: 1.5;
        margin: 0; 
        padding: 0;
        text-align: justify; /* Опционально, но часто нужно для документов */
    }

    /* 2. ПАРАГРАФЫ (Синхронизация с EditorStyle.css) */
    p {
        /* Добавили !important, так как в CSS редактора он есть */
        margin-bottom: 0.5em !important; 
        margin-top: 0;
        line-height: 1.5 !important;
    }
    
    /* 3. СПИСКИ */
    ul, ol {
        margin-bottom: 1em !important;
        padding-left: 20px;
    }
    
    li {
        margin-bottom: 0;
    }

    /* 4. ЗАГОЛОВКИ */
    h1 { 
        font-size: 24pt; 
        margin-top: 1.2em;
        margin-bottom: 0.6em;
        font-weight: bold; 
        line-height: 1.2;
    }
    
    h2 { 
        font-size: 18pt; 
        margin-top: 1.2em;
        margin-bottom: 0.6em; 
        font-weight: bold; 
        line-height: 1.2;
    }
    
    h3 { 
        font-size: 14pt; 
        margin-top: 1.2em;
        margin-bottom: 0.6em; 
        font-weight: bold; 
        line-height: 1.2;
    }

    /* 5. ТАБЛИЦЫ */
    table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 1em;
    }
    td, th {
        border: 1px solid black;
        padding: 5px;
        vertical-align: top;
    }

    /* 6. ТЕХНИЧЕСКИЙ ФИКС ДЛЯ PDF */
    html, body {
        height: auto !important;
        min-height: 0 !important;
        background-color: #fff;
    }
`);
