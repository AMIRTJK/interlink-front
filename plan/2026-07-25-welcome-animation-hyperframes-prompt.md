# PROMPT: Экран приветствия после авторизации (Welcome Animation) + HyperFrames

> **Как использовать этот файл.** Это готовый промт-задание для AI-агента (Claude Code).
> Открой новую сессию в корне `interlink-front` и напиши:
> `Выполни задание из plan/2026-07-25-welcome-animation-hyperframes-prompt.md`
> Разделы 1–3 — проверенный контекст проекта (можно не перепроверять).
> Разделы 4–9 — само задание. Раздел 10 — HyperFrames. Раздел 11 — критерии приёмки.

---

## 0. Статус на 25.07.2026 (что уже сделано в репозитории)

Разделы 4–9 **реализованы**: маршрут `/auth/welcome`, гейт, прогрев профиля, все 5 анимаций
на `framer-motion`, переключатель в настройках профиля с предпросмотром, режимы показа.
`npx tsc --noEmit` проходит без ошибок. Файлы — см. §6, все созданы.

HyperFrames установлен (`.agents/skills/`, 19 скилов, CLI v0.7.71). Собрана **одна**
композиция — `hyperframes/welcome-dossier/`, `npx hyperframes check` проходит без ошибок.
Остальные четыре композиции (§10.3) ещё не собраны, и для `render` в MP4 нужны
**FFmpeg + FFprobe в PATH** (их нет). Поэтому этот файл дальше используется как задание
на: (а) четыре оставшиеся композиции, (б) видео-лейн **B** и спайк **C** из §10.2.

---

## 1. Что нужно сделать (в одном абзаце)

После нажатия «Продолжить» на странице логина пользователь попадает **не сразу в профиль**,
а на отдельную полноэкранную страницу `/auth/welcome`, где играет кинематографичная
анимация приветствия (5–10 секунд). Пока она играет — в фоне прогреваются данные профиля
и lazy-чанки, поэтому после анимации `/profile` открывается мгновенно, без спиннера.
Анимаций **пять на выбор**, переключатель живёт в настройках профиля, выбор хранится
в `localStorage`. Анимации проектируются и таймируются через **HyperFrames**
(HTML + paused GSAP timeline), а затем переносятся в React-рантайм на `framer-motion`.

---

## 2. Проверенный контекст проекта (факты, не предположения)

### 2.1 Стек

| Что | Версия / деталь |
| --- | --- |
| React | 19.2 + TypeScript 5.9 (strict), Vite 7 + SWC |
| Роутинг | `react-router-dom` 7.10, `BrowserRouter` |
| Анимации | `framer-motion` ^12.23 — **уже в 123 файлах**, свой чанк `motion-vendor` в `vite.config.ts` |
| Стили | Tailwind 4 (`@tailwindcss/vite`), тёмная тема через `@custom-variant dark (&:where(.dark, .dark *))` |
| UI-кит | Ant Design 6 + `lucide-react` (иконки) |
| Данные | `@tanstack/react-query` v4 (`queryClient` в `src/shared/lib/queryClient.ts`) |
| Node / npm | v25.2.1 / 11.6.2 (для HyperFrames нужен ≥22 — **ок**) |
| FFmpeg | **не найден в PATH** — нужен только для `hyperframes render` в MP4 |

Алиасы (из `vite.config.ts` + `tsconfig.json`): `@app`, `@pages`, `@widgets`, `@features`,
`@entities`, `@shared`.

### 2.2 Как сейчас работает авторизация

`src/features/Login/Login.tsx` — двухшаговая форма (телефон+пароль → опционально MFA/OTP).
Обе ветки сходятся в одну функцию:

```ts
// Login.tsx:68-73
const finishLogin = (token: string, userId?: number) => {
  tokenControl.set({ token });
  if (userId) tokenControl.setUserId(userId);
  toast.success("Вход выполнен");
  navigate(AppRoutes.PROFILE, { replace: true });
};
```

**Это единственная точка врезки** — менять надо только её (обе ветки, обычная и MFA,
уже проходят через неё).

