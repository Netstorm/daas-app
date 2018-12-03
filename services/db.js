var mysql = require('mysql');

var connection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_DBNAME
});

connection.connect();

function getUser(username) {
	return new Promise((resolve, reject) => {
		connection.query({ sql: 'SELECT * FROM `users` WHERE `username`=(?)', values: [username] },
			function (error, results, fields) {
				if (error) {
					reject(error);
				} else {
					resolve(results);
				}
			});
	});
}

function getAllUsers() {
	return new Promise((resolve, reject) => {
		connection.query({ sql: 'SELECT * FROM `users`' }, function (error, results, fields) {
			if (error) {
				reject(error);
			} else {
				resolve(results);
			}
		});
	});
}

function updateUser(instanceId, instanceIP, username) {
	return new Promise((resolve, reject) => {
		connection.query({
			sql: 'UPDATE `users` SET `instanceId` = (?),	`instanceIP` = (?)	WHERE `username` = (?)',
			values: [instanceId, instanceIP, username]
		}, function (error, results, fields) {
			if (error) {
				reject(error);
			} else {
				resolve(results);
			}
		});
	});
}

function assignInstance(instanceId, instanceStatus, username) {
	return new Promise((resolve, reject) => {
		connection.query({
			sql: 'UPDATE `users` SET `instanceId` = (?), `instanceStatus` = (?)	WHERE `username` = (?)',
			values: [instanceId, instanceStatus, username]
		}, function (error, results, fields) {
			if (error) {
				reject(error);
			} else {
				resolve(results);
			}
		});
	});
}

function updateIp(instanceIP, allocationId, username) {
	return new Promise((resolve, reject) => {
		connection.query({
			sql: 'UPDATE `users` SET `instanceIP` = (?), `ipAllocationId` = (?)	WHERE `username` = (?)',
			values: [instanceIP, allocationId, username]
		}, function (error, results, fields) {
			if (error) {
				reject(error);
			} else {
				resolve(results);
			}
		});
	});
}

function saveInstanceDetails(instanceId, instanceIP, allocationId, instanceStatus, username) {
	return new Promise((resolve, reject) => {
		connection.query({
			sql: 'UPDATE `users` SET `instanceId` = (?), `instanceIP` = (?), `ipAllocationId` = (?), `instanceStatus` = (?)	WHERE `username` = (?)',
			values: [instanceId, instanceIP, allocationId, instanceStatus, username]
		}, function (error, results, fields) {
			if (error) {
				reject(error);
			} else {
				resolve(results);
			}
		});
	});
}

function getIpDetails(username) {
	return new Promise((resolve, reject) => {
		connection.query({ sql: 'SELECT `instanceIP`, `ipAllocationId` FROM `users` WHERE `username`=(?)', values: [username] },
			function (error, results, fields) {
				if (error) {
					reject(error);
				} else {
					resolve(results);
				}
			});
	});
}

function saveUser(username, name) {
	return new Promise((resolve, reject) => {
		connection.query({ sql: 'INSERT INTO `users` (username, name) VALUES (?,?)', values: [username, name] },
			function (error, results, fields) {
				if (error) {
					reject(error);
				} else {
					resolve(results);
				}
			});
	});
}

function ifUserExists(username) {
	return new Promise((resolve, reject) => {
		connection.query({ sql: 'SELECT 1 FROM `users` WHERE `username`=(?)', values: [username] },
			function (error, results, fields) {
				if (error) {
					console.error(error);
					reject(error);
				} else {
					console.log(results);
					resolve(results)
				}
			});
	})
}

function updateInstanceStatus(instanceStatus, username) {
	return new Promise((resolve, reject) => {
		connection.query({
			sql: 'UPDATE `users` SET `instanceStatus` = (?)	WHERE `username` = (?)',
			values: [instanceStatus, username]
		}, function (error, results, fields) {
			if (error) {
				reject(error);
			} else {
				resolve(results);
			}
		});
	});
}

module.exports = {
	connection, getUser, getAllUsers, updateUser, saveUser, ifUserExists,
	updateInstanceStatus, assignInstance, updateIp, getIpDetails, saveInstanceDetails
};