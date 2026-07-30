# 🧱 Приведение проекта к AGENTS.md — трекер рефакторинга

> **Единица работы — ОДИН ФАЙЛ.** Сессия всегда заканчивается на целом шаге, следующая продолжает с маркера `⏹`.
> Правила: [`AGENTS.md`](../../AGENTS.md) §4 (структура модуля), §5 (лимит 250 строк), §15 (рефакторинг без изменения поведения).

**Инвариант кампании:** UI, тексты, бизнес-логика и состав сетевых запросов до и после — идентичны. Меняем форму кода, не поведение.

---

## 📨 Промпт для запуска сессии

Копировать целиком в начало каждой новой сессии:

> Работаем по docs/plans/2026-07-30-fsd-refactor-PROGRESS.md. Прочитай сначала AGENTS.md §5, §15 и §18, затем трекер целиком. Найди маркер ⏹ ЧЕКПОИНТ и продолжай со следующего незакрытого шага под ним. Работай строго по одному файлу за раз, по протоколу из трекера. Читай только целевой файл и его прямых соседей — не весь модуль. После каждого файла: отметь шаг [x], передвинь ⏹, допиши строку в Лог, занеси находки в таблицу находок и перечисли изменённые файлы. Не коммить и не пушь — я проверяю и коммичу сам. Ничего не запускай — ни build, ни проверку типов, ни браузер. Поведение приложения меняться не должно: только перемещение кода. Найденные баги не чини — записывай в находки. В конце обязательно дай чек-лист ручной проверки в терминах интерфейса: куда зайти в приложении, что нажать, что должно произойти, и что именно могло сломаться при этом переносе — я не помню, какому экрану соответствует файл. Останавливайся, когда контекста останется меньше 20%, и явно напиши, на каком шаге остановился.

---

## 🔁 Протокол сессии (читать первым)

1. Открыть этот файл, найти маркер `⏹ ЧЕКПОИНТ`, взять **следующий незакрытый шаг** под ним.
2. Прочитать целевой файл и его прямых соседей. Не читать весь модуль.
3. Декомпозировать по `AGENTS.md` §5: типы и константы → чистые функции → подкомпоненты → хуки (именно в этом порядке).
4. **Закрыть шаг:** `- [x]`, передвинуть `⏹` ниже, дописать строку в «Лог», занести находки в общий список.
5. **Отдать на ревью:** перечислить изменённые и созданные файлы. **Не коммитить и не пушить** — это делает пользователь (`AGENTS.md` §18.0).
6. **Дать чек-лист ручной проверки** (обязательно, см. ниже).
7. Остановиться, если бюджет исчерпан или пользователь ещё не принял предыдущий шаг. Иначе — взять следующий шаг.

### Чек-лист ручной проверки — как его писать

Пользователь не помнит, какому экрану соответствует файл. Поэтому после каждого шага агент описывает проверку **в терминах интерфейса, а не кода**.

- **Начинать с маршрута:** куда зайти в приложении, чтобы увидеть затронутое (например, «Профиль → вкладка Файлы → вид Список»).
- **Перечислять действия пользователя**, а не функции: «выделить два файла и нажать Удалить», а не «проверить `handleBulkDeleteConfirm`».
- **Покрывать ровно то, что перенесено.** Не просить перепроверять весь модуль — только сценарии, проходящие через тронутый код.
- **Отдельно выделять рискованные места:** что именно могло сломаться при этом переносе и по какому признаку это будет видно (пропала подсветка, не закрывается модалка, сбилась сортировка).
- **Указывать ожидаемый результат**, если он не очевиден: тост, подтверждение, обновление счётчика.
- Формат — короткий нумерованный список, 5–12 пунктов. Если сценариев больше, значит шаг был слишком крупным.

