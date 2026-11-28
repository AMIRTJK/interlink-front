// Пагинация реестра задач. Сервер может отдать список целиком, без метаданных
// пагинации: тогда это одна страница. Раньше per_page по умолчанию (7) делил уже
// полученные 18 задач на три «страницы», и переход на 2-ю показывал те же записи.
import test from "node:test";
import assert from "node:assert/strict";

const { extractPagination } = await import("../src/widgets/TaskRegistry/model/pagination.ts");

const DEFAULT_PER_PAGE = 7;

test("список без метаданных — одна страница со всеми записями", () => {
  const res = { success: true, data: Array.from({ length: 18 }, (_, i) => ({ id: i })) };
  assert.deepEqual(extractPagination(res, 18, DEFAULT_PER_PAGE), {
    total: 18,
    lastPage: 1,
    currentPage: 1,
    perPage: 18,
  });
});

test("пустой ответ без метаданных не даёт нулевого размера страницы", () => {
  assert.equal(extractPagination({ data: [] }, 0, DEFAULT_PER_PAGE).perPage, 1);
});

test("пагинатор Laravel в data читается как раньше", () => {
  const res = { data: { data: [], current_page: 2, last_page: 3, per_page: 7, total: 18 } };
  assert.deepEqual(extractPagination(res, 7, DEFAULT_PER_PAGE), {
    total: 18,
    lastPage: 3,
    currentPage: 2,
    perPage: 7,
  });
});

test("метаданные в meta читаются как раньше", () => {
  const res = { data: [], meta: { current_page: 1, last_page: 2, per_page: 10, total: 15 } };
  assert.deepEqual(extractPagination(res, 10, DEFAULT_PER_PAGE), {
    total: 15,
    lastPage: 2,
    currentPage: 1,
    perPage: 10,
  });
});

test("без last_page число страниц считается по total и per_page", () => {
  const res = { meta: { total: 18, per_page: 7 } };
  assert.equal(extractPagination(res, 7, DEFAULT_PER_PAGE).lastPage, 3);
});
