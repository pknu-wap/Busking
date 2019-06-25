var mysql = require('mysql');
var db = mysql.createConnection({
    host : 'localhost',
    user: 'root',
    password: '1234',
    database: 'busking'
})
db.query('show databases;', (err, rows, fields)=>{
  console.log("db 연결, 성공적");
});
module.exports = db;