**Точка возврата — этот файл, а не git.** Маркер `⏹` и «Лог» полностью описывают, где остановились, поэтому коммит для возобновления не нужен. Но принимать шаги стоит по одному: если накопить пять непрокоммиченных шагов, они сольются в один нечитаемый diff. Рекомендованный ритм — просмотреть изменения и закоммитить перед запуском следующей сессии, сообщением вида `refactor(<модуль>): декомпозиция <файл>`.

**Сколько влезает в одну сессию:** `S` — 3–4 файла · `M` — 1–2 · `L` — один файл целиком · `XL` — часть файла (у таких шагов свой под-план).

**Останавливаться заранее.** Не начинать новый файл, если контекста осталось меньше ~20%: лучше закрыть сессию на чистом шаге, чем бросить файл в полуразобранном виде.

**Никогда:** не запускать `build`, проверку типов и браузер без явной просьбы; не чинить найденные баги; не менять разметку, тексты, запросы; не добавлять `memo`/`lazy`/виртуализацию (это отдельный перф-проход по `PERFORMANCE.md`).

---

## 📍 Положение

- **Прогресс:** 8 / 89 шагов закрыто (из них 4 — кандидаты на `⏭️ SKIP`).
- **Последнее обновление:** 2026-07-30 — закрыт `ShareFileModal.tsx`; модуль 0 (Профиль) пройден целиком, чекпоинт на модуле 1 (`features/Login/Login.tsx`).

---

## 🗂️ Шаги

Порядок — от низкого риска к высокому. Начинать сверху; отклоняться можно, но тогда сначала закрывать модуль целиком.

Обозначения: `S` 250–400 строк · `M` 400–700 · `L` 700–1500 · `XL` >1500 · `⏭️` дробить не нужно.

### Модуль 0 — Профиль (хвост; FSD уже сделан)

- [x] `S` 522 → `features/Profile/ui/tabs/FilesTab.tsx` → **231**

- [x] `S` 395 → `features/Profile/ui/tabs/files/FileList.tsx` → **80**

- [x] `S` 313 → `features/Profile/ui/tabs/files/useFilesData.ts` → **214**

- [x] `S` 307 → `features/Profile/ui/tabs/ProfileInfoTab.tsx` → **130**

- [x] `S` 305 → `features/Profile/ui/tabs/files/FilesUserShares.tsx` → **41**

- [x] `S` 272 → `features/Profile/ui/tabs/files/FileCard.tsx` → **100**

- [x] `S` 269 → `features/Profile/ui/tabs/files/FilesHeader.tsx` → **140**

- [x] `S` 253 → `features/Profile/ui/tabs/files/ShareFileModal.tsx` → **148**

⏹ **ЧЕКПОИНТ**

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

