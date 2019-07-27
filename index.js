var express = require('express');
var app = express();
var hbs = require('hbs');
app.set('view engine', 'hbs');
var mysql = require('mysql');
var request = require('request');
// -------------- load packages -------------- //
var cookieSession = require('cookie-session')
var simpleoauth2 = require("simple-oauth2");


// These are keys that we'll use to encrypt our cookie session.
// If you open the developer tools, you'll find taht we only have 
// one cookie (named session). All of the subparameters that we add
// within the cookie (like the OAUTH token, and the javascript variable 
// name we give the token) will be embedded thrsough double encryption 
// usiung these keys
app.use(cookieSession({
  name: 'naruto<3hinata',
  keys: ['spikespiegel', 'lightyagami']
}))


app.set("port", process.env.PORT || 8080);
app.set('trust proxy', 1);
var path = require('path');


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

// app.get("/", function(req, res){
//     // res.sendFile(__dirname + '/index.html');
//     res.render('home');
// });

// app.get("/request_pool", function(req, res){
//     // res.sendFile(__dirname + '/index.html');
//     res.render('request');
// });

// app.get("/host_pool", function(req, res){
//     // res.sendFile(__dirname + '/index.html');
//     res.render('home');
// });

// app.get("/view_pools", function(req, res){
//     // res.sendFile(__dirname + '/index.html');
//     res.render('home');
// });

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


// -------------- variable initialization -------------- //

// These are parameters provided by the authenticating server when
// we register our OAUTH client. 
//
//  YOU DON'T JUST MAKE THESE UP, THEY WERE PROVIDED AS PART OF CONFIGURATION AT:
//     https://ion.tjhsst.edu/oauth/applications/
//
//  n.b.
// -- The client ID is going to be public
// -- The client secret is super top secret. KEEP IT SECRET
// -- The redirect uri should be some intermediary 'get' request that 
//     you write in which you assign the token to the session. 

var ion_client_id = 'Bnkg2kM0iuYXhAYDunCCjseQIF02nxNXviQQv87t';
var ion_client_secret = 'l2HOM9K3MrlbgdnhzAm8AWrjYkWOf77tt6aXBBY9bh5kvTk8ot2y8RuOn4RzaAtES4PKAAXGlhu20hMxEls10Jb1qhFaDqpfYBfu5hYuXMgunEyMCMAPSOGlnXErUdfu';
var ion_redirect_uri = 'https://carpool.sites.tjhsst.edu/login_worker';    //    <<== you choose this one


// Here we create an oauth2 variable that we will use to manage out OAUTH operations
// DO NOT MODIFY THIS OBJECT. IT IS CONFIGURED FOR TJ

var oauth2 = simpleoauth2.create({
  client: {
    id: ion_client_id,
    secret: ion_client_secret,
  },
  auth: {
    tokenHost: 'https://ion.tjhsst.edu/oauth/',
    authorizePath: 'https://ion.tjhsst.edu/oauth/authorize',
    tokenPath: 'https://ion.tjhsst.edu/oauth/token/'
  }
});


// [WHITESPACE FOR PRINTING]


// This is the link that will be used later on for logging in. This URL takes
// you to the ION server and asks if you are willing to give read permission to ION.

var authorizationUri = oauth2.authorizationCode.authorizeURL({
    scope: "read",
    redirect_uri: ion_redirect_uri
});


// -------------- express 'get' handlers -------------- //

app.get('/logout', function(req, res) {
    req.session.token = undefined;
    res.redirect('https://carpool.sites.tjhsst.edu/');
})

app.get('/login', function(req, res) {
    res.redirect(authorizationUri)
})

