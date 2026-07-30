# 🧱 Приведение проекта к AGENTS.md — трекер рефакторинга

> **Единица работы — ОДИН ФАЙЛ.** Сессия всегда заканчивается на целом шаге, следующая продолжает с маркера `⏹`.
> Правила: [`AGENTS.md`](../../AGENTS.md) §4 (структура модуля), §5 (лимит 250 строк), §15 (рефакторинг без изменения поведения).

**Инвариант кампании:** UI, тексты, бизнес-логика и состав сетевых запросов до и после — идентичны. Меняем форму кода, не поведение.

---

## 🔁 Протокол сессии (читать первым)

1. Открыть этот файл, найти маркер `⏹ ЧЕКПОИНТ`, взять **следующий незакрытый шаг** под ним.
2. Прочитать целевой файл и его прямых соседей. Не читать весь модуль.
3. Декомпозировать по `AGENTS.md` §5: типы и константы → чистые функции → подкомпоненты → хуки (именно в этом порядке).
4. **Закрыть шаг:** `- [x]`, передвинуть `⏹` ниже, дописать строку в «Лог», занести находки в общий список.
5. **Коммит** — `refactor(<модуль>): декомпозиция <файл>`. Один файл = один коммит = точка возврата.
6. Взять следующий шаг, если бюджет позволяет. Иначе — остановиться и написать, где остановились.

**Сколько влезает в одну сессию:** `S` — 3–4 файла · `M` — 1–2 · `L` — один файл целиком · `XL` — часть файла (у таких шагов свой под-план).

**Останавливаться заранее.** Не начинать новый файл, если контекста осталось меньше ~20%: лучше закрыть сессию на чистом шаге, чем бросить файл в полуразобранном виде.

**Никогда:** не запускать `build`, проверку типов и браузер без явной просьбы; не чинить найденные баги; не менять разметку, тексты, запросы; не добавлять `memo`/`lazy`/виртуализацию (это отдельный перф-проход по `PERFORMANCE.md`).

---

## 📍 Положение

- **Прогресс:** 1 / 89 шагов закрыто (из них 4 — кандидаты на `⏭️ SKIP`).
- **Последнее обновление:** 2026-07-30 — закрыт `FilesTab.tsx`, чекпоинт на `FileList.tsx`.

---

## 🗂️ Шаги

Порядок — от низкого риска к высокому. Начинать сверху; отклоняться можно, но тогда сначала закрывать модуль целиком.

Обозначения: `S` 250–400 строк · `M` 400–700 · `L` 700–1500 · `XL` >1500 · `⏭️` дробить не нужно.

### Модуль 0 — Профиль (хвост; FSD уже сделан)

- [x] `S` 522 → `features/Profile/ui/tabs/FilesTab.tsx` → **231**

⏹ **ЧЕКПОИНТ**

- [ ] `S` 395 → `features/Profile/ui/tabs/files/FileList.tsx`
- [ ] `S` 313 → `features/Profile/ui/tabs/files/useFilesData.ts`
- [ ] `S` 307 → `features/Profile/ui/tabs/ProfileInfoTab.tsx`
- [ ] `S` 305 → `features/Profile/ui/tabs/files/FilesUserShares.tsx`
- [ ] `S` 272 → `features/Profile/ui/tabs/files/FileCard.tsx`
- [ ] `S` 269 → `features/Profile/ui/tabs/files/FilesHeader.tsx`
- [ ] `S` 253 → `features/Profile/ui/tabs/files/ShareFileModal.tsx`

### Модуль 1 — Авторизация (тренировочный, изолированный)

- [ ] `M` 482 → `features/Login/Login.tsx`

### Модуль 2 — Общий каркас (layout, роутинг, shared)

- [ ] `M` 499 → `app/routes/AppRouter.tsx` — заодно удалить закомментированную разводку реестров
- [ ] `M` 476 → `widgets/layout/ui/ModuleMenu/ModuleMenu.tsx`
- [ ] `M` 432 → `widgets/layout/ui/Header.tsx`
- [ ] `S` 371 → `shared/ui/UniversalTable/ui.tsx`
- [ ] `S` 269 → `shared/ui/SmartSearchModal/ui.tsx`

### Модуль 3 — Администрирование