- `src/pages/Auth/Auth.tsx` — фон-видео `/videos/bg-auth-video.mp4` + glassmorphism-карточка,
  заголовок `I N T E R L I N K`, база `bg-[#020617]`, акцент `blue-600 → indigo-600`.
- `src/shared/lib/tokenControl.ts` — обёртка над `localStorage`, ключи с префиксом
  `interlink/…` (`interlink/token`, `interlink/userId`, `interlink/userData`, …).
- `src/app/routes/PrivateRoute.tsx` — редиректит на `AppRoutes.LOGIN`, если нет токена.
- `src/shared/lib/hooks/useLogout.ts` — `tokenControl.remove()` + `queryClient.clear()` +
  `window.location.replace(AppRoutes.LOGIN)`.

### 2.3 Куда пользователь попадает

`AppRoutes.PROFILE = "/profile"` → `ProfileLayout` (lazy) → `ProfilePage` (lazy) →
`features/Profile/Profile.tsx` → делает `useGetQuery(ApiRoutes.AUTH_ME)` → `PersonalCabinet`.
То есть после логина грузятся **два lazy-чанка + один сетевой запрос** — ровно то,
что мы прогреваем за время анимации.

### 2.4 Настройки оформления (готовая инфраструктура — переиспользовать!)

- `src/widgets/layout/ui/designSettings.ts` — `THEMES` (11 тем: `emerald` по умолчанию,
  `blue`, `galaxy`, `ocean`, `sunset`, …), у каждой `gradient` / `light` / `dark` / `swatch`;
  `BACKGROUNDS` (6 фонов).
- `src/widgets/layout/ui/useDesignSettings.ts` — читает `localStorage.currentTheme` /
  `currentBg`, следит за `dark` на `<html>` через `MutationObserver`.
- `src/widgets/layout/ui/designPopovers.tsx` — **эталон UI переключателя**: список кнопок,
  круглый свотч `w-10 h-10 rounded-full bg-gradient-to-br`, активный = `ring-2 ring-indigo-400`
  + `<CheckCircle>` справа, запись в `localStorage` + `window.dispatchEvent(new StorageEvent(...))`.
- `src/features/Profile/ui/settings/settingsUi.tsx` — `useSettingsTheme()`, `PrimaryButton`,
  `PlainButton`, `PasswordField`, `OtpInput`.
- `src/features/Profile/ui/settings/SettingsModalShell.tsx` — оболочка модалки настроек.
- `src/features/Profile/ui/ProfileSettingsModal.tsx` — сейчас содержит `<MfaSecurity/>` +
  `<ChangePassword/>` в `<div className="space-y-3">`. **Сюда добавляется переключатель.**

### 2.5 Ближайший аналог того, что делаем (копировать паттерн!)

`src/features/Profile/ui/DesktopMode/` — режим «рабочего стола» с 6 живыми фонами:

```
DesktopMode/
  index.ts
  model.ts          → type TDesktopScene | ISceneOption | SCENES[] | STORAGE_SCENE_KEY
  ui.tsx            → createPortal + motion.div + switch(activeScene) + док-переключатель снизу
  Backgrounds/      → SpaceBg | AuroraBg | RainBg | ParticlesBg | OceanBg | MountainsBg
```

Реестр сцен в `model.ts`, компонент-сцена на файл, переключатель — pill-док с
`layoutId="desktopActiveSceneBg"`. **Welcome-анимации делаем ровно по этой схеме.**

### 2.6 Бренд

- `src/shared/ui/Logo/Logo.tsx` → живой текст **`INFRATECH`**, шрифт **Orbitron**
  (`font-weight: 400 900`, `letter-spacing: 0.25em`), самохостится в
  `/public/fonts/Orbitron-Variable.woff2`, `@font-face` в `src/app/styles/global.css`.
  **Внешние CDN шрифтов запрещены** (в Orbitron нет кириллицы — она падает на system sans).
- Заголовок страницы логина — `I N T E R L I N K`. В анимации логично показать оба:
  `INTERLINK` (система) и `INFRATECH` (бренд).
- Домен системы: электронная корреспонденция, входящие/исходящие письма, визы, резолюции,
  ЭЦП-штамп, HR, задачи, администрирование. Тональность анимации — **корпоративная,
  «безопасно и технологично»**, не игровая.

