var express = require('express');
var router = express.Router();
var passport = require('passport');
var rds = require('../services/remote-desktop-service');
const ad = require('../services/active-directory');
const db = require('../services/db');
const { check, validationResult } = require('express-validator/check');
var user = require('../models/user');

router.get('/instance', (req, res, next) => {
  rds.describeInstanceStatus().then(data =>{
    console.log(data);
  });
});
/* GET home page. */
router.get('/', (req, res, next) => {
  if(req.isAuthenticated()) {
    res.redirect('/dashboard');
  }
  else {
    res.render('index', { page: 'MyDesktop', menuId: 'home', errors: null });
  }
  
});
/* GET dashboard page. */
router.get('/dashboard', authenticationMiddleware(), (req, res, next) => {
  console.log(req.user);
  console.log('Is authenticated: ', req.isAuthenticated());
  rds.describeInstanceStatus();
  res.render('dashboard', { page: 'MyDesktop', menuId: 'dashboard', user: user});
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
          console.log('Name: ', adUser.displayName);
          user.name = adUser.displayName;
          db.query({sql: 'SELECT * FROM `users` WHERE `username`=?', values: [user.username]}, 
          function(error, results, fields){
            if(error) throw error;
            if(results.length > 0) {
              user.instanceId = results[0].instanceId;
              user.instanceIP = results[0].instanceIP;
              console.log('Username:', results[0].username);
              console.log('InstanceId:', results[0].instanceId);
              console.log('InstanceIP:', results[0].instanceIP);
            }
            else {
              createUserRecordInDB(user.username, user.name);
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
    });
  }

});

router.post('/connect', (req, res, next) => {
  rds.startInstance(user.instanceId);
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

var createUserRecordInDB = async(username, name) => {
  db.query({sql:'INSERT INTO `users` (username, name) VALUES (?,?)', values:[username, name]},
  function(error, results, fields){
    if(error) throw error;
  });
}

module.exports = router;