- [ ] `L` 1421 → `widgets/Administration/ui/UserProfileModal.tsx`
- [ ] `L` 1183 → `widgets/Administration/ui/RolesView.tsx`
- [ ] `L` 1071 → `widgets/Administration/ui/AddUserModal.tsx`
- [ ] `L` 971 → `widgets/Administration/ui/CreateRoleModal.tsx`
- [ ] `M` 569 → `widgets/Administration/ui/RoleDrawer.tsx`
- [ ] `M` 565 → `widgets/Administration/ui/UsersView.tsx`
- [ ] `S` 361 → `widgets/Administration/ui/components.tsx`
- [ ] `S` 359 → `widgets/Administration/ui/UserDrawer.tsx`
- [ ] `S` 341 → `widgets/Administration/lib/adapters.ts`
- [ ] `S` 276 → `pages/modules/administration/AdministrationHomePage.tsx` — логика со страницы уходит в виджет (§3)
- [ ] `⏭️` 259 → `widgets/Administration/theme/tokens.ts` — файл-данные, проверить и закрыть как SKIP

### Модуль 4 — HR

- [ ] `L` 951 → `widgets/Hr/Access/ui/UserProfileModal.tsx`
- [ ] `M` 606 → `widgets/Hr/Staffing/ui/views/OrgTreeChart.tsx`
- [ ] `M` 525 → `widgets/Hr/Access/ui/UsersTab.tsx`
- [ ] `M` 502 → `widgets/Hr/Staffing/ui.tsx`
- [ ] `M` 467 → `widgets/Hr/Access/ui/RolesTab.tsx`
- [ ] `M` 441 → `features/Hr/ui/EmployeeFormModal.tsx`
- [ ] `M` 423 → `widgets/Hr/Access/ui/RolePermissionsSidebar.tsx`
- [ ] `M` 403 → `widgets/Hr/Access/ui/UserPermissionsSidebar.tsx`
- [ ] `S` 379 → `widgets/Hr/Staffing/ui/views/PositionRow.tsx`
- [ ] `S` 373 → `widgets/Hr/Staffing/ui/views/BubbleView.tsx`
- [ ] `S` 371 → `widgets/Hr/Access/lib.tsx`
- [ ] `S` 366 → `widgets/Hr/Staffing/ui/modals/EditDeptModal.tsx`
- [ ] `S` 365 → `widgets/Hr/Staffing/ui/modals/AddDeptModal.tsx`
- [ ] `S` 355 → `widgets/Hr/Employees/EmployeeProfileModal.tsx`
- [ ] `S` 344 → `widgets/Hr/Staffing/ui/modals/AddOrgModal.tsx`
- [ ] `S` 332 → `widgets/Hr/Staffing/ui/modals/EditOrgModal.tsx`
- [ ] `S` 309 → `features/Hr/ui/SetRoles.tsx`
- [ ] `S` 276 → `widgets/Hr/Orders/ui/OrderDetailModal.tsx`
- [ ] `S` 263 → `widgets/Hr/Orders/ui/renderOrderFields.tsx`
- [ ] `S` 258 → `widgets/Hr/Access/ui/RoleUsersTable.tsx`
- [ ] `S` 257 → `widgets/Hr/Staffing/ui/modals/AssignEmployeeModal.tsx`
- [ ] `S` 256 → `features/Hr/ui/PassportUploadStep.tsx`
- [ ] `S` 253 → `widgets/Hr/Staffing/ui/views/OrgCard.tsx`
- [ ] `⏭️` 335 → `entities/hr/model.ts` — если только типы, закрыть как SKIP; иначе разделить по сущностям

### Модуль 5 — Задачи

- [ ] `L` 1276 → `widgets/TaskRegistry/ui/CreateTaskView.tsx`
- [ ] `S` 396 → `widgets/TaskRegistry/ui/TaskDetailModal.tsx`
- [ ] `S` 318 → `widgets/TaskRegistry/model/useTasks.ts`
- [ ] `S` 260 → `widgets/TaskRegistry/model/api.ts`

### Модуль 6 — Реестр корреспонденции

> ⚠️ **Перед стартом решить:** остаётся `NewRegistry` или `RegistryTable`. Рефакторить обе ветки — выбросить работу. Если старый уходит — шаги по нему заменяются на удаление.

