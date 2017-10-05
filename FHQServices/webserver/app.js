var express = require('express')
var OAuth = require('oauth').OAuth2
var url = require("url")
var http = require('http')
var sys = require('util')
var querystring = require('querystring')
var logger = require('morgan')
var methodOverride = require('method-override')
var session = require('express-session')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var multer = require('multer')
var errorHandler = require('errorhandler')




// Setup the Express.js server
var app = express()
app.use(logger('combined'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ resave: true,
  saveUninitialized: true,
  secret: 'WilliamNoah' }))

// Home Page route
app.get('/', function(req, res){
if(!req.session.oauth_access_token) {
 res.redirect("/shopify_login");
}
else {
 res.redirect("/render_app");
}
});

// Request an OAuth Request Token, and redirects the user to authorize it
app.get('/shopify_login', function(request, response) {

//Set up all your OAUTH Variables
var my= {};

//The first two parameters are your API_KEY followed by your SECRET_KEY
my._oAuth= new OAuth("486eb938d9775e71474326f2909bb310",
                     "d60c807a6bcc1820925f12bb22b350f6",
                     "https://FHQDEV2017.myshopify.com",
                     "/admin/oauth/authorize",
                     "/admin/oauth/access_token");

my._redirectUri= "https://fabrichqservices.ngrok.io/shopify_login";
my.scope= "read_products";

var parsedUrl= url.parse(request.originalUrl, true);

//Request the Access token after you have your temporary token
if(parsedUrl.query && parsedUrl.query.code) {
 my._oAuth.getOAuthAccessToken(parsedUrl.query.code,
                                {redirect_uri: my._redirectUri}, function( error, access_token, refresh_token ){
                                  if( error ) callback(error)
                                  else {
                                    request.session["access_token"]= access_token;
                                    if( refresh_token ) request.session["refresh_token"]= refresh_token;
                                      my._oAuth.getProtectedResource("https://FHQDEV2017.myshopify.com/admin/shop.json", request.session["access_token"], function (error, data, oResponse) {
                                      if( error ) {
                                         console.log("Error");
                                      } else {
                                        console.log(data)
                                        //Parse the JSON data to send to the template
                                        var shop_data = JSON.parse(data);

                                        //Render your templates here, sending in shop_data or whatever resource you wished to get
                                       /* response.render('shop_info.ejs', {
                                            locals: { shop_data: shop_data }
                                        });
*/
                                        //You could also send back some kind of message
                                        //response.send('hello shopify');

                                      }
                                    })
                                  }
                                });
}   
else {
  var redirectUrl= my._oAuth.getAuthorizeUrl({redirect_uri : my._redirectUri, scope: my.scope })
  response.redirect(redirectUrl);
}
});

// User has already authorized, so display the application
app.get('/render_app', function(request, response) {
 sys.put("Render templates here");
});

app.listen(3000);
console.log("Listening on https://fabrichqservices.ngrok.io");
