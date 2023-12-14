import NotesIndexer from "./src/notesindexer.js";
import fs from 'fs';

let config = JSON.parse(fs.readFileSync("./notes.config.json", 'utf-8'))

const indexer = new NotesIndexer('../notes')

indexer.setTagSynonymes(config)

indexer.indexPages()




