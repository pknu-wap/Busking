var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require(`express-session`);
var FileStore = require('session-file-store')(session);

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false}));
app.use(session({
    secret: `afwe1f67u7lknvkrf2R!2r12@@R12r`,
    resave: false,
    saveUninitialized: true,
    store: new FileStore()
}));

var indexRouter = require('./routes/index'); //index를 부르고
var myPageRouter = require('./routes/my_page'); //mypage 부른다.
app.use('/', indexRouter); //경로가 /일 때의 미들웨어 설정
app.use('/MyPage',myPageRouter); // 경로가 /mypage일 때의 미들웨어 설정

// app.use(function(request, response, next){
//     response.status(404).send('Sorry cant find that');
// });

// app.use(function(err, request, response, next){
//     response.status(500).send('Something broke');
// });

app.listen(3000);
