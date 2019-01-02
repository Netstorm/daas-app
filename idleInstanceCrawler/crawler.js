const db = require('./db');
const rds = require('./remote-desktop-service');
var moment = require('moment');
// Load env variables
require('dotenv').config({ path: "../.env" });

global.instanceslastChecked = [];
rds.getStoppedInstances().then((instances) => {
  instanceslastChecked = instances;
});

setInterval(() => {
  deleteIdleInstances().then(() => {
    var timestamp = new Date();
    console.log(`[${timestamp.toLocaleString()}] Job complete`);
  });
}, 600000);

function deleteIdleInstances() {
  return new Promise((resolve, reject) => {
    rds.getStoppedInstances().then((instances) => {
      if (instances.length > 0) {
        instances.forEach(function (instanceId) {
          var username;
          db.getUsername(instanceId).then(result => {
            if (result && result.length > 0) {
              username = result[0].username;
              if (instanceslastChecked.includes(instanceId)) {
                rds.deleteInstance(instanceId).then(deleted => {
                  if (deleted) {
                    instanceslastChecked = instanceslastChecked.filter(item => item !== instanceId);
                    db.updateOnDeleteInstance(null, null, null, null, username);
                  }
                });
              } else {
                instanceslastChecked.push(instanceId);
                var lastStopTime = moment().format("DD-MM-YYYY HH:mm:ss").toString();
                calculateUsage(lastStopTime, username).then(usageInSeconds => {
                  db.updateStatusAndUsage('Stopped', lastStopTime, usageInSeconds, username);
                });
                console.log(`array push ${JSON.stringify(instanceslastChecked)}`);
              }
            }
          });
        });
        resolve();
      } else {
        console.log('No stopped instances');
        resolve();
      }
    })
  })
}


function calculateUsage(stopTime, username) {
  var usage;
  return new Promise((resolve, reject) => {
    db.getLastStartTimeAndUsage(username).then((result) => {
      usage = result[0].usageInSeconds;
      if (result && result[0].lastStartTime) {
        var lastStartTime = moment(result[0].lastStartTime, "DD-MM-YYYY HH:mm:ss")
        var lastStopTime = moment(stopTime, "DD-MM-YYYY HH:mm:ss")
        var diffInMs = lastStopTime.diff(lastStartTime);
        var runningTime = moment.duration(diffInMs).asSeconds();
        usage = usage + runningTime;
        resolve(usage)
      } else {
        resolve(usage)
      }
    }).catch(err => {
      console.log(`calculateUsage: ${err}`);
    })
  })
}