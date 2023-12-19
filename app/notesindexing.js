import NotesIndexer from "./src/notesindexer.js";
import fs from 'fs';
import path from 'path';

let config = JSON.parse(fs.readFileSync(path.resolve("..", "notes.config.json"), 'utf-8'));

const indexer = new NotesIndexer(path.resolve("..", config.folders.notes));

indexer.setTagSynonymes(config.synonyms);
indexer.setNotesSeparator(config.notes.separator);

indexer.indexPages();




