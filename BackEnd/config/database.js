
const mysql = require('mysql2');

const dbConnection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '23112003',
    database: 'data_sensor'
});

dbConnection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

module.exports = dbConnection;