| Дата | Файл | Что вынесено | Было → стало | Принято |
|---|---|---|---|---|
| 2026-07-30 | `features/Profile/ui/tabs/files/ShareFileModal.tsx` | 3 файла: `shareFileModalLib.ts` (тип `IShareData`, `getShareName`), `useSharesQuery.ts` (запрос списка выданных доступов + нормализация ответа `data` / `data.data`), `ShareActiveList.tsx` (левый блок «Уже имеют доступ» вместе со своим `shareSearch`, фильтрацией и кнопкой «Закрыть доступ») | 253 → **148** (макс. новый — 82) | на ревью |
| 2026-07-30 | `features/Profile/ui/tabs/files/FilesHeader.tsx` | 4 файла: `filesHeaderModel.ts` (`SORT_OPTIONS`, `SORT_LABELS`), `FilesHeaderTabs.tsx` (вкладки «Мои файлы / Доступные мне / Аналитика» со счётчиками и подчёркиванием), `FilesHeaderSearch.tsx` (поиск вместе с локальным `localSearch` и синхронизацией с пропом), `FilesHeaderSort.tsx` (дропдаун сортировки со своим `sortOpen`/click-outside + кнопка направления). Локальные union-типы пропсов заменены на существующие `TFilesSort`/`TFilesSortDir`/`TFilesViewMode`/`TFilesViewContext` из `filesTabModel.ts` (те же литералы). Вложенный тернарник подписи сортировки заменён на `SORT_LABELS` | 269 → **140** (макс. новый — 81) | на ревью |
| 2026-07-30 | `features/Profile/ui/tabs/files/FileCard.tsx` | 2 файла: `FileCardCover.tsx` (обложка карточки целиком — `COVER_STYLES`, `getCoverContent`, оверлеи: чекбокс выделения, кнопка закрепления, ручка перетаскивания), `FileCardActions.tsx` (ряд иконочных кнопок: просмотр, скачать, переместить, поделиться, удалить). Локальный `formatDate` был байт-в-байт равен `formatFileDate` из `fileListLib.ts` — удалён, карточка использует общий хелпер | 272 → **100** (макс. новый — 125) | на ревью |
| 2026-07-30 | `features/Profile/ui/tabs/files/FilesUserShares.tsx` | 4 файла: `filesSharesLib.ts` (цвета, стиль тултипа, типы, `buildSharedWithMeData`, `buildSharedFoldersData`), `FilesSharesEmptyBar.tsx`, `SharedWithMeCard.tsx` (левая карточка с диаграммой/списком и пагинацией), `MySharesCard.tsx` (правая карточка) | 305 → **41** (макс. новый — 174) | на ревью |
| 2026-07-30 | `features/Profile/ui/tabs/ProfileInfoTab.tsx` | новая подпапка `profileInfo/` (по образцу `files/`): `profileInfoLib.ts` (`resolvePhotoUrl`, `orDash`, `formatDate`, константы), `ProfileInfoCards.tsx` (`InfoRow`, `Card`), `useProfileAvatarUpload.ts` (загрузка фото + сброс ошибки аватара), `ProfileAvatarCard.tsx` (левая карточка со своим состоянием) | 307 → **130** (макс. новый — 85) | на ревью |
| 2026-07-30 | `features/Profile/ui/tabs/files/useFilesData.ts` | 3 файла: `filesDataModel.ts` (типы + `COUNT_FETCH_SIZE`), `filesDataLib.ts` (`buildFolderFileCounts`, `getArrayData`, `sortByManualOrder`, `getFolderIcon`, `buildCategoriesList`), `useFilesQueries.ts` (мемо-параметры + 7 `useGetQuery`) | 313 → **214** (макс. новый — 104) | на ревью |
| 2026-07-30 | `features/Profile/ui/tabs/files/FileList.tsx` | 5 файлов: `fileRowVisuals.tsx` (`getSmallIcon`, `getTypeBadge`), `fileListLib.ts` (`downloadFile`, `formatFileDate`), `useFileDragReorder.ts` (состояние и обработчики перетаскивания), `FileListHeader.tsx` (`thead`), `FileListRow.tsx` (`tr`) | 395 → **80** (макс. новый — 197) | на ревью |
| 2026-07-30 | `features/Profile/ui/tabs/FilesTab.tsx` | 9 файлов в `files/`: `filesTabModel.ts` (типы), `lazyModals.ts` (7 lazy-объявлений), `confirmations.ts` (3 обёртки `Modal.confirm`), `FilesDropzone.tsx` (+ собственные `isDragOver`/`fileInputRef`), `FilesStates.tsx`, `BulkActionsBar.tsx`, `useFilesSelection.ts`, `useFilesTabActions.ts` (состояние модалок + 10 обработчиков), `FilesModals.tsx` | 522 → **231** (макс. новый — 198) | коммит `23b5c16` — на ревью |

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
| 2026-07-30 | `files/FileList.tsx` | `onTogglePin` принимается и передаётся из `FileGridList`, но в списочном виде не используется: закрепить файл можно только в плиточном. Похоже на потерянный функционал, а не на замысел |
| 2026-07-30 | `files/fileListLib.ts` | Логика скачивания через blob продублирована в `FileGrid.tsx` и `preview/lib.ts`. Вынесен `downloadFile`, но переводить на него остальных потребителей — отдельная задача |
| 2026-07-30 | `files/fileRowVisuals.tsx` | В обоих `switch` ветка `case "document": default:` объявляет `const` без блока `{}` — нарушение `no-case-declarations`, перенесено как есть |
| 2026-07-30 | `files/FileListRow.tsx` | Иконочные кнопки действий без `aria-label` (есть только `Tooltip`) — расходится с `AGENTS.md` §11 |
| 2026-07-30 | `files/useFilesData.ts` | `params.dir` стоит в зависимостях трёх `useMemo` (`sharedFiles`, `pinnedFiles`, `currentFiles`), но внутри не используется — направление сортировки применяет бэкенд. Лишняя зависимость, перенесена как есть |
| 2026-07-30 | `files/useFilesQueries.ts` | На один экран уходит по два запроса к `MY_FILES` и к `MY_FILES_SHARED_WITH_ME`: основной постраничный и «счётный» с `per_page: 100`. Счётчики считаются на клиенте через `Math.max` из четырёх источников — похоже на обход отсутствующего общего счётчика на бэкенде |
| 2026-07-30 | `files/useFilesData.ts` | `filesPagination` и `sharedFilesPagination` — новые объекты на каждом рендере, уходят вниз пропсами. Кандидат на `useMemo` в перф-проходе |
| 2026-07-30 | `files/FilesUserShares.tsx` | `EmptyBar` был объявлен **внутри** тела компонента — новый тип компонента на каждый рендер и полный ремоунт поддерева. Вынесен в отдельный файл; визуально идентичен (без состояния и анимаций), но это была реальная ошибка |
| 2026-07-30 | `files/MySharesCard.tsx` | Карточка «С кем я делюсь» группирует файлы по **папкам**, а не по получателям, хотя подпись гласит «Файлов по получателям» и вторая строка — «Папка в хранилище». Данные не соответствуют заголовку |
| 2026-07-30 | `files/SharedWithMeCard.tsx` | Кнопки переключения вида используют нативный атрибут `title` вместо `Tooltip` — расходится с `AGENTS.md` §11 |
| 2026-07-30 | `files/SharedWithMeCard.tsx` | Пагинация считает `total` по всем общим файлам, а диаграмма строится только по текущей странице (топ-6 владельцев) — при переходе на вторую страницу картина меняется целиком |
| 2026-07-30 | `tabs/ProfileInfoTab.tsx` | `THEMES` тянется из `@widgets/layout/ui/designSettings` — импорт из `features` в `widgets`, да ещё глубокий, в обход публичного API. Нарушение `AGENTS.md` §3, перенесено как есть |
| 2026-07-30 | `tabs/ProfileInfoTab.tsx` | Тема читается напрямую из `localStorage.getItem("currentTheme")` внутри компонента, ключ — строка без константы (§7) |
| 2026-07-30 | `tabs/ProfileInfoTab.tsx` | Поля `birth_date`/`birthday`, `address`, `work_email`, `work_phone` читаются через `(userData as any)` — тип `IUser` из `entities/login` не покрывает реальный ответ `auth/me` |
| 2026-07-30 | `tabs/ProfileInfoTab.tsx` | В блоке «Биография» строка `"Не указано"` захардкожена, хотя рядом используется константа `NOT_SET` с тем же значением |
| 2026-07-30 | `files/useSharesQuery.ts` | При `item === null` в `useGetQuery` уходит пустой `url` (запрос выключен через `enabled`), но ключ кэша всё равно строится по пустой строке. Работает, но выглядит как обход отсутствия ленивого запроса |
| 2026-07-30 | `files/useSharesQuery.ts` | Ответ приходит в двух формах — массив или `{ data: [...] }`, нормализация с `as any`. Бэкенд отдаёт разный контракт для файлов и папок |
| 2026-07-30 | `files/ShareFileModal.tsx` | `handleGrantAccess` показывает свой `toast.success` — при переводе `onInvite` на `useMutationQuery` получится дубль тоста (§9) |
| 2026-07-30 | `files/ShareFileModal.tsx` | В сообщении «Доступ успешно предоставлен (N пользователей)» склонение только для `1`; при 2–4 будет «2 пользователей» |
| 2026-07-30 | `files/ShareFileModal.tsx` | Ошибка `onInvite` перехватывается общим `catch` на `Promise.all`: при частичном отказе часть приглашений уже ушла, но пользователь видит только «Не удалось предоставить доступ» |
| 2026-07-30 | `files/ShareActiveList.tsx` | Поле поиска появляется только при более чем 5 записях, но введённый текст не сбрасывается, если список сократился — фильтр продолжает действовать невидимо |
| 2026-07-30 | `files/FilesHeader.tsx` | Union-типы `"date" \| "size" \| "name" \| "manual"` и др. были продублированы прямо в пропсах, хотя те же типы уже объявлены в `filesTabModel.ts`. При переносе заменены на общие — литералы совпадают |
| 2026-07-30 | `files/FilesHeader.tsx` | `THEMES` и `useDesignSettings` импортируются из `@widgets/layout/ui/...` — импорт из `features` в `widgets`, да ещё глубокий (§3). Та же проблема, что в `ProfileInfoTab.tsx` |
| 2026-07-30 | `files/FilesHeaderSort.tsx` | Кнопка направления сортировки использует нативный атрибут `title` вместо `Tooltip` (§11) |
| 2026-07-30 | `files/FilesHeaderSearch.tsx` | Поиск применяется только по Enter или клику по лупе, при этом иконка «крестик» сбрасывает поиск сразу. Поведение непоследовательное, но перенесено как есть |
| 2026-07-30 | `files/FilesHeaderTabs.tsx` | Вкладка «Аналитика» — единственная без счётчика; `count` там просто `undefined`, счётчик скрыт через `If`. Возможно, забытый показатель |
| 2026-07-30 | `files/FileCard.tsx` | Локальный `formatDate` полностью дублировал `formatFileDate` из `fileListLib.ts` (та же дата, та же локаль). При переносе заменён на общий хелпер — вывод идентичен |
| 2026-07-30 | `files/FileCardCover.tsx` | `getCoverContent` определяет тип класса эвристикой `config.bg.includes(" ")`: пробел в строке = градиент, иначе обычный класс. Хрупко — добавление второго слова в `excel-grid-bg` молча сломает фон таблиц |
| 2026-07-30 | `files/FileCardCover.tsx` | `COVER_STYLES` типизирован `React.ComponentType<any>` — `any` в существующем коде, перенесён как есть |
| 2026-07-30 | `files/FileCardCover.tsx` | Чекбокс выделения — `<div>` с `onClick`, без `role`/`tabIndex`/клавиатуры, хотя в классах есть `focus:` состояния, которые никогда не сработают (§11) |
| 2026-07-30 | `files/FileCardActions.tsx` | Иконочные кнопки действий без `aria-label` (только `Tooltip`) — та же проблема, что и в `FileListRow.tsx`, §11 |
| 2026-07-30 | `files/useFilesData.ts` | Хук возвращает 24 поля, потребитель использует ~17: `refetchFiles`, `isLoadingFolders`, `refetchFolders`, `isLoadingMeta`, `refetchMeta`, `refetchSharedFiles`, `isLoadingSharedFolders`, `refetchSharedFolders` нигде не читаются |

---

## 🗒️ История плана

- **2026-07-30** — Трекер переведён с модульных этапов на пофайловые шаги с маркером `⏹`: сессия любой длины заканчивается на целом шаге. Добавлены под-планы срезов для XL-файлов и исключение для файлов-данных.
