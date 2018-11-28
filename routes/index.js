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
		console.log(`Req: `, req.user);
		res.redirect(`/users/${req.user}`);
	}
	else {
		res.render('index', { page: 'MyDesktop', menuId: 'home', errors: null, authenticated: false });
	}

});
/* GET dashboard page. */
// router.get('/dashboard', authenticationMiddleware(), (req, res, next) => {
// 	console.log(req.user);
// 	console.log('Is authenticated: ', req.isAuthenticated());
// 	rds.getInstanceStatus(user.instanceId).then(status => {
// 		user.instanceStatus = status;
// 		res.render('dashboard', { page: 'MyDesktop', menuId: 'dashboard', user: user });
// 	});
// });

/* POST login credentials. */
router.post('/login',
	[check('username', 'Username is required').not().isEmpty(),
	check('password', 'Password is required').not().isEmpty()], (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			// res.json({
			// 	error: errors.array()
			// });
			res.render('index', { page: 'MyDesktop', menuId: 'home', errors: errors.array() });
		} else {
			ad.user(req.body.username).isMemberOf('students').then(isMember => {
				console.log(`Is Member: ${isMember}`);
				if (isMember) {
					ad.user(req.body.username).authenticate(req.body.password).then(result => {
						console.log('Result: ', result);
						if (result) {
							db.query({ sql: 'SELECT * FROM `users` WHERE `username`=?', values: [req.body.username] },
								function (error, results, fields) {
									if (error) throw error;
									if (results.length > 0) {
										console.log('Username:', results[0].username);
										console.log('InstanceId:', results[0].instanceId);
										console.log('InstanceIP:', results[0].instanceIP);
										// res.json({
										// 	data: results
										// });
										req.login(results[0].username, function (err) {
											res.redirect(`/users/${results[0].username}`);
										});
									}
									else {
										var errors = [{ msg: 'Desktop is not yet provisioned, please contact IT Services' }];
										res.render('index', { page: 'MyDesktop', menuId: 'home', errors: errors });
										// res.json({
										// 	error: `No record found for user: ${req.body.username}`
										// });
										// ad.user(req.body.username).get().then(adUser => {
										// 	user.username = req.body.username;
										// 	user.name = adUser.displayName;
										// 	saveUserRecordinDB(user.username, user.name);
										// })

									}
								});

							// });
						} else {
							// res.json({
							// 	error: 'Invalid Credentials'
							// });
							var errors = [{ msg: 'Invalid credentials' }];
							res.render('index', { page: 'MyDesktop', menuId: 'home', errors: errors });
						}
					});
				} else {
					// res.json({
					// 	error: 'No group permissions'
					// });
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

router.post('/startInstance', (req, res, next) => {
	rds.startInstance(user.instanceId).then(result => {
		if (result) {
			console.log(`RequestId: ${result.RequestId}`);
			res.status(200).send();
		} else {
			console.log('Failed to start');
			res.status(500).send();
		}
	});
});

router.post('/stopInstance', (req, res, next) => {
	rds.startInstance(user.instanceId).then(result => {
		if (result) {
			console.log(`RequestId: ${result.RequestId}`);
			res.status(200).send();
		} else {
			console.log('Failed to start');
			res.status(500).send();
		}
	});
});

passport.serializeUser(function (username, done) {
	done(null, username);
});

passport.deserializeUser(function (username, done) {
	done(null, username);
});

function authenticationMiddleware() {
	return (req, res, next) => {
		if (req.isAuthenticated()) {
			return next();
		}
		res.redirect('/');
	}
}

var saveUserRecordinDB = async (username, name) => {
	db.query({ sql: 'INSERT INTO `users` (username, name) VALUES (?,?)', values: [username, name] },
		function (error, results, fields) {
			if (error) throw error;
		});
}

module.exports = router;
