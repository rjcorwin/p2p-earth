var read = require('read-yaml')
var PouchDB = require('pouchdb')
PouchDB.defaults({prefix: './db/'})

var express = require('express')
var passport = require('passport')
var path = require('path')

//var User = require('./User')
class Users {
  constructor() {
    this.db = new PouchDB('users')
  }
  async findOrCreate(profile, done) {
    try {
      let user = await this.db.get(profile.id)
      done(null, profile)
    } catch(err) {
      console.log(`Creating user ${profile.id}`)
      console.log(JSON.stringify(profile))
      try {
        let res = await this.db.put(Object.assign({_id: profile.id}, profile))
      } catch(err) {
        console.log(err)
      }
      console.log(res)
      //let user = await this.db.get(res.id)
      //return user
      done(null, profile)
    }
  }
}

var users = new Users() 

//var config = read.sync('/tangerine/server/config.yml')

var app = express()

app.use(function (req, res, next) {
  console.log('Time:', Date.now())
  console.log(Object.keys(req))
  next()
})
//app.use(express.static('public'));
app.use('/', express.static(path.join(__dirname, '../client/')))

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
//app.use(require('express-session')({ secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true }));
app.use(require('express-session')({ secret: 'foo', resave: true, saveUninitialized: true }));

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
var Auth0Strategy = require('passport-auth0')//,
//    passport = require('passport');
console.log(process.env.BASE_PATH)
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
    users.findOrCreate(profile, function (err, user) {
      return done(err, user)
    })
    */
    return done(null, profile)
  }
);

passport.use(strategy);

app.get('/auth0/callback',
  passport.authenticate('auth0', { failureRedirect: '/login' }),
  function(req, res) {
    console.log('LOGIN')
    console.log(JSON.stringify(req.user))
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

app.listen(3000)
