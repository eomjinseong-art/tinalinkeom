import { TITLE, CHAPTERS } from "./_novel2-data.mjs";
import { createNovelHandler } from "./_novel-reader.mjs";

export default createNovelHandler({
  title: TITLE,
  chapters: CHAPTERS,
  storageKey: "scacco_reader_v2_",
  abacusKey: "novel2",
});
