const PromiseFTP = require('promise-ftp');
const parseGlob = require('parse-glob');
const micromatch = require('micromatch');

const flattenArray = require('./flattenArray');

class FTP {
    constructor(config) {
        this.config = config;
        this.ftp = new PromiseFTP();
    }

    connect() {
        return this.ftp.connect(this.config);
    }

    disconnect() {
        return this.ftp.end();
    }

    backup(globs = []) {
        return this.listFilesToBackup(globs[0]);
    }

    async listFilesToBackup(glob) {
        const traversedFiles = await this.traverseGlob(glob);
        const flattenedTraversedFiles = flattenArray(traversedFiles);
        const filesMatching = micromatch(flattenedTraversedFiles, glob);
        console.log('Matching files::', filesMatching);
        return filesMatching;
    }

    async traverseGlob(glob) {
        const ftp = this.ftp;
        // Extract only the properties we need from glob parse
        const {
            base: baseDirectory,
            is: {
                globstar: hasGlobStar
            },
            path: {
                basename: globFilenameWithExtension
            }
        } = parseGlob(glob);

        const files = await ftp.list(baseDirectory);

        // Handle folders by traversing inside
        const folderPromises = files.reduce((prev, file) => {
            // If the file is a directory and globstar provided, traverse inside
            if(file.type === 'd' && hasGlobStar) {
                const nextFolderGlob = `${baseDirectory}/${file.name}/**/${globFilenameWithExtension}`;
                prev.push(this.traverseGlob(nextFolderGlob));
                return prev;
            }

            // If this is a file, skip
            return prev;
        }, []);

        // Handle files by returning an absolute path to the file
        const fileNames = files.reduce((prev, file) => {
            if(file.type !== 'd') {
                const fileAbsolutePath = `${baseDirectory}/${file.name}`;
                prev.push(fileAbsolutePath);
                return prev;
            }
            // If this is a folder, skip
            return prev;
        }, []);

        return Promise.all(fileNames.concat(folderPromises));
    }
}

module.exports = FTP;
