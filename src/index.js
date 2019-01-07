// 3rd party libraries
const fs = require('fs');
const path = require('path');
const fsp = require('fs-extra');
const formatDate = require('date-fns/format');

// Project code
const config = require('./config');
const backupConfig = require('../backupConfig.json');
const FTP = require('./util/ftp');

function createFolder({ fsp }, dir) {
    return fsp.mkdirs(dir);
}

function createBackupFolderPath({path, formatDate}, date) {
    const backupName = formatDate(date, 'YYYYMMDD_HHmm');
    return path.resolve(__dirname, '..', 'backups', backupName);
}

// function createFtpBackup({fs, ftp}, remoteBackupPaths, localBackupFolderPath) {
//     const backupPromises = remoteBackupPaths.map(remoteBackupPath => {
//         return ftp.get(remoteBackupPath)
//             .then(function(stream) {
//                 const remotePath = localBackupFolderPath + 'lala.png';
//                 stream.pipe(fs.createWriteStream(remotePath));
//             });
//     });
//
//     return Promise.all(backupPromises);
// }


async function run() {
    const ftp = new FTP(config.ftp);

    // Create backup folder
    const localBackupFolderPath = createBackupFolderPath({path, formatDate}, new Date());
    await createFolder({fsp}, localBackupFolderPath);

    // Connect and backup files
    await ftp.connect();
    await ftp.backup(backupConfig.paths);

    // Disconnect when done
    await ftp.disconnect();
}

module.exports = run;