app.get('/', function (req, res) {
    

    // Here we ask if the token key has been attached to the session...
    if (req.session.token == null || typeof(req.session.token) == undefined) {
        // ...if the token does not exist, this means that the user has not logged in
    
        // THIS GENERATES AN HTML PAGE BY COMBINING STRINGS.
        //   IF YOU DO THIS IN YOUR ACTUAL PAGE, I WILL BE SAD.
        // -----------REPLACE WITH HANDLEBARS-----------
        // var output_string = "";
        // output_string += "<!doctype html>\n";
        // output_string += "<html><head></head><body>\n";
        // output_string += "<a href="+authorizationUri+">"+authorizationUri+"</a>"
        // output_string += "</body></html>";
        // // send away the output
        // res.send(output_string);
        dict = {logged: false}
        res.render('home', dict);
    } else {
        // ... if the user HAS logged in, we'll send them to a creepy page that knows their name

        // Now, we create a personalized greeting page. Step 1 is to 
        // ask ION for your name, which means conducting a request in the
        // background before the user's page is even rendered.

        // To start the process of creating an authenticated request, 
        // I take out the string 'permission slip' from 
        // the token. This will be used to make an ION request with your
        // credentials
        var access_token = req.session.token.token.access_token;
        
        // Next, construct an ION api request that queries the profile using the 
        // individual who has logged in's credentials (it will return) their
        // profile
        var my_ion_request = 'https://ion.tjhsst.edu/api/profile?format=json&access_token='+access_token;

        // Perform the asyncrounous request ...
        // [seems like a PERFECT place for middleware!!!]
        request.get( {url:my_ion_request}, function (e, r, body) {
            // and here, at some later (indeterminite point) we land.
            // Note that this is occurring in the future, when ION has responded
            // with our profile.

            // The response from ION was a JSON string, so we have to turn it
            // back into a javascript object
            var res_object = JSON.parse(body);
            
            // from this javascript object, extract the user's name
            // user_name = res_object['short_name'];
            

			// [WHITESPACE FOR PRINTING]




            // // Construct a little page that shows their name
            // // -----------REPLACE WITH HANDLEBARS-----------
            // var output_string = "";
            // output_string += "<!doctype html>\n";
            // output_string += "<html><head></head><body>\n";
            // output_string += "<p>Hello "+user_name+"!</p>\n";
            // output_string += "</body></html>";

            // // send away the output
            // res.send(output_string);
            dict = {logged: true}
            res.render('home', dict);

        });
    }
});


// -------------- intermediary login helper -------------- //

// The name '/login' here is not arbitrary!!! The location absolutely
// must match ion_redirect_uri for OAUTH to work!
//
//  HOWEVER - THE USER WILL NEVER ACTUALLY TYPE IN https://user.tjhsst.edu/pckosek/login_worker!!!!
//    This is a hidden endpoint used for authentication purposes. It is used as 
//    an intermediary worker that ultimately redirects authenticaed users

app.get('/login_worker', async function (req, res) {

    // The whole purpose of this 'get' handler is to attach your  token to the session. 
    // Your users should not be going here if they are not trying to login in - and you
    // should not be attaching your login token in any other methods (like the default landing page)

    // Step one. Assuming we were send here following an authentication and that there is a code attached.
    if (typeof req.query.code != 'undefined') {
        
        // This code was generated by ION. We need it to...
        var theCode = req.query.code 

        // .. construct options that will be used to generate a login token
        var options = {
            code: theCode,
            redirect_uri: ion_redirect_uri,
            scope: 'read'
         };

        // This code will be passed back to ion to request a token.
        var result = await oauth2.authorizationCode.getToken(options);      // await serializes asyncronous fcn call
        var token = oauth2.accessToken.create(result);
        
        // attach the token to the cookie
        req.session.token = token;
        
        var access_token = req.session.token.token.access_token;
        
        // Next, construct an ION api request that queries the profile using the 
        // individual who has logged in's credentials (it will return) their
        // profile
        var my_ion_request = 'https://ion.tjhsst.edu/api/profile?format=json&access_token='+access_token;
        
//         request.get( {url:my_ion_request}, function (e, r, body) {
//             // and here, at some later (indeterminite point) we land.
//             // Note that this is occurring in the future, when ION has responded
//             // with our profile.

//             // The response from ION was a JSON string, so we have to turn it
//             // back into a javascript object
//             var res_object = JSON.parse(body);
            
//             req.session.user_name = res_object['short_name'];
//             // from this javascript object, extract the user's name
//             // user_name = res_object['short_name'];
            

// 			// [WHITESPACE FOR PRINTING]




//             // // Construct a little page that shows their name
//             // // -----------REPLACE WITH HANDLEBARS-----------
//             // var output_string = "";
//             // output_string += "<!doctype html>\n";
//             // output_string += "<html><head></head><body>\n";
//             // output_string += "<p>Hello "+user_name+"!</p>\n";
//             // output_string += "</body></html>";

//             // // send away the output
//             // res.send(output_string);
//             res.redirect('https://carpool.sites.tjhsst.edu/');
//         });
        
        res.redirect('https://carpool.sites.tjhsst.edu/');
        // Finally, we are going to redirect the user back to the home page.
        // They'll never even know that they landed on this '/login' helper
        // because we are going to redirect them - but there will be a token
        // attached to the cookie this time upon arrival - which will render 
        // a different page this time.

    } else {
        res.send('no code attached')
    }
});


var listener = app.listen(app.get('port'), function() {
  console.log( 'Express server started on port: '+listener.address().port);
});

