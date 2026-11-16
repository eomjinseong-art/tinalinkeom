import { TITLE, CHAPTERS } from "./_novel-b13-data.mjs";
import { createNovelHandler } from "./_novel-reader.mjs";

export default createNovelHandler({
  title: TITLE,
  chapters: CHAPTERS,
  titleSuffix: " · 나두노벨 13권",
  coverSub: "나두노벨 13권 · 《스크루테이프의 편지》에 바치는 독립된 응답 · 서간소설",
  storageKey: "novel_b13_reader_",
  abacusKey: "novel-b13",
});
