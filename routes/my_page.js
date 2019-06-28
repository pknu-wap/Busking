var express = require('express');
var router = express.Router();
var fs = require('fs');
var template = require('../lib/template'),static = require('serve-static');
var db = require('../lib/db'), path = require('path');
var app = express() , bodyParser =require('body-parser');


router.get('/view', function (request, response){
    var login_form = ``;
    login_form = template.loginForm(request.session.is_logined, request.session.name); //모듈화한 loginform을 줍니다.
    db.query(`SELECT youtube_link FROM busking_info ORDER BY click_count DESC limit 0, 5`, function (error, youtube_popularity) {
        db.query(`SELECT youtube_link FROM busking_info ORDER BY click_count DESC limit 0, 5`, function (error1, live_video) {
            db.query('SELECT * FROM MyPageInfo WHERE user_name=?', [request.session.name], function (error2, my_page_info) {
                db.query('SELECT * FROM Youtube_List WHERE user_name=?', [request.session.name], function (error3, youtube_list) {
                  db.query('SELECT * FROM comment_info', (error4, comment)=>{
                    response.render('my_page', {
                        login_form: login_form,
                        live_video: live_video,
                        my_page_info: my_page_info ? my_page_info : {},
                        youtube_list: youtube_list ? youtube_list : {},
                        youtube_popularity : youtube_popularity,
                        comment : comment ? comment : {}
                    })
                })
              })
          })
      })
  })
})

router.get('/create', function (request, response) {
    response.render('my_page_create', {
        user_name: request.session.name
    })
})

router.post('/create_process', function (request, response) {
    var post = request.body;
    db.query('INSERT INTO MyPageInfo VALUES(?, ?, ?, ?, ?)', [post.user_name, post.singer, post.genre, post.introduce, post.location], function (error, my_page_info) {
        if (error) {
            throw (error);
        }
        response.redirect('/MyPage/view');
    })
})

router.get('/update', function (request, response) {
    db.query('SELECT * FROM MyPageInfo WHERE user_name=?', [request.session.name], function (error, my_page_info) {
        response.render('my_page_update', {
            user_name: request.session.name,
            my_page_info: my_page_info ? my_page_info : {}
        })
    })
})

router.post('/update_process', function (request, response) {
    var post = request.body;
    db.query('UPDATE MyPageInfo SET singer=?, genre=?, introduce=?, location=? WHERE user_name=?',
        [post.singer, post.genre, post.introduce, post.location, post.user_name], function (error, result) {
            response.redirect('/MyPage/view');
        })
})

router.get('/delete_process', function (request, response) {
    db.query('DELETE FROM MyPageInfo WHERE user_name=?', [request.session.name], function (error, result) {
        response.redirect('/MyPage/view');
    })
})

router.post('/youtube_add_process', function (request, response) {
    var post = request.body;
    var video_num = 1;
    db.query('SELECT * FROM Youtube_List ORDER BY video_num DESC', function (error, youtube_info) {
        if (youtube_info[0] !== undefined) {
            video_num = youtube_info[0].video_num + 1;
        }
        console.log(request.session.name);
        db.query('INSERT INTO Youtube_List VALUES(?, ?, ?, 0)', [video_num, request.session.name, post.youtube_link], function (error, result) {
            if (error) {
                throw (error);
            }
            response.redirect('/MyPage/view');
        })
    })
})

router.get('/youtube_delete_process/:video_num', function (request, response) {
    db.query('DELETE FROM Youtube_List WHERE video_num=?', [request.params.video_num], function (error, result) {
        response.redirect('/MyPage/view')
    })
})

router.get('/youtube_like_process/:video_num', function (request, response) {
    db.query('SELECT * FROM Youtube_list WHERE video_num=?', [request.params.video_num], function (error, youtube_list) {
        var like = youtube_list[0].click_count + 1;
        console.log(like);
        console.log(youtube_list[0].click_count);
        db.query('UPDATE Youtube_list SET click_count=? WHERE video_num=?', [like, request.params.video_num], function (error, result) {
            response.redirect('/MyPage/view');
        })
    })
})

router.post('/written', function(request, response){ // 경로 자체를 MyPage/written으로 하니까 안 들어감. 경로 공부하자.
  db.query('SELECT * FROM signUp WHERE name=?', [request.session.name], (err,data)=>{
      var id = data[0].id;
    db.query('INSERT INTO comment_info VALUES(?,?)', [id, request.body.comment], (err,rows)=>{ //왜 ??하니까 되지?
      if(err) throw(err);
      response.redirect('/MyPage/view');
      })
    })
});
router.post('/del_cmt', function(request, response){
  db.query('SELECT * FROM signUp WHERE name=?', [request.session.name], (err,data)=>{
      var id = data[0].id;
      db.query('DELETE FROM comment_info WHERE id_cmt=?',[id],(err,del)=>{
        response.redirect('/MyPage/view');
      })
  })
})
router.post('/mod_cmt', function(request, response){
    db.query('SELECT * FROM signUp WHERE name=?', [request.session.name], (err,data)=>{
      var id = data[0].id //query 문을 쓰지 않고 현재의 id를 불러오는 방법은 없는 걸까?
        db.query('UPDATE comment_info SET cmt=? WHERE id_cmt=?', [request.body._mod, id], (err,data)=>{
          response.redirect('/MyPage/view')
        })
      })
  });

module.exports = router;
