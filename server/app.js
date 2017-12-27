var read = require('read-yaml')
var path = require('path')

var PouchDB = require('pouchdb')
var LocalPouch = PouchDB.defaults({prefix: path.join(__dirname, '../db/')})
var UsersDb = new LocalPouch('users')
var NodesDb = new LocalPouch('nodes')

var express = require('express')
var passport = require('passport')
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
let bodyParser = require('body-parser');


//var config = read.sync('/tangerine/server/config.yml')

var app = express()

// parse application/json
app.use(bodyParser.json());

app.use(function (req, res, next) {
  //console.log('Time:', Date.now())
  //console.log(Object.keys(req))
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

app.get('/auth/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/nodes', async function(req, res) {
  let response = await NodesDb.allDocs({include_docs: true})
  let nodes = response.rows.map((row) => row.doc)
  res.json(nodes)
})

app.post('/nodes/new', async function(req, res) {
  console.log(req.body)
  console.log(req.body.name)
  let status = await NodesDb.post(req.body)
  console.log(status)
  res.send(status)
})

//var User = require('./User')
class Users {
  constructor() {
    this.db = UsersDb 
  }
  async findById(id) {
    try {
      let user = await this.db.get(id)
      return user
    } catch (e) {
      console.log(e)
    }
    return {}
  }

  async findOrCreate(profile, done) {
    try {
      let user = await this.db.get(profile.id)
      done(null, profile)
    } catch(err) {
      console.log(`Creating user ${profile.id}`)
      console.log(JSON.stringify(profile))
      try {
        let userObject = Object.assign({_id: profile.id}, profile) 
        delete userObject._raw
        delete userObject._json
        let res = await this.db.post(userObject)
        console.log(res)
      } catch(e) {
        console.log('ERROR: Could not save user.')
        console.log(e)
      }
      //let user = await this.db.get(res.id)
      //return user
      done(null, profile)
    }
  }
}

var users = new Users() 


passport.serializeUser(function(user, done) {
  console.log(user)
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  console.log(user)
  done(null, user);
});

/*
app.get('/users/:id', async function(req, res) {
  let user = await users.findById(req.param.id)
  return res.json(user)
})
*/
 
app.get('/users/me', async function(req, res) {
  console.log(JSON.stringify(req.user))
  if (req.user && req.user.id) {
    let user = await users.findById(req.user.id)
    return res.json(user)
  } else {
    return res.json({})
  }
})

  
 

/*
 * Google Auth
 */
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_AUTH_CALLBACK_URL = process.env.BASE_PATH + "/auth/google/callback"
// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_AUTH_CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
     users.findOrCreate(profile, function (err, user) {
       return done(err, user)
     })
     // return done(null, { name: "test", id: profile.id, profile: profile })
  }
))

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }))

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/')
  })

app.listen(3000)
