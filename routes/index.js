var express = require('express');
var router = express.Router();
var passport = require('passport');
var ActiveDirectory = require('ad');
const { check, validationResult } = require('express-validator/check');
var config = {
  url: process.env.LDAP_SERVER_URL,
  user: process.env.AD_ADMIN_USER,
  pass: process.env.AD_ADMIN_PASS
}
var ad = new ActiveDirectory(config);

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { page: 'MyDesktop', menuId: 'home', errors: null });
});
/* GET dashboard page. */
router.get('/dashboard', authenticationMiddleware(), (req, res, next) => {
  console.log(req.user);
  console.log('Is authenticated: ', req.isAuthenticated());
  res.render('dashboard', { page: 'MyDesktop', menuId: 'dashboard', displayName: 'user.displayName'});
});

/* POST login credentials. */
router.post('/login', 
  [check('username', 'Username is required').not().isEmpty(),
   check('password', 'Password is required').not().isEmpty() ], (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    res.render('index', { page: 'MyDesktop', menuId: 'home', errors: errors.array()});
  } else {
    ad.user(req.body.username).authenticate(req.body.password).then(result => {
      console.log('Result: ', result);
      if(result) {
        console.log('Authentication:', result);
        var username = req.body.username;
        ad.user(username).get().then(user => {
          console.log('User: ', user.displayName);
          req.login(username, function(err){
            res.redirect('/dashboard');
          });
        });
      } else {
        var errors = [{msg: 'Invalid credentials'}];
        res.render('index', { page: 'MyDesktop', menuId: 'home', errors: errors});
      }
    }).catch(err => {
      console.log('Authentication failed:', err);
      next(err);
    });
  }

});

passport.serializeUser(function(username, done) {
  done(null, username);
});

passport.deserializeUser(function(username, done) {
    done(null, username);
});

function authenticationMiddleware() {
  return (req, res, next) => {
    if(req.isAuthenticated()){
      return next();
    }
    res.redirect('/');
  }
}

module.exports = router;
