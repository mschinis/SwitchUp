module.exports = {
    ftp: {
        host: process.env.FTP_HOST,
        port: process.env.FTP_PORT || 5000,
        user: process.env.FTP_USER,
        password: process.env.FTP_PASSWORD
    }
};
