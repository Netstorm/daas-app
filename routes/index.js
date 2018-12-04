var express = require('express');
var router = express.Router();
var passport = require('passport');
var _ = require('lodash');
var rds = require('../services/remote-desktop-service');
const ad = require('../services/active-directory');
const db = require('../services/db');
const { check, validationResult } = require('express-validator/check');
const url = require('url');

/**
 * Route serving login form.
 * @name get/
 * @function
 * @memberof module:routers/index~indexRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/', (req, res, next) => {
	if (req.isAuthenticated()) {
		res.redirect(`/users/${req.user}`);
	}
	else {
		res.render('index', { page: 'MyDesktop', menuId: 'home', errors: null });
	}

});

/**
 * Route to authenticate active directory user
 * @name post/login
 * @function
 * @memberof module:routers/index~indexRouter
 * @inner
 * @param {string} path - express path
 * @param {array} functions - input validation
 * @param {callback} middleware - express middleware.
 */
router.post('/login',
	[check('username', 'Username is required').not().isEmpty(),
	check('password', 'Password is required').not().isEmpty()], (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.render('index', { page: 'MyDesktop', menuId: 'home', errors: errors.array() });
		} else {
			ad.user(req.body.username).isMemberOf(process.env.USER_GROUP).then(result => {
				if (result) {
					ad.user(req.body.username).get().then(user => {
						var name = user.displayName;
						ad.user(req.body.username).authenticate(req.body.password).then(result => {
							if (result) {
								req.login(req.body.username, function (err) {
									res.redirect(url.format({
										pathname: `users/${req.body.username}`,
										query: { name: name }
									}));
								});
							} else {
								var errors = [{ msg: 'Incorrect password' }];
								res.render('index', { page: 'MyDesktop', menuId: 'home', errors: errors });
							}
						});
					});
				} else {
					var errors = [{ msg: 'Access denied' }];
					res.render('index', { page: 'MyDesktop', menuId: 'home', errors: errors });
				}
			})
		}
	});

router.get('/logout', function (req, res, next) {
	req.logout();
	req.session.destroy();
	res.redirect('/');
});

router.post('/logintest', function (req, res) {
	ad.user(req.body.username).exists().then(result => {
		if (result) {
			ad.user(req.body.username).get().then(user => {
				var dn = user.dn.split(",");
				if (dn.includes("OU=Users") && dn.includes("OU=MHS")) {
					res.json({ data: true })
				} else
					res.json({ data: false })
			})
		} else {
			res.json({ data: 'Does not exist' })
		}
	})
})

passport.serializeUser(function (username, done) {
	done(null, username);
});

passport.deserializeUser(function (username, done) {
	done(null, username);
});

module.exports = router;
