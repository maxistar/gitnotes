import NotesIndexer from "./src/notesindexer.js";

const indexer = new NotesIndexer('../notes')

indexer.setTagSynonymes({
    programming: ["программирование"],
    "продуктивность": ["productivity"],
    checklist: ["checklist", "чеклисты", "checklists", "чеклист"],
    lists: ["список", "list", "lists", "списки"],
    books: ["books", "книги"],
    projects: ["projects", "проекты"],
    japanese: ["японский"],
    persons: ["personen", "люди", "персоны"],
    languages: ["languages", "languages", "языки", "язык", "language", "sprache", "sprachen"]
})

indexer.indexPages()


