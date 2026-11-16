import { TITLE, CHAPTERS } from "./_novel-b6-data.mjs";
import { createNovelHandler } from "./_novel-reader.mjs";

export default createNovelHandler({
  title: TITLE,
  chapters: CHAPTERS,
  titleSuffix: " · 등불 시리즈 4",
  coverSub: "나두노벨 6권 · 등불 시리즈 4 · 독립 장편소설",
  storageKey: "novel_b6_reader_",
  abacusKey: "novel-b6",
});