### 2.7 Подводный камень: `TabNavigation`

`src/app/routes/AppRouter.tsx:198` рендерит `<TabNavigation />` **над** `<Routes>`, то есть
глобально. `TabNavigation.tsx:12` выходит в `null` только при `tabMode === "off"` или пустых
вкладках. При открытых вкладках плашка **всплывёт поверх полноэкранной анимации** —
её надо погасить на `/auth/*`.

---

## 3. Обязательные правила кода (из `GEMINI.md` — нарушать нельзя)

1. **Только стрелочные функции**: `const X = () => {}`. `function` запрещён.
2. **Один `return` с JSX** на компонент. Ранние `return` для загрузки/ошибок запрещены.
3. **Условный рендеринг только через `<If is={...}>`** из `@shared/ui`
   (проп называется `is`, не `condition`). `&&` и тернарники с `null` запрещены.
4. **Комментарии запрещены** (`//`, `/* */`, JSDoc, JSX-комментарии). Код самодокументируемый.
   *Исключение по факту репозитория: короткие пояснения «зачем» в новых `model.ts`/хуках
   встречаются в проекте — если добавляешь, то только «почему», никогда «что».*
5. **Максимум 200 строк на файл.** Превысил — декомпозируй.
6. **Никакого хардкода путей**: UI — через `AppRoutes`, API — через `ApiRoutes`.
   Магические строки/числа — в `model.ts` или `shared/config`.
7. **Импорты между слоями — только через алиасы и `index.ts`.** Глубокие импорты запрещены.
8. **FSD-поток данных**: `pages` (только монтирование, без логики и разметки) →
   `widgets` (стейт, все API-запросы, обработка загрузки) → `features` (UI по пропсам) →
   `features/ui/`.
9. **Tailwind-only.** `style={{}}` запрещён. `important` — **постфиксом**: `flex!`, не `!flex`.
   *Исключение:* динамические значения, которые нельзя выразить классом (например
   `transform` от вычисленного угла) — только через `motion`-пропсы `framer-motion`
   (`animate={{ rotate: deg }}`), не через `style`.
10. **Локальные стили** — в `style.css` рядом с компонентом; глобальные — в `global.css`.
11. **Никаких `translateY` на hover** у карточек/плашек — только цвет/границы/тень.
12. **Нативные тултипы (`title`) запрещены** — только `<Tooltip>` из `@shared/ui`.
13. **Lazy-loading** для всего тяжёлого + `<Suspense>`; `React.memo` для тяжёлых детей;
    колбэки вниз — через `useCallback`.
14. **Не запускать `npm run build`** и не гонять принудительную проверку типов без
    явной просьбы пользователя. **Не проводить браузерную/визуальную проверку** —
    визуальное тестирование делает пользователь сам.

Именование: БЭМ `block__element-modifier` (двойной дефис `--` запрещён);
внутри компонента `interface IProps` / `type TState`; экспортируемые — `I[Name]` / `T[Name]`.

---

## 4. Целевой поток

```
[Login: «Продолжить»]
        │  POST /login (+ опц. MFA /mfa/verify)
        ▼
finishLogin(token, userId)
        │  tokenControl.set → sessionStorage: interlink/welcomePending = "1"
        ▼
navigate("/auth/welcome", { replace: true, state: { to: AppRoutes.PROFILE } })
        │
        ├── Слой 1 (видимый):  выбранная анимация, 5–10 с, кнопка «Пропустить» через 1.5 с
        └── Слой 2 (фоновый):  prefetch AUTH_ME  +  import(ProfileLayout)  +  import(ProfilePage)
        │
        ▼  когда (анимация доиграла И prefetch завершён) ИЛИ таймаут 9 с ИЛИ «Пропустить»
navigate("/profile", { replace: true })   ← профиль уже прогрет, спиннера нет
```

**Правила гейта (важно):**
- Флаг `interlink/welcomePending` в **`sessionStorage`**, ставится в `finishLogin`,
  снимается при уходе с `/auth/welcome`. Это делает экран **одноразовым**: F5 на
  `/auth/welcome`, переход по прямой ссылке или `Назад` из профиля не проигрывают анимацию
  повторно, а сразу редиректят на `/profile`.
