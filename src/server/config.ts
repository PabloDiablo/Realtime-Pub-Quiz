const USERNAME = 'username';
const PASSWORD = 'password';
const HOST = 'localhost';
const PORT = '6666';
const DB = process.env.DATABASE || 'quizzer-local';
const QM_PASS = process.env.QM_PASS || '';

export default { USERNAME, PASSWORD, HOST, PORT, DB, QM_PASS };
