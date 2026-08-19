// Разметка списков при вставке: чистая логика без DOM.
import test from "node:test";
import assert from "node:assert/strict";

const {
  isKeptAttribute,
  listStyleTypeFromAttr,
} = await import(
  "../src/widgets/CreateInternalCorrespondence/lib/listMarkup.ts"
);

test("нумерация вставленного списка не сбрасывается на «1»", () => {
  assert.equal(isKeptAttribute("OL", "start"), true);
  assert.equal(isKeptAttribute("OL", "reversed"), true);
  assert.equal(isKeptAttribute("LI", "value"), true);
});

test("атрибуты списков разрешены только на своих тегах", () => {
  assert.equal(isKeptAttribute("P", "start"), false);
  assert.equal(isKeptAttribute("DIV", "value"), false);
  assert.equal(isKeptAttribute("UL", "start"), false);
});

test("служебный мусор Word по-прежнему срезается", () => {
  ["class", "id", "lang", "onclick", "data-mso"].forEach((attr) => {
    assert.equal(isKeptAttribute("OL", attr), false, attr);
    assert.equal(isKeptAttribute("P", attr), false, attr);
  });
});

test("атрибуты вёрстки таблиц и ссылок не задеты", () => {
  assert.equal(isKeptAttribute("A", "href"), true);
  assert.equal(isKeptAttribute("IMG", "src"), true);
  assert.equal(isKeptAttribute("TD", "colspan"), true);
  assert.equal(isKeptAttribute("TD", "rowspan"), true);
});

test("вид маркера из type=... переезжает в list-style-type", () => {
  assert.equal(listStyleTypeFromAttr("OL", "1"), "decimal");
  assert.equal(listStyleTypeFromAttr("OL", "a"), "lower-alpha");
  assert.equal(listStyleTypeFromAttr("OL", "A"), "upper-alpha");
  assert.equal(listStyleTypeFromAttr("OL", "i"), "lower-roman");
  assert.equal(listStyleTypeFromAttr("OL", "I"), "upper-roman");
  assert.equal(listStyleTypeFromAttr("UL", "square"), "square");
  assert.equal(listStyleTypeFromAttr("LI", "circle"), "circle");
});

test("нераспознанный или чужой type ничего не меняет", () => {
  assert.equal(listStyleTypeFromAttr("OL", "неведомый"), null);
  assert.equal(listStyleTypeFromAttr("OL", null), null);
  assert.equal(listStyleTypeFromAttr("INPUT", "checkbox"), null);
  assert.equal(listStyleTypeFromAttr("P", "a"), null);
});
