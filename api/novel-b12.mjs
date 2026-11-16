import { TITLE, CHAPTERS } from "./_novel-b12-data.mjs";
import { createNovelHandler } from "./_novel-reader.mjs";

export default createNovelHandler({
  title: TITLE,
  chapters: CHAPTERS,
  titleSuffix: " · 등불 시리즈 10",
  coverSub: "나두노벨 12권 · 등불 시리즈 10 · 독립 장편소설",
  storageKey: "novel_b12_reader_",
  abacusKey: "novel-b12",
});
