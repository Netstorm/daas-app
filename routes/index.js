var express = require('express');
var router = express.Router();
var passport = require('passport');
var rds = require('../services/remote-desktop-service');
const ad = require('../services/active-directory');
const db = require('../services/db');
const { check, validationResult } = require('express-validator/check');

/* GET home page. */
router.get('/', (req, res, next) => {
  if(req.isAuthenticated()) {
    res.redirect('/dashboard');
  }
  res.render('index', { page: 'MyDesktop', menuId: 'home', errors: null });
});
/* GET dashboard page. */
router.get('/dashboard', authenticationMiddleware(), (req, res, next) => {
  console.log(req.user);
  console.log('Is authenticated: ', req.isAuthenticated());
  res.render('dashboard', { page: 'MyDesktop', menuId: 'dashboard', displayName: user.name});
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
        user.username = req.body.username;
        ad.user(user.username).get().then(adUser => {
          console.log('User: ', adUser.displayName);
          user.name = adUser.displayName;
          db.query({sql: 'SELECT * FROM `users` WHERE `username`=?', values: [user.username]}, 
          function(error, results, fields){
            if(error) throw error;
            if(results.length>0){
              user.instanseId = results[0].instanseId;
              console.log('InstanceId:', results[0].instanseId);
            }
            if(results.length==0){
              db.query({sql:'INSERT INTO `users` (username, name) VALUES (?,?)', values:[user.username, user.name]},
              function(error, results, fields){
                if(error) throw error;
              });
            }
          });
          req.login(user.username, function(err){
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

var user = {
  username: '',
  name: '',
  instanseId: '',
  instanseIP: ''
}
module.exports = router;