- [ ] `XL` 1598 → `widgets/NewRegistry/ui/RegistryLayout.tsx` — под-план ниже
- [ ] `M` 535 → `widgets/NewRegistry/ui/NewRegistry.tsx`
- [ ] `S` 355 → `widgets/RegistryTable/ui/RegistryTable.tsx` *(отпадает, если модуль удаляется)*
- [ ] `S` 313 → `widgets/RegistryTable/lib/getCorrespondenseIncomingColumns/getCorrespondenseIncomingColumns.tsx` *(то же)*
- [ ] `S` 260 → `widgets/RegistrySidebar/ui/useModuleSidebar.ts`

### Модуль 7 — Резолюции, визы, исполнители

- [ ] `M` 514 → `features/executor-structure/ui.tsx`
- [ ] `M` 514 → `widgets/CorrespondenceForm/ui.tsx`
- [ ] `M` 494 → `features/visa-form/ui.tsx`
- [ ] `S` 353 → `features/SelectExecutors/SelectExecutorsModal.tsx`
- [ ] `S` 283 → `widgets/ResolutionOfLetter/lib/useResolutionOfLetter.ts`
- [ ] `S` 267 → `widgets/ResolutionOfLetter/ui/ResolutionForm.tsx`

### Модуль 8 — Просмотр входящего

- [ ] `XL` 1795 → `widgets/InternalCorrespondenceIncomingView/IncomingPreviewModal.tsx` — под-план ниже
- [ ] `L` 1274 → `widgets/InternalCorrespondenceIncomingView/ui.tsx`
- [ ] `M` 450 → `widgets/InternalCorrespondenceIncomingView/lib.ts`
- [ ] `S` 345 → `widgets/InternalCorrespondenceIncomingView/ApproversPanel.tsx`
- [ ] `S` 313 → `widgets/InternalCorrespondenceIncomingView/SignersPanel.tsx`
- [ ] `S` 253 → `widgets/InternalCorrespondenceIncomingView/TaskFormFields.tsx`

### Модуль 9 — Внутренняя корреспонденция

- [ ] `XL` 1500 → `widgets/InternalCorrespondece/ui/WorkflowParticipantsPanel.tsx` — под-план ниже
- [ ] `M` 680 → `widgets/InternalCorrespondece/ui.tsx`
- [ ] `M` 677 → `widgets/InternalCorrespondece/ui/Editor.tsx` — ⚠️ инварианты пагинации, только механический вынос
- [ ] `M` 441 → `widgets/InternalCorrespondece/ui/DocumentHeaderForm.tsx`
- [ ] `M` 425 → `widgets/InternalCorrespondece/ui/TopNavigation.tsx`

### Модуль 10 — Прочие модалки

- [ ] `M` 691 → `widgets/BookModal/ui.tsx`
- [ ] `M` 687 → `widgets/DrawerActionsModal/ui.tsx`

### Модуль 11 — Чат

- [ ] `XL` 5364 → `widgets/Chat/ui/ChatApp.tsx` — под-план ниже
- [ ] `⏭️` 379 → `widgets/Chat/lib/translations.ts` — словарь, закрыть как SKIP

### Модуль 12 — Создание корреспонденции (последним, критический риск)

- [ ] `XL` 7256 → `widgets/CreateInternalCorrespondence/ui/CreateInternalCorrespondence.tsx` — под-план ниже
- [ ] `L` 742 → `widgets/CreateInternalCorrespondence/ui/PreviewModal.tsx`
- [ ] `L` 739 → `widgets/CreateInternalCorrespondence/lib/utils.ts`
- [ ] `M` 649 → `widgets/CreateInternalCorrespondence/ui/NavigationPane.tsx`
- [ ] `M` 591 → `widgets/CreateInternalCorrespondence/ui/DocumentDrawer.tsx`
- [ ] `S` 288 → `widgets/CreateInternalCorrespondence/ui/SignerCard.tsx`
- [ ] `S` 280 → `widgets/CreateInternalCorrespondence/ui/OriginalLetterPanel.tsx`
- [ ] `S` 274 → `widgets/CreateInternalCorrespondence/ui/RelatedDocsBlock.tsx`
- [ ] `S` 258 → `widgets/CreateInternalCorrespondence/ui/VersionsPanel.tsx`
- [ ] `⏭️` 280 → `widgets/CreateInternalCorrespondence/lib/constants.ts` — константы, закрыть как SKIP

