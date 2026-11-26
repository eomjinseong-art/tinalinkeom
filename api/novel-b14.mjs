import { TITLE, CHAPTERS } from "./_novel-b14-data.mjs";
import { createNovelHandler } from "./_novel-reader.mjs";

export default createNovelHandler({
  title: TITLE,
  chapters: CHAPTERS,
  titleSuffix: " · 나두노벨 14권",
  coverSub: "나두노벨 14권 · 유발 하라리의 생각으로 AI 시대를 건너는 이야기 · 장편소설",
  storageKey: "novel_b14_reader_",
  abacusKey: "novel-b14",
});