- Нет токена → `Navigate` на `AppRoutes.LOGIN`.
- `useLogout` дополнительно чистит флаг (иначе после выхода/входа возможна рассинхронизация).
- Режим показа (см. §6): `always` | `once-a-day` | `off`. Для `once-a-day` — метка
  `interlink/welcomeLastShown` (ISO-дата) в `localStorage`; при `off` `finishLogin` вообще
  не идёт на `/auth/welcome`.

---

## 5. Пять анимаций (спецификация)

Все — полноэкранные, длительность **5.0–8.0 с**, тёмная кинематографичная база
(`#020617` / `slate-950`), акцент берётся из активной темы (`THEMES[currentTheme].gradient`
или `.dark`/`.light`), поэтому анимация автоматически «в цвет» системы.
Финальный кадр каждой — **имя пользователя + `INFRATECH`/`INTERLINK`** и мягкий уход
в цвет фона профиля (чтобы стык с `/profile` был бесшовным).

| № | key | Название | Идея | Техника | Длит. |
| --- | --- | --- | --- | --- | --- |
| 1 | `neural` | «Нейросеть» | Узлы сети зажигаются по цепочке, связи прочерчиваются между ними, сеть стягивается в монограмму логотипа | inline SVG + `motion.path` c `pathLength` 0→1, `stagger` по узлам | 6.5 с |
| 2 | `dossier` | «Досье» | Листы писем слетаются из-за кадра, складываются в стопку, на верхний падает печать ЭЦП (кольцо + вспышка), стопка распадается в сетку дашборда | `motion.div` карточки + `AnimatePresence`, 3D `rotateX/rotateY`, `perspective` | 7.0 с |
| 3 | `aurora` | «Аврора» | Жидкий градиентный меш дышит и перетекает, по буквам бренда проходит световой свип, лёгкое зерно | 3–4 blur-blob `div` + `mask-image` свип + CSS `@keyframes` | 5.0 с |
| 4 | `orbit` | «Орбита» | Иконки модулей (Корреспонденция, HR, Задачи, Администрирование) вращаются по концентрическим орбитам и защёлкиваются в сетку; кольцо прогресса замыкается по мере прогрева данных | `motion` + `transformOrigin`, SVG `circle` со `strokeDashoffset` от реального прогресса | 6.0 с |
| 5 | `protocol` | «Протокол» | Кинетическая типографика: «УСТАНОВКА ЗАЩИЩЁННОГО СОЕДИНЕНИЯ», эффект расшифровки (скрембл символов → настоящее ФИО), чек-лист шагов «Токен получен → Профиль загружен → Права применены», скан-линия по hex-сетке | `motion` + управляемый скрембл на `useAnimationFrame` (не `setInterval`) | 6.0 с |

**Рекомендация по дефолту:** `dossier` — сильнее всех попадает в предметную область
(электронная корреспонденция + ЭЦП). `aurora` — самая «дешёвая» по GPU, ставится как
fallback на слабых машинах.

**Опционально (не обязательно):** шестой пункт `random` — «Случайная», выбирает одну
из пяти при каждом входе.

### Единый контракт компонента анимации

```ts
export interface IWelcomeAnimationProps {
  userName: string;
  themeGradient: string;
  accentColor: string;
  isDark: boolean;
  progress: number;
  onComplete: () => void;
}
```

- `progress` (0→1) — реальный прогресс прогрева (prefetch + чанки). Использовать в `orbit`
  (кольцо) и `protocol` (чек-лист); остальным можно игнорировать.
- `onComplete()` — вызывается **строго один раз** по завершении таймлайна
  (через `onAnimationComplete` у последнего `motion`-узла либо `setTimeout` на
  `duration`, очищаемый в `useEffect` cleanup).
- Все анимируем **только `transform` и `opacity`**. `width/height/top/left/filter` в
  таймлайне — запрещены (кроме статических `blur` на декоративных блобах).
- `will-change` — точечно, не на десятки узлов.

---

## 6. Файловая карта (создать / изменить)

### Создать

