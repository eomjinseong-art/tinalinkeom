import { TITLE, CHAPTERS } from "./_novel-b7-data.mjs";
import { createNovelHandler } from "./_novel-reader.mjs";

export default createNovelHandler({
  title: TITLE,
  chapters: CHAPTERS,
  titleSuffix: " · 등불 시리즈 5",
  coverSub: "나두노벨 7권 · 등불 시리즈 5 · 독립 장편소설",
  storageKey: "novel_b7_reader_",
  abacusKey: "novel-b7",
});
