import { TITLE, CHAPTERS } from "./_novel-b2-data.mjs";
import { createNovelHandler } from "./_novel-reader.mjs";

export default createNovelHandler({
  title: TITLE,
  chapters: CHAPTERS,
  storageKey: "adem_reader_",
  abacusKey: "novel-b2",
});
