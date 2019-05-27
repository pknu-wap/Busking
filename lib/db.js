var mysql = require('mysql');
var db = mysql.createConnection({
    host : 'localhost',
    user: 'root',
    password: '1234',
    database: 'busking',
    port : 3305
})
db.connection();
module.exports = db;
