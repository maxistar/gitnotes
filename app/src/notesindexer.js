import fs from 'fs';

const MAX_LINKS_NUMBER = 10

class NotesIndexer {
    notesFolder = '';
    tags = {};
    fileTags = {};
    fileTitles = {};
    tagsSynonymes = {};
    

    constructor(notesFolder) {
        this.notesFolder = notesFolder;
    }
    
    setNotesSeparator(separator) {
        this.separator = separator;
    }
    
    setTagSynonymes(tagsSynonymes) {
        const result = {};

        for (const key of Object.keys(tagsSynonymes)) {
            for (let value of tagsSynonymes[key]) {
                result['#' + value] = '#' + key;
            }    
        }
        this.tagsSynonymes = result;
    }
    
    /**
     * Format tags
     *
     * @param tags
     * @return {string}
     */
    formatTags(tags) {
        let s = '# Index\n\n'
        s += '| tag | files |\n';
        s += '| --- | ----- |\n';
        for (const tag of Object.keys(tags).sort()) {
            const pages = tags[tag];
            const fileTag = tag.substring(1);
            const txtPages = [];
            for (const page of pages) {
                txtPages.push('[' + this.getPageTitle(page) + '](' + page.substring(1) + ')');
            }
            s += '|[' + tag + '](tags/' + fileTag + '.md)|' + txtPages.join(', ') + '|\n';
        }
        return s;
    }

    readFileContent(filename) {
        return fs.readFileSync(filename, 'utf8');
    }

    /**
     * 
     * @param folderName folder, should end without slash e.g.: '', '/2023', etc.
     * @returns {string[]}
     */
    listFolderFiles(folderName = '') {
        return fs.readdirSync(this.notesFolder + folderName); 
    }
    
    isFolder(filename) {
        return fs.statSync(filename).isDirectory()
    }

    normalizeTag(tag) {
        if (this.tagsSynonymes.hasOwnProperty(tag)) {
            return this.tagsSynonymes[tag]; 
        }
        return tag;
    }

    /**
     * 
     * @param filename Starts from slash
     */
    processFile(filename) {
        try {
            const data = this.readFileContent(this.notesFolder + filename);
            const lines = data.split('\n');
            let found = false;
            let titleFound = false;
            let tagNormalized;
            // get the line with tags:
            for (const line of lines) {
                if (line.indexOf('tags:') === 0) {
                    found = true;
                    // console.log(line);
                    const t = /#[a-zа-я0-9_\-]+/ugi
                    const result = line.match(t);

                    if (result !== null) {
                        for (let tag of result) {
                            tagNormalized = this.normalizeTag(tag);
                            
                            if (!this.tags.hasOwnProperty(tagNormalized)) {
                                this.tags[tagNormalized] = [];
                            }
                            if (this.tags[tagNormalized].indexOf(filename) === -1) {
                                this.tags[tagNormalized].push(filename);
                            }


                            if (!this.fileTags.hasOwnProperty(filename)) {
                                this.fileTags[filename] = [];
                            }
                            if (this.fileTags[filename].indexOf(tagNormalized) === -1) {
                                this.fileTags[filename].push(tagNormalized);
                            }
                        }
                    }
                }

                if (line.indexOf('# ') === 0) {
                    if (!titleFound) {
                        this.fileTitles[filename] = line.substring(2);
                        titleFound = true;
                    }
                }
            }
            if (!found) {
                console.log(`Warning: no tags found in ${filename}`);
            }
        } catch (err) {
            console.error(err)
        }
    }
    
    /**
     * Read Notes
     * 
     * folder, should end without slash e.g.: '', '/2023', etc.
     */
    readNotes(folder = '') {
        this.listFolderFiles(folder).forEach(file => {
            if (file === 'index.md') return;
            if (file === 'tags') return;
            if (this.isFolder(this.notesFolder + '/' + folder + '/' + file)) {
                // do something with folder
                this.readNotes(folder + '/' + file)
                return;
            }

            this.processFile(folder + '/' + file)
        });
    }

    /**
     * Write Index File
     */
    writeIndex() {
        fs.writeFile(this.notesFolder + '/index.md', this.formatTags(this.tags), () => {});
    }

    /**
     * returns number of '../' depending of number of 'in file'
     * @param fileUrl
     */
    getTagsPrefix(fileUrl) {
        const parts = fileUrl.split('/');
        let result = "";
        for (let i = 2; i < parts.length; i++) {
            result = result + "../"
        }
        return result;
    }

