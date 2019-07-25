var express = require('express');
var app = express();
var hbs = require('hbs');
app.set('view engine', 'hbs');

app.set("port", process.env.PORT || 8080);
app.set('trust proxy', 1)

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

var listener = app.listen(app.get('port'), function() {
  console.log( 'Express server started on port: '+listener.address().port);
});
