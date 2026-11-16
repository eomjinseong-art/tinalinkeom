import { TITLE, CHAPTERS } from "./_novel-b4-data.mjs";
import { createNovelHandler } from "./_novel-reader.mjs";

export default createNovelHandler({
  title: TITLE,
  chapters: CHAPTERS,
  titleSuffix: " · 등불 시리즈 2",
  coverSub: "등불 시리즈 2 · 주의 말씀은 내 발에 등이요 내 길에 빛이니이다 (시 119:105)",
  storageKey: "adem_reader_",
  abacusKey: "novel-b4",
});
