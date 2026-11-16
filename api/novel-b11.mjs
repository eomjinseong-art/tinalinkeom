import { TITLE, CHAPTERS } from "./_novel-b11-data.mjs";
import { createNovelHandler } from "./_novel-reader.mjs";

export default createNovelHandler({
  title: TITLE,
  chapters: CHAPTERS,
  titleSuffix: " · 등불 시리즈 9",
  coverSub: "나두노벨 11권 · 등불 시리즈 9 · 독립 장편소설",
  storageKey: "novel_b11_reader_",
  abacusKey: "novel-b11",
});
