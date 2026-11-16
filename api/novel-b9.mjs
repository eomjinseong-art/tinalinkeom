import { TITLE, CHAPTERS } from "./_novel-b9-data.mjs";
import { createNovelHandler } from "./_novel-reader.mjs";

export default createNovelHandler({
  title: TITLE,
  chapters: CHAPTERS,
  titleSuffix: " · 등불 시리즈 7",
  coverSub: "나두노벨 9권 · 등불 시리즈 7 · 독립 장편소설",
  storageKey: "novel_b9_reader_",
  abacusKey: "novel-b9",
});
