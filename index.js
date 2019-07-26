var express = require('express');
var app = express();
var hbs = require('hbs');
app.set('view engine', 'hbs');
var mysql = require('mysql');

app.set("port", process.env.PORT || 8080);
app.set('trust proxy', 1);
var path = require('path');

app.get("/", function(req, res){
    // res.sendFile(__dirname + '/index.html');
    res.render('home');
});

app.get("/request_pool", function(req, res){
    // res.sendFile(__dirname + '/index.html');
    res.render('request');
});

app.get("/host_pool", function(req, res){
    // res.sendFile(__dirname + '/index.html');
    res.render('home');
});

app.get("/view_pools", function(req, res){
    // res.sendFile(__dirname + '/index.html');
    res.render('home');
});

app.get("/write_sql", function(req, res){
    pool.query('insert into pools set ?', req.query, function(error, results, fields) {
       if (error) throw error; 
    });
});

app.get("/read_sql", function(req, res){
    pool.query('select * from pools', function(error, results, fields) {
       if (error) throw error; 
       res.send(results);
    });
});

app.get("/del_sql", function(req, res){
    pool.query('delete from pools where hash=?', req.query.hash
        ,function(error, results, fields) {
       if (error) throw error; 
       res.send(results);
    });
});

app.use('/js', express.static(path.join(__dirname, 'js')))
app.use('/css', express.static(path.join(__dirname, 'css')))
app.use('/img', express.static(path.join(__dirname, 'img')))


 

// create a connection pool
//  - this allows for multiple connections to occur without incurring 'startup costs' 
//    (these costs are time costs for setting up a db connection)
//    it allows a connection to your db to be reused among subsequent users.
sqlParams = {
  connectionLimit : 10,
  user            : 'site_carpool',
  password        : '83n5RzTBZ7n5nFfp42mysTps',
  host            : 'mysql1.csl.tjhsst.edu',
  port            : 3306,
  database        : 'site_carpool'
}
var pool  = mysql.createPool(sqlParams);



var listener = app.listen(app.get('port'), function() {
  console.log( 'Express server started on port: '+listener.address().port);
});
