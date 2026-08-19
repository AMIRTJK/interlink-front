// Разбиение таймлайна структуры по карточкам компактного режима: чистая логика без DOM.
import test from "node:test";
import assert from "node:assert/strict";

const { splitEventsIntoCards, balanceCardsByHeight } = await import(
  "../src/widgets/NewRegistry/lib/structure/compact.ts"
);

const makeEvents = (count) => Array.from({ length: count }, (_, i) => ({ id: i + 1 }));
const flat = (page) => page.cards.flatMap((card) => card.items.map((event) => event.id));

test("этапы раскладываются по карточкам последовательно", () => {
  const events = makeEvents(14);
  const page = splitEventsIntoCards(events, 3, 5, 0);

  assert.equal(page.totalPages, 1);
  assert.deepEqual(flat(page), events.map((event) => event.id));
  assert.deepEqual(page.cards.map((card) => card.items.length), [5, 5, 4]);
  assert.deepEqual(page.cards.map((card) => card.startIndex), [1, 6, 11]);
});

test("страницы вместе дают исходный таймлайн без потерь и дублей", () => {
  const events = makeEvents(23);
  const first = splitEventsIntoCards(events, 2, 4, 0);
  assert.equal(first.totalPages, 3);

  const collected = [];
  for (let page = 0; page < first.totalPages; page += 1) {
    collected.push(...flat(splitEventsIntoCards(events, 2, 4, page)));
  }
  assert.deepEqual(collected, events.map((event) => event.id));
});

test("остаток последней страницы распределяется равномерно", () => {
  const page = splitEventsIntoCards(makeEvents(20), 3, 5, 1);

  assert.deepEqual(page.cards.map((card) => card.items.length), [2, 2, 1]);
  assert.equal(page.from, 16);
  assert.equal(page.to, 20);
});

test("номер страницы за пределами диапазона прижимается к существующему", () => {
  assert.equal(splitEventsIntoCards(makeEvents(6), 2, 3, 99).pageIndex, 0);
});

test("пустой таймлайн не даёт пустых карточек", () => {
  const page = splitEventsIntoCards([], 2, 5, 0);

  assert.deepEqual(page.cards, []);
  assert.equal(page.totalPages, 1);
  assert.equal(page.from, 0);
});

test("карточки выравниваются по высоте, а не по количеству этапов", () => {
  // Пятый этап высокий (длинный комментарий): поровну по три строки дало бы
  // карточки 120 и 280 — раскладка по высоте выравнивает их до 160 и 240.
  const heights = [40, 40, 40, 40, 200, 40];
  const groups = balanceCardsByHeight(heights, 2);
  const cardHeights = groups.map((group) =>
    group.reduce((sum, index) => sum + heights[index], 0),
  );

  assert.deepEqual(groups.map((group) => group.length), [4, 2]);
  assert.deepEqual(cardHeights, [160, 240]);
  assert.ok(Math.max(...cardHeights) < 280);
});

test("раскладка по высоте не меняет порядок этапов", () => {
  const events = makeEvents(9);
  const heights = { 0: 200, 1: 40, 2: 40, 3: 40, 4: 40, 5: 200, 6: 40, 7: 40, 8: 40 };
  const page = splitEventsIntoCards(events, 3, 5, 0, heights);

  assert.deepEqual(flat(page), events.map((event) => event.id));
  assert.equal(page.cards.length, 3);
  assert.deepEqual(
    page.cards.map((card) => card.startIndex),
    page.cards.map((card) => card.items[0].id),
  );
});

test("этапы разбиваются на выбранное число карточек", () => {
  const page = splitEventsIntoCards(makeEvents(9), 3, 5, 0);
  assert.equal(page.cards.length, 3);

  const twoCards = splitEventsIntoCards(makeEvents(9), 2, 5, 0);
  assert.equal(twoCards.cards.length, 2);
});