```
src/widgets/AuthWelcome/
├── index.ts                          экспорт AuthWelcome
├── ui.tsx                            оркестратор: prefetch, прогресс, тайминги, navigate  (≤200 стр.)
├── model.ts                          TWelcomeAnimation, WELCOME_ANIMATIONS, ключи, тайминги, режимы
├── lib.ts                            useProfileWarmup(), useWelcomeGate(), useReducedMotion()
└── ui/
    ├── WelcomeStage.tsx              lazy-подгрузка выбранной анимации + Suspense + reduced-motion fallback
    ├── SkipButton.tsx                «Пропустить» (появляется через WELCOME_SKIP_DELAY_MS)
    ├── animations/
    │   ├── NeuralAnimation.tsx
    │   ├── DossierAnimation.tsx
    │   ├── AuroraAnimation.tsx
    │   ├── OrbitAnimation.tsx
    │   └── ProtocolAnimation.tsx
    └── parts/
        ├── BrandReveal.tsx           общий финальный кадр: INFRATECH + ФИО + подпись
        ├── ProgressRing.tsx          SVG-кольцо от progress
        └── ScrambleText.tsx          эффект расшифровки текста
src/pages/Auth/AuthWelcomePage.tsx    только монтирование <AuthWelcome/>
src/app/routes/WelcomeRoute.tsx       гейт: токен + одноразовый флаг + режим показа
src/features/Profile/ui/WelcomeAnimationSettings.tsx   карточка-переключатель в настройках  (≤200 стр.)
```

### Изменить

| Файл | Изменение |
| --- | --- |
| `src/shared/config/AppRoutes.ts` | `+ AUTH_WELCOME: "/auth/welcome"` |
| `src/app/routes/AppRouter.tsx` | lazy-импорт `AuthWelcomePage` + `<Route path={AppRoutes.AUTH_WELCOME} element={<WelcomeRoute/>}>` с вложенным `index`-элементом |
| `src/features/Login/Login.tsx` | в `finishLogin`: поставить `sessionStorage` флаг и `navigate(AppRoutes.AUTH_WELCOME, { replace: true })`; при режиме `off` — как раньше, сразу в `PROFILE` |
| `src/features/Profile/ui/ProfileSettingsModal.tsx` | `+ <WelcomeAnimationSettings/>` в `space-y-3` |
| `src/features/Profile/ui/index.ts` | экспорт нового компонента (если он там реэкспортируется) |
| `src/widgets/TabNavigation/ui/TabNavigation.tsx` | погасить плашку на `/auth/*`: добавить `pathname.startsWith("/auth")` в существующее условие выхода в `null` (`useLocation` там уже есть) |
| `src/shared/lib/hooks/useLogout.ts` | очистка `interlink/welcomePending` |

**Ничего не удалять и не переписывать** в `DesktopMode`, `Header`, `designPopovers` —
только читать как эталон.

### Ключи хранения (в `AuthWelcome/model.ts`, не хардкодить по месту)

```ts
export const WELCOME_ANIMATION_KEY = "interlink/welcomeAnimation";
export const WELCOME_MODE_KEY = "interlink/welcomeMode";
export const WELCOME_LAST_SHOWN_KEY = "interlink/welcomeLastShown";
export const WELCOME_PENDING_KEY = "interlink/welcomePending";
export const WELCOME_TIMEOUT_MS = 9000;
export const WELCOME_SKIP_DELAY_MS = 1500;
export const WELCOME_REDUCED_MOTION_MS = 600;
```

---

## 7. Прогрев профиля (`useProfileWarmup` в `lib.ts`)

Смысл экрана — не «задержать пользователя», а **занять время полезной работой**:

```ts
const warmup = () =>
  Promise.allSettled([
    queryClient.prefetchQuery([ApiRoutes.AUTH_ME], () => _axios.get(ApiRoutes.AUTH_ME)),
    import("@widgets/layout"),
    import("@pages/modules/profile/ProfilePage"),
  ]);
```

- **Ключ кэша обязан совпадать** с тем, что генерирует `useGetQuery` в
  `features/Profile/Profile.tsx` — иначе prefetch бесполезен. Перед реализацией
  **прочитать `src/shared/lib/hooks/useGetQuery.ts`** и взять точную форму ключа;
  ключи держать в `shared/config` (`correspondenceKeys.ts` — пример существующего реестра).