    /**
     * Update File with links
     *
     * @param file
     */
    linkFile(file) {
        try {
            const data = this.readFileContent(this.notesFolder + '/' + file , 'utf8');
            const separator = '\n' + this.separator + '\n';
            const lines = data.split(separator);
            const tagsPrefix = this.getTagsPrefix(file);
            if (this.fileTags.hasOwnProperty(file)) {
                // prepare list of relevant pages
                const tagLinks = [];
                const fileLinks = [];
                const theFileTags = [...this.fileTags[file]].sort();
                for (const tag of theFileTags) {
                    tagLinks.push('- [' + tag + ']('+ tagsPrefix + 'tags/' + tag.substring(1) + '.md)');
                    const otherFiles = [...this.tags[tag]].sort();
                    for (const otherFile of otherFiles) {
                        if (fileLinks.indexOf(otherFile) === -1) {
                            fileLinks.push(otherFile);
                        }
                    }
                }

                // format an updated list of the links
                const fileLinksSorted = [...fileLinks].sort();

                const tagFileLinks = this.limitExternalLinks(fileLinksSorted, file, tagsPrefix);

                // build a new text
                const content = lines[0];

                const newContent = content + separator
                    + tagLinks.join('\n') + '\n'
                    + (tagFileLinks.length > 0 ? tagFileLinks.join('\n') + '\n' : '');

                fs.writeFile(this.notesFolder + '/' + file, newContent, () => {});
            }
        } catch (err) {
            console.error(err)
        }
    }

    limitExternalLinks(fileLinksSorted, currentFileName, tagsPrefix) {
        const tagFileLinks = [];

        const currentFileIndex = fileLinksSorted.indexOf(currentFileName);

        let startIndex = Math.max(0, currentFileIndex - Math.floor(MAX_LINKS_NUMBER / 2));
        let stopIndex = Math.min(currentFileIndex + Math.ceil(MAX_LINKS_NUMBER / 2), fileLinksSorted.length - 1);

        const leftElements = fileLinksSorted.length - currentFileIndex - 1

        if (leftElements < MAX_LINKS_NUMBER / 2) {
            startIndex = Math.max(0, fileLinksSorted.length - 1 - MAX_LINKS_NUMBER)
            stopIndex = fileLinksSorted.length - 1;
        } else if (currentFileIndex < MAX_LINKS_NUMBER / 2) {
            startIndex = 0
            stopIndex = Math.min(fileLinksSorted.length - 1, MAX_LINKS_NUMBER)
        }


        let index = 0;
        for (const fileLink of fileLinksSorted) {
            if (index < startIndex || index > stopIndex) {
                index++;
                continue
            }
            index++;
            if (fileLink === currentFileName) { // skip current file from the list
                continue
            }
            tagFileLinks.push('- [' + this.getPageTitle(fileLink) + '](' + tagsPrefix + fileLink.substring(1) + ')');
        }
        return tagFileLinks;
    }

    /**
     * Link Notes 
     * 
     * @folder String '', '/folder'
     */
    linkNotes(folder = '') {
        //read files
        this.listFolderFiles(folder).forEach(file => {
            if (file === 'index.md') return;
            if (file === 'tags') return;

            if (this.isFolder(this.notesFolder + folder + '/' + file)) {
                // do something with folder
                this.linkNotes(folder + '/' + file)
                return;
            }
            
            this.linkFile(folder + '/' + file);
        });
    }

    /**
     * Write Tag Index files to
     * @param tag
     * @param pages
     */
    writeTagIndex(tag, pages) {
        const fileName = tag.substring(1);
        const content = [];
        const sortedPages = [...pages].sort();
        content.push('# ' + fileName + '\n');

        for(const page of sortedPages) {
            content.push('- [' + this.getPageTitle(page) + '](../' + page.substring(1) + ')');
        }

        content.push('\n');
        content.push('[index](../index.md)');

        fs.writeFile(this.notesFolder + '/tags/' + fileName + '.md', content.join('\n'), () => {});
    }

    writeTags() {
        for(const tag of Object.keys(this.tags).sort()) {
            const pages = this.tags[tag];
            this.writeTagIndex(tag, pages);
        }
    }

    indexPages() {
        this.readNotes();
        this.writeIndex();
        this.writeTags();
        this.linkNotes();
    }

    getPageTitle(fileLink) {
        if (this.fileTitles.hasOwnProperty(fileLink)) {
            return this.fileTitles[fileLink];
        }
        return fileLink.substring(1);
    }
}

export default NotesIndexer


