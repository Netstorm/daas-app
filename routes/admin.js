var express = require('express');
var router = express.Router();
var passport = require('passport');
const { check, validationResult } = require('express-validator/check');
var rds = require('../services/remote-desktop-service');
const ad = require('../services/active-directory');
const db = require('../services/db');

/* GET admin listing. */
router.get('/', (req, res, next) => {
	if (req.isAuthenticated()) {
		res.redirect('/admin/dashboard');
	}
	else {
		res.render('admin-login', { page: 'MyDesktop Admin', menuId: 'admin-login', errors: null, authenticated: false });
	}
});

/* POST login credentials. */
router.post('/login',
	[check('username', 'Username is required').not().isEmpty(),
	check('password', 'Password is required').not().isEmpty()], (req, res, next) => {
		const PAGE = 'MyDesktop Admin';
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.render('admin-login', { page: PAGE, menuId: 'admin', errors: errors.array(), authenticated: false });
		} else {
			ad.user(req.body.username).authenticate(req.body.password).then(result => {
				console.log('Result: ', result);
				if (result) {
					user.username = req.body.username;
					ad.user(user.username).isMemberOf('MyDesktopAdmin').then(result => {
						if (result) {
							ad.user(user.username).get().then(adUser => {
								console.log('Name: ', adUser.displayName);
								user.name = adUser.displayName;

								req.login(user.username, function (err) {
									res.redirect('/admin/dashboard');
								});
							});
						} else {
							var errors = [{ msg: `${user.username} is not a member of MyDesktopAdmin group` }];
							res.render('admin-login', { page: PAGE, menuId: 'admin-login', errors: errors, authenticated: false });
						}
					});
				}
				else {
					var errors = [{ msg: 'Invalid Credentials' }];
					res.render('admin-login', { page: PAGE, menuId: 'admin-login', errors: errors, authenticated: false });
				}

			}).catch(err => {
				console.log('Authentication failed:', err);
			});
		}
	});

router.get('/dashboard', (req, res, next) => {
	const PAGE = 'Admin Dashboard';
	var vdiusers = [{
		name: 'Test User1',
		username: 'test.user1',
		instanceId: 'aknfsnslv',
		instanceIP: '47.43.87.32',
		instanceStatus: 'Running'
	},
	{
		name: 'Test User2',
		username: 'test.user2',
		instanceId: 'gdlgblbc-s',
		instanceIP: '47.73.54.37',
		instanceStatus: 'Stopped'
	}]
	res.render('admin-dashboard', { page: PAGE, menuId: 'admin-dashboard', user: user, vdiusers: vdiusers, authenticated: true });
});

var user = {
	username: '',
	name: ''
}
module.exports = router;
