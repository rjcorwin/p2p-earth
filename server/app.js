var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../client')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/*
 * Passport setup
 */

app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  console.log(user)
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  console.log(user)
  done(null, user);
});

/*
 * Auth0 Auth
 */
var Auth0Strategy = require('passport-auth0'),
    passport = require('passport');

var strategy = new Auth0Strategy({
   domain:       process.env.AUTH0_DOMAIN,
   clientID:     process.env.AUTH0_CLIENT_ID,
   clientSecret: process.env.AUTH0_CLIENT_SECRET,
   callbackURL:  process.env.BASE_PATH + '/auth0/callback'
  },
  function(accessToken, refreshToken, extraParams, profile, done) {
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user
		/*
     User.findOrCreate({ googleId: profile.id }, function (err, user) {
       return done(err, user)
     })
		*/
    return done(null, profile);
  }
);

passport.use(strategy);

app.get('/auth0/callback',
  passport.authenticate('auth0', { failureRedirect: '/login' }),
  function(req, res) {
    if (!req.user) {
      throw new Error('user null');
    }
    res.redirect("/");
  }
);

app.get('/auth0/login',
  passport.authenticate('auth0', {}), function (req, res) {
  res.redirect("/");
});

module.exports = app;
