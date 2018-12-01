var express = require('express');
var router = express.Router();
var passport = require('passport');
var rds = require('../services/remote-desktop-service');
const ad = require('../services/active-directory');
const db = require('../services/db');
const { check, validationResult } = require('express-validator/check');

/* GET home page. */
router.get('/', (req, res, next) => {
	if (req.isAuthenticated()) {
		res.redirect(`/users/${req.user}`);
	}
	else {
		res.render('index', { page: 'MyDesktop', menuId: 'home', errors: null, authenticated: false });
	}

});

/* POST login credentials. */
router.post('/login',
	[check('username', 'Username is required').not().isEmpty(),
	check('password', 'Password is required').not().isEmpty()], (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.render('index', { page: 'MyDesktop', menuId: 'home', errors: errors.array() });
		} else {
			ad.user(req.body.username).isMemberOf(process.env.STUDENT_GROUP).then(isMember => {
				if (isMember) {
					ad.user(req.body.username).authenticate(req.body.password).then(result => {
						if (result) {
							req.login(req.body.username, function (err) {
								res.redirect(`/users/${req.body.username}`);
							});
						} else {
							var errors = [{ msg: 'Invalid credentials' }];
							res.render('index', { page: 'MyDesktop', menuId: 'home', errors: errors });
						}
					});
				} else {
					var errors = [{ msg: 'No group permissions' }];
					res.render('index', { page: 'MyDesktop', menuId: 'home', errors: errors });
				}
			});
		}
	});

router.get('/logout', function (req, res, next) {
	req.logout();
	req.session.destroy();
	res.redirect('/');
});


passport.serializeUser(function (username, done) {
	done(null, username);
});

passport.deserializeUser(function (username, done) {
	done(null, username);
});

module.exports = router;