- Прогресс считать как долю выполненных задач + плавную интерполяцию по времени
  (чтобы кольцо не прыгало 0 → 1).
- Ошибка prefetch **не должна ломать переход**: `allSettled`, профиль сам перезапросит.

---

## 8. Переключатель в профиле (`WelcomeAnimationSettings.tsx`)

Живёт в модалке настроек (`ProfileSettingsModal`), стилистика — как `MfaSecurity`/
`ChangePassword`, свотчи — как в `designPopovers.tsx`.

Состав карточки:

1. Заголовок «Анимация входа» + иконка `Sparkles` (`lucide-react`).
2. Список из 5 пунктов: круглый свотч с превью-градиентом анимации,
   название (`labelRu`), краткое описание в одну строку;
   активный — `ring-2 ring-indigo-400` + `<CheckCircle>` справа.
3. Кнопка «Посмотреть» (`PrimaryButton` из `settingsUi.tsx`) — проигрывает выбранную
   анимацию поверх интерфейса **через `createPortal`** (как `DesktopMode`), с кнопкой
   закрытия. Без этого пользователь не сможет сравнить варианты, не разлогиниваясь.
4. Селект/сегмент «Показывать»: «Всегда» / «Раз в день» / «Выключить».
5. Запись в `localStorage` + `window.dispatchEvent(new StorageEvent(...))` —
   как это делает `ThemeContent` в `designPopovers.tsx`.

---

## 9. Доступность и производительность (обязательно)

- **`prefers-reduced-motion: reduce`** → анимация не играет вовсе: короткое затемнение
  `WELCOME_REDUCED_MOTION_MS` и переход. Проверять через
  `window.matchMedia("(prefers-reduced-motion: reduce)")`.
- **Кнопка «Пропустить»** через 1.5 с, плюс `Esc` и `Enter` — тоже пропуск.
  Корпоративный пользователь логинится много раз в день, запирать его нельзя.
- **Жёсткий таймаут `WELCOME_TIMEOUT_MS`** — если prefetch зависнет, всё равно уходим в профиль.
- **Lazy-loading**: каждая из 5 анимаций — отдельный `React.lazy`. В бандл логина
  попадает только выбранная. Проверить, что чанки не утянули за собой `recharts`/`antd`.
- **Cleanup**: все `setTimeout` / `useAnimationFrame` / подписки снимать в `useEffect`
  return. Ни одного «живущего» таймера после `navigate`.
- **`repeat: Infinity`** допустим только на декоративных фоновых слоях и обязан
  прекращаться при размонтировании.
- Только `transform`/`opacity`; целимся в 60 fps на интегрированной графике.
- Мобильный вид: анимации адаптивные (Mobile First), логотип и текст не должны обрезаться
  на 375 px.

---

## 10. HyperFrames: как именно его здесь применять

### 10.1 Что это на самом деле

**HyperFrames** (HeyGen) — инструмент, где **HTML + CSS + приостановленный GSAP-таймлайн**
являются исходником видео, а CLI рендерит это в MP4. Это **не рантайм-библиотека для
React-SPA**: нельзя «подключить HyperFrames» вместо `framer-motion`. Поэтому для нашей
задачи он даёт **дизайн-стенд с покадровым скраббингом** — самое ценное при выставлении
таймингов и easing'ов.

Установка (запускает **пользователь**, не агент — это изменение окружения):

```bash
npx hyperframes doctor
```

```bash
npx skills add heygen-com/hyperframes --full-depth
```

Либо плагин из каталога Claude Code: `claude.com/plugins/hyperframes`.
Требования: **Node ≥22** (у нас 25.2.1 ✓) и **FFmpeg** (сейчас **нет в PATH** —
нужен только для `render`; `preview` и `lint` работают без него).

### 10.2 Три возможных сценария использования

