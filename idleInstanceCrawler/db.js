var mysql = require('mysql');

var DB_CONFIG = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_DBNAME
}

var connection;

function handleDisconnect() {
	connection = mysql.createConnection(DB_CONFIG);	// Recreate the connection, since the old one cannot be reused.

	connection.connect(function (err) {              // The server is either down
		if (err) {                                     // or restarting (takes a while sometimes).
			console.log('error when connecting to db:', err);
			setTimeout(handleDisconnect, 3000); // We introduce a delay before attempting to reconnect,
		}                                     // to avoid a hot loop, and to allow our node script to
	});                                     // process asynchronous requests in the meantime.
	// If you're also serving http, display a 503 error.
	connection.on('error', function (err) {
		console.log('db error', err);
		if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
			handleDisconnect();                         // lost due to either server restart, or a
		} else {                                      // connnection idle timeout (the wait_timeout
			throw err;                                  // server variable configures this)
		}
	});
}

handleDisconnect();

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

module.exports = {
    connection, getUsername, updateOnDeleteInstance, getLastStartTimeAndUsage, updateStatusAndUsage
}