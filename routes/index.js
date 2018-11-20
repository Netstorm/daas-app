var express = require('express');
var router = express.Router();
var ActiveDirectory = require('ad');
var config = {
  url: 'ldap://10.0.2.15/',
  user: 'Administrator@mhs.local',
  pass: 'Mirage@1007'
}
var ad = new ActiveDirectory(config);

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { page: 'MyDesktop', menuId: 'home' });
});

/* POST login credentials. */
router.post('/login', function (req, res, next) {
  console.log(req.body.username);
  console.log(req.body.password);
  ad.user().get().then(users => {
    console.log('Your users:', users);
  }).catch(err => {
    console.log('Error getting users:', err);
  });
  res.send("OK");
});
module.exports = router;