| Сценарий | Что делаем | Плюсы | Минусы | Вердикт |
| --- | --- | --- | --- | --- |
| **A. Дизайн-стенд** | Каждую из 5 анимаций сначала собираем как HyperFrames-композицию, вылизываем тайминг в `npx hyperframes preview`, затем **переносим таблицу таймингов** в React/`framer-motion` | Точный тайминг, покадровое сравнение вариантов, ноль веса в бандле, полная персонализация (ФИО, аватар, тема) | Двойная работа: композиция + React-порт | ✅ **основной** |
| **B. Видео** | `npx hyperframes render -o welcome-<key>.mp4` (+ WebM/VP9), играем как `<video muted playsinline>` | Кинематографичное качество, нулевая нагрузка на CPU, у проекта уже есть `/public/videos/bg-auth-video.mp4` — прецедент есть | Нельзя вставить настоящее ФИО/аватар/тему; мегабайты в `public/`; не адаптируется под reduced-motion и под 375 px | 🟡 **гибрид**: видео как фоновый слой, живой DOM — поверх (текст, ФИО, прогресс) |
| **C. `<hyperframes-player>`** | Веб-компонент из `@hyperframes/player` играет композицию живьём в React | Один источник правды, без порта | Тянет GSAP + player-рантайм в бандл; надо мерить вес и совместимость с React 19 | 🔬 **спайк**: замерить вес чанка, решать по цифрам |

**Порядок работ:** сначала **A** для всех пяти (это и есть «протестировать HyperFrames»),
потом при желании **B** для одной самой тяжёлой (`dossier`) и **C** как отдельный
эксперимент. Ни при каком сценарии рантайм-реализация на `framer-motion` не удаляется —
она остаётся fallback'ом.

### 10.3 Где лежат композиции

```
hyperframes/
├── DESIGN.md                    палитра THEMES + Orbitron + тональность бренда
├── welcome-neural/index.html
├── welcome-dossier/index.html
├── welcome-aurora/index.html
├── welcome-orbit/index.html
└── welcome-protocol/index.html
```

Папку `hyperframes/` добавить в `.gitignore`? **Нет** — `index.html` композиций коммитим
(это дизайн-исходник), а вот `*.mp4`/`out/` — в `.gitignore`.

### 10.4 Обязательные конвенции HyperFrames

Скелет композиции:

```html
<div id="main" data-composition-id="main"
     data-width="1920" data-height="1080" data-duration="7">
  <div class="scene clip" id="s1" data-start="0" data-duration="2.5" data-track-index="0">
    <div class="scene-content">…</div>
  </div>
</div>
<script>
  var tl = gsap.timeline({ paused: true });
  tl.from("#s1-title", { y: 40, autoAlpha: 0, duration: 0.6, ease: "power3.out" }, 0.2);
  window.__timelines["main"] = tl;
</script>
```

Правила, которые нельзя нарушать:

- Каждая сцена — `class="scene clip"` + `data-start` + `data-duration` + `data-track-index`;
  контент строго внутри `<div class="scene-content">`.
- Таймлайн **paused** и зарегистрирован как `window.__timelines["main"]`
  (ключ = `data-composition-id`).
- Окна сцен **стыкуются без зазоров**; поменял длительность — обнови `data-start` дальше.
- **Запрещено:** `Math.random()`, `Date.now()`, `repeat: -1`, `requestAnimationFrame`,
  `<video>` со звуком, exit-твины перед shader-переходом. Всё должно быть детерминированным.
- `autoAlpha` (не `visibility`) для показа/скрытия неанкерных сцен.
- Входной твин со смещением **0.1–0.3 с** от начала сцены (нулевая задержка = склейка встык).
- Кегль: заголовки ≥60 px, текст ≥20 px, лейблы ≥16 px (это для 1920×1080 — при переносе
  в React пересчитать в `rem`/Tailwind-классы).
- Длительность сцены 3–5 с, потолок 5 с. Shader-переход ≥0.3 с, оптимум 0.5 с;
  2–3 shader-момента на видео максимум (`window.HyperShader.init({...})`, 14 шейдеров).
- `npx hyperframes lint` должен проходить **с нулём ошибок** до `preview`/`render`.

Шрифт в композициях — **локальный** `Orbitron-Variable.woff2` из `public/fonts`
(в проекте запрет на внешние CDN шрифтов). Кириллицы в Orbitron нет — ФИО и русские
подписи рисовать system sans, латиницу/логотип — Orbitron.

Команды:

