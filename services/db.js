var mysql = require('mysql');
var moment = require('moment');

var connection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_DBNAME
});

connection.connect();

function getUser(username) {
	return new Promise((resolve, reject) => {
		connection.query({ sql: 'SELECT `username`, `name`, `instanceId`, `instanceStatus`, `instanceIP`, `ipAllocationId` FROM `users` WHERE `username`=(?)', values: [username] },
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

function updateOnDeleteInstance(instanceId, instanceIP, allocationId, instanceStatus, username) {
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

function getInstanceId(username) {
	return new Promise((resolve, reject) => {
		connection.query({ sql: 'SELECT `instanceId` FROM `users` WHERE `username`=(?)', values: [username] },
			function (error, results, fields) {
				if (error) {
					reject(error);
				} else {
					resolve(results);
				}
			});
	});
}

function getUsername(instanceId) {
	return new Promise((resolve, reject) => {
		connection.query({ sql: 'SELECT `username` FROM `users` WHERE `instanceId`=(?)', values: [instanceId] },
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

function updateStatusAndUsage(instanceStatus, lastStopTime, usageInSeconds, username) {
	return new Promise((resolve, reject) => {
		connection.query({
			sql: 'UPDATE `users` SET `instanceStatus` = (?), `lastStopTime` = (?), `usageInSeconds` = (?)	WHERE `username` = (?)',
			values: [instanceStatus, lastStopTime, usageInSeconds, username]
		}, function (error, results, fields) {
			if (error) {
				reject(error);
			} else {
				resolve(results);
			}
		});
	});
}

function updateStatusAndStartTime(instanceStatus, lastStartTime, username) {
	return new Promise((resolve, reject) => {
		connection.query({
			sql: 'UPDATE `users` SET `instanceStatus` = (?), `lastStartTime` = (?)	WHERE `username` = (?)',
			values: [instanceStatus, lastStartTime, username]
		}, function (error, results, fields) {
			if (error) {
				reject(error);
			} else {
				resolve(results);
			}
		});
	});
}

function getLastStartTimeAndUsage(username) {
	return new Promise((resolve, reject) => {
		connection.query({ sql: 'SELECT `lastStartTime`, `usageInSeconds` FROM `users` WHERE `username`=(?)', values: [username] },
			function (error, results, fields) {
				if (error) {
					reject(error);
				} else {
					resolve(results);
				}
			});
	});
}

function updateUsageTime(instanceStatus, lastStartTime, username) {
	return new Promise((resolve, reject) => {
		connection.query({
			sql: 'UPDATE `users` SET `instanceStatus` = (?), `lastStartTime` = (?)	WHERE `username` = (?)',
			values: [instanceStatus, lastStartTime, username]
		}, function (error, results, fields) {
			if (error) {
				reject(error);
			} else {
				resolve(results);
			}
		});
	});
}

function saveInstanceDetails(instanceId, instanceIP, allocationId, instanceStatus, lastStartTime, username) {
	return new Promise((resolve, reject) => {
		connection.query({
			sql: 'UPDATE `users` SET `instanceId` = (?), `instanceIP` = (?), `ipAllocationId` = (?), `instanceStatus` = (?), `lastStartTime` = (?)	WHERE `username` = (?)',
			values: [instanceId, instanceIP, allocationId, instanceStatus, lastStartTime, username]
		}, function (error, results, fields) {
			if (error) {
				reject(error);
			} else {
				resolve(results);
			}
		});
	});
}

function saveInstanceDetailsAndUsage(instanceId, instanceIP, allocationId, instanceStatus, lastStopTime, usageInSeconds, username) {
	return new Promise((resolve, reject) => {
		connection.query({
			sql: 'UPDATE `users` SET `instanceId` = (?), `instanceIP` = (?), `ipAllocationId` = (?), `instanceStatus` = (?), `lastStopTime` = (?), `usageInSeconds` = (?)	WHERE `username` = (?)',
			values: [instanceId, instanceIP, allocationId, instanceStatus, lastStopTime, usageInSeconds, username]
		}, function (error, results, fields) {
			if (error) {
				reject(error);
			} else {
				resolve(results);
			}
		})
	})
}

module.exports = {
	connection, getUser, getAllUsers, updateUser, saveUser, ifUserExists, updateInstanceStatus,
	updateStatusAndUsage, assignInstance, updateIp, getIpDetails, saveInstanceDetails, updateOnDeleteInstance,
	updateStatusAndStartTime, getLastStartTimeAndUsage, saveInstanceDetailsAndUsage, getInstanceId, getUsername
};