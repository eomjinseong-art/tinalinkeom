import { TITLE, CHAPTERS } from "./_novel-b8-data.mjs";
import { createNovelHandler } from "./_novel-reader.mjs";

export default createNovelHandler({
  title: TITLE,
  chapters: CHAPTERS,
  titleSuffix: " · 등불 시리즈 6",
  coverSub: "나두노벨 8권 · 등불 시리즈 6 · 독립 장편소설",
  storageKey: "novel_b8_reader_",
  abacusKey: "novel-b8",
});
