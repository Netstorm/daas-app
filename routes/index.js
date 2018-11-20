var express = require('express');
var router = express.Router();
var ActiveDirectory = require('ad');
const { check, validationResult } = require('express-validator/check');
var config = {
  url: 'ldap://localhost/',
  user: 'user@domain',
  pass: '****'
}
var ad = new ActiveDirectory(config);

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { page: 'MyDesktop', menuId: 'home' });
});

/* POST login credentials. */
router.post('/login', function (req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  check('username').notEmpty();
  check('password').isLength({ min: 6 });
  var errors = validationResult(req);
  if(errors){
    console.log("Errors");
  } else {
    console.log("No Errors");
  }
  ad.user(req.body.username).authenticate(req.body.password).then(result => {
    if(result) {
      console.log('Authentication:', result);
      ad.user(req.body.username).get().then(user => {
        console.log('User: ', user.displayName);
        res.render('webstore', {page: 'MyDesktop', menuId: 'webstore', displayName: user.displayName});
      });
      
    } else{
      console.log('Invalid username or password !');
      res.send('Invalid username or password !');
    }
    
  }).catch(err => {
    console.log('Authentication failed:', err);
    next(err);
  });
  
});
module.exports = router;
