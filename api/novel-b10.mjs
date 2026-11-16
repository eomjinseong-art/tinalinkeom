import { TITLE, CHAPTERS } from "./_novel-b10-data.mjs";
import { createNovelHandler } from "./_novel-reader.mjs";

export default createNovelHandler({
  title: TITLE,
  chapters: CHAPTERS,
  titleSuffix: " · 등불 시리즈 8",
  coverSub: "나두노벨 10권 · 등불 시리즈 8 · 독립 장편소설",
  storageKey: "novel_b10_reader_",
  abacusKey: "novel-b10",
});
