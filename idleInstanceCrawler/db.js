var mysql = require('mysql');

var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DBNAME
});

connection.connect();

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

module.exports = {
    connection, getUsername, updateOnDeleteInstance
}