```bash
npx hyperframes lint
```

```bash
npx hyperframes preview
```

```bash
npx hyperframes render -o welcome-dossier.mp4
```

### 10.5 Мост «композиция → React»

Из готовой композиции выносим **таблицу таймингов** и переносим её в React как константу,
чтобы тайминг остался единым источником правды:

```ts
export const DOSSIER_TIMELINE = {
  sheetsFlyIn: { at: 0.2, duration: 1.2, stagger: 0.08 },
  stackSettle: { at: 1.6, duration: 0.7 },
  stampDrop:   { at: 2.5, duration: 0.5 },
  stampFlash:  { at: 3.0, duration: 0.3 },
  gridExplode: { at: 4.2, duration: 1.0 },
  brandReveal: { at: 5.0, duration: 0.8 },
} as const;
```

Соответствие GSAP → framer-motion: `ease: "power3.out"` ≈ `ease: [0.215, 0.61, 0.355, 1]`;
`tl.from({y:40, autoAlpha:0})` ≈ `initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}`;
позиция в таймлайне (третий аргумент `tl.from`) → `transition.delay`.

---

## 11. Критерии приёмки

- [ ] После «Продолжить» (и после MFA-кода) открывается `/auth/welcome`, играет выбранная
      анимация, затем `/profile` — **без спиннера `<Loader>`** между ними.
- [ ] F5 на `/auth/welcome`, прямой заход по URL и `Назад` из профиля → мгновенный редирект
      на `/profile`, анимация **не** повторяется.
- [ ] Нет токена → `/auth/login`.
- [ ] Все 5 анимаций переключаются в настройках профиля, выбор сохраняется после
      перезагрузки, «Посмотреть» проигрывает превью без разлогина.
- [ ] Режим «Выключить» → логин ведёт сразу в `/profile`, `/auth/welcome` не открывается.
- [ ] `prefers-reduced-motion: reduce` → 600 мс затемнение вместо анимации.
- [ ] «Пропустить» / `Esc` / `Enter` уводят в профиль немедленно.
- [ ] Зависший запрос `AUTH_ME` → через 9 с всё равно профиль.
- [ ] Плашка `TabNavigation` не видна на `/auth/welcome`.
- [ ] Анимация использует градиент активной темы и корректна в светлой и тёмной темах.
- [ ] Ни один файл не превышает 200 строк; нет `function`, нет `style={{}}`,
      нет `&&`-рендеринга, условия — через `<If is>`; `important` — постфиксом.
- [ ] После `navigate` в консоли нет предупреждений об обновлении размонтированного
      компонента (все таймеры очищены).
- [ ] `npx tsc -b` без ошибок — **запускать только если пользователь попросит**
      (по `GEMINI.md` сборку и проверку типов без просьбы не запускаем;
      визуальную проверку делает пользователь).

---

## 12. Порядок реализации (по шагам, каждый — самостоятельно проверяемый)

1. **Каркас маршрута.** `AppRoutes.AUTH_WELCOME`, `WelcomeRoute`, `AuthWelcomePage`,
   пустой `AuthWelcome` с текстом-заглушкой + правка `finishLogin`. Убедиться, что поток
   логин → welcome → профиль работает и гейт одноразовый.
2. **Прогрев и тайминги.** `useProfileWarmup`, `progress`, таймаут, «Пропустить»,
   reduced-motion, гашение `TabNavigation`. На этом шаге профиль уже открывается без спиннера.
3. **Реестр + одна анимация.** `model.ts` c `WELCOME_ANIMATIONS`, `WelcomeStage` с lazy,
   `parts/BrandReveal`, и **`aurora`** как самая простая — сквозная проверка контракта.
4. **HyperFrames-стенд.** `hyperframes/DESIGN.md` + композиция `welcome-dossier`,
   `lint` → `preview`, выставить тайминг, вынести `DOSSIER_TIMELINE`.
5. **Остальные четыре анимации** — по одной, каждая своим файлом, каждая через свою
   HyperFrames-композицию.
6. **Переключатель в настройках** + превью через портал + режим показа.
7. **Полировка**: адаптив 375 px, светлая/тёмная тема, чистка таймеров, размеры чанков.
