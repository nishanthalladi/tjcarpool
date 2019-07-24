var express = require('express');
var app = express();
var hbs = require('hbs');
app.set('view engine', 'hbs');

app.set("port", process.env.PORT || 8080);
app.set('view engine', 'hbs');
app.set('trust proxy', 1)

app.get("/", function(req, res){
    res.send("carpool time");
});

var listener = app.listen(app.get('port'), function() {
  console.log( 'Express server started on port: '+listener.address().port );
});
