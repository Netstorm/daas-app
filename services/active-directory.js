var ActiveDirectory = require('ad');

var config = {
	url: process.env.LDAP_SERVER_URL,
	user: process.env.AD_ADMIN_USER,
	pass: process.env.AD_ADMIN_PASS
}
var ad = new ActiveDirectory(config);

module.exports = ad;