---

## 🪓 Под-планы для XL-файлов

XL не влезает в одну сессию. Работаем **срезами сверху вниз**, каждый срез — отдельный коммит; файл остаётся рабочим после каждого среза.

**Порядок срезов, одинаковый для всех XL:**

1. **Срез A — типы и константы.** Все `interface`/`type`/литеральные справочники → `model.ts`. Самый безопасный шаг, сильно уменьшает файл.
2. **Срез B — чистые функции.** Всё, что не трогает состояние и хуки → `lib.ts`. Проверка: функция вынеслась без единого нового аргумента-состояния.
3. **Срез C — листовые подкомпоненты.** Куски JSX без собственного состояния, только пропсы → `ui/<Name>.tsx`. По 2–4 за подход.
4. **Срез D — блоки с локальным состоянием.** Панели и секции, чьё состояние никому больше не нужно, уезжают вместе со своим `useState`.
5. **Срез E — хуки.** Связки состояния и эффектов → `lib/useXxx.ts`. **По одному хуку за коммит**, это самый рискованный этап.

Отмечать в логе, на каком срезе остановились: `ChatApp.tsx — срез C, вынесено 6 из ~12 подкомпонентов`.

---

## 📓 Лог

| Дата | Файл | Что вынесено | Было → стало | Коммит |
|---|---|---|---|---|
| 2026-07-30 | `features/Profile/ui/tabs/FilesTab.tsx` | 9 файлов в `files/`: `filesTabModel.ts` (типы), `lazyModals.ts` (7 lazy-объявлений), `confirmations.ts` (3 обёртки `Modal.confirm`), `FilesDropzone.tsx` (+ собственные `isDragOver`/`fileInputRef`), `FilesStates.tsx`, `BulkActionsBar.tsx`, `useFilesSelection.ts`, `useFilesTabActions.ts` (состояние модалок + 10 обработчиков), `FilesModals.tsx` | 522 → **231** (макс. новый — 198) | `refactor(profile): декомпозиция FilesTab` |

---

## 🐞 Находки (чинить ПОСЛЕ кампании, отдельными задачами)

| Дата | Файл | Находка |
|---|---|---|
| 2026-07-30 | `app/routes/AppRouter.tsx` | Закомментированная разводка `RegistryTable` / `NewRegistry` — удалить вместе с решением по модулю 6 |
| 2026-07-30 | `shared/lib/utils.ts` | `formatDatesInObject` — заглушка, возвращает объект без изменений |
| 2026-07-30 | `shared/lib/utils.ts` | `cn()` не разрешает конфликты Tailwind-классов, хотя `tailwind-merge` в зависимостях |
| 2026-07-30 | `pages/modules/correspondence/` | `InternalСorrespondencePage.tsx` — кириллическая `С` в имени файла |
| 2026-07-30 | `widgets/InternalCorrespondece/` | Опечатка в имени директории (пропущена `n`) |
| 2026-07-30 | `files/useFilesTabActions.ts` | `handleCreateFolderSubmit` и `handleAddCategorySubmit` — мёртвый код: объявлены, но нигде не вызываются (модалки используют собственные инлайновые `onSubmit`). Перенесены как есть, удалить отдельной задачей |
| 2026-07-30 | `files/useFilesTabActions.ts` | `handleOpenRenameFolder` принимает `folderName`, но не использует его — ищет папку по `id` |
| 2026-07-30 | `files/useFilesTabActions.ts` | `handleAddCategorySubmit` содержит `as any` в payload `createFolder.mutate` |
| 2026-07-30 | `files/BulkActionsBar.tsx` | Классы `bg-slate-250` / `dark:bg-slate-750` — таких оттенков в Tailwind нет, разделитель невидим |
| 2026-07-30 | `features/Profile/ui/tabs/FilesTab.tsx` | Файл имеет одновременно именованный и `default` экспорт; потребитель (`PersonalCabinet.tsx`) использует именованный — `default` лишний |

---

## 🗒️ История плана

- **2026-07-30** — Трекер переведён с модульных этапов на пофайловые шаги с маркером `⏹`: сессия любой длины заканчивается на целом шаге. Добавлены под-планы срезов для XL-файлов и исключение для файлов-данных.
