# Дизайн-документ: Добавление приоритета во внутреннюю входящую корреспонденцию

## Описание
В рамках данной задачи добавляется отображение поля "Приоритет" в детали входящего внутреннего письма по пути `/modules/correspondence/internal/incoming/:id`. Приоритет отображается в виде цветного тега (badge) в зависимости от степени важности (low, middle/medium/normal, high).

## Изменения

### 1. Виджет `InternalCorrespondenceIncomingView`
* Файл: `src/widgets/InternalCorrespondenceIncomingView/ui.tsx`
* Добавление поля `priority?: string;` в интерфейс `RegistryItem`.
* Объявление конфигурации приоритетов `priorityConfig` с поддержкой ключей `low`, `middle`, `medium`, `normal`, `high` и соответствующих переводов и Tailwind-классов.
* Добавление элемента `<DetailField label="Приоритет">` в сетку деталей письма.

### 2. Типы внутренней корреспонденции
* Файл: `src/widgets/CreateInternalCorrespondence/types/index.ts`
* Добавление опционального поля `priority?: string;` в интерфейс `RegistryItem` для синхронизации типов.

## Тестирование
* Визуальная проверка отображения поля "Приоритет" при просмотре внутренней входящей корреспонденции.
