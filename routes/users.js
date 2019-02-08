var express = require('express');
var router = express.Router();
const db = require('../services/db');
var rds = require('../services/remote-desktop-service');
var moment = require('moment');

router.get('/:username', authenticationMiddleware(), function (req, res, next) {
  db.getUser(req.params.username).then((results) => {
    if (results.length > 0) {
      if (results[0].instanceId) {
        rds.getInstanceStatus(results[0].instanceId).then(status => {
          db.updateInstanceStatus(status).then(() => {
            db.getUser(req.params.username).then((results) => {
              res.render('dashboard', { page: 'MyDesktop', menuId: 'dashboard', user: results[0] });
            });
          })
        })
      } else {
        res.render('dashboard', { page: 'MyDesktop', menuId: 'dashboard', user: results[0] });
      }
    } else {
      db.saveUser(req.params.username, req.query.name).then(result => {
        if (result) {
          db.getUser(req.params.username).then((results) => {
            if (results.length > 0) {
              res.render('dashboard', { page: 'MyDesktop', menuId: 'dashboard', user: results[0] });
            }
          })
        }
      })
    }
  })
})

router.put('/:username/startInstance', authenticationMiddleware(), function (req, res, next) {
  db.getInstanceId(req.params.username).then((data) => {
    if (data && data[0].instanceId) {
      rds.startInstance(data[0].instanceId).then(result => {
        if (result && result.RequestId) {
          var startTime = moment().local();
          var weekNumber = startTime.isoWeek();
          var month = startTime.month() + 1;
          var lastStartTime = startTime.format("DD-MM-YYYY HH:mm:ss").toString();
          db.updateStatusAndStartTime('Running', lastStartTime, req.params.username);
          db.saveUsageRecord(req.params.username, lastStartTime, weekNumber, month);
          res.status(200).send('Running');
        } else {
          res.status(500).send('Start request failed, please try again!');
        }
      })
    } else {
      res.status(200).send('No instance is assigned');
    }
  })
})

router.get('/:username/:instanceId/stopInstance', function (req, res, next) {
  rds.getInstanceStatus(req.params.instanceId).then(instanceStatus => {
    if (instanceStatus == 'Stopped') {
      res.status(200).send('Stopped');
    } else {
      rds.stopInstance(req.params.instanceId).then(result => {
        if (result && result.RequestId) {
          var lastStopTime = moment().format("DD-MM-YYYY HH:mm:ss").toString();
          calculateUsage(lastStopTime, req.params.username).then(usage => {
            db.updateStatusAndUsage('Stopped', lastStopTime, usage.cumulativeUsage, req.params.username);
            db.getStartTimeFromUsageRecord(req.params.username).then(result => {
              db.updateUsageRecord(lastStopTime, usage.runningTime, req.params.username, result[0].startTime);
            });
          });
          res.status(200).send();
        } else {
          res.status(500).send();
        }
      })
    }
  })
})

router.patch('/:instanceId/stopIdleInstance', function (req, res, next) {
  var timestamp = moment().toLocaleString();
  console.log(`Idle instanceId: ${req.params.instanceId} ${timestamp}`);
  db.getUsername(req.params.instanceId).then(result => {
    if (result && result.length > 0) {
      var username = result[0].username;
      rds.stopInstance(req.params.instanceId).then(result => {
        if (result && result.RequestId) {
          var lastStopTime = moment().format("DD-MM-YYYY HH:mm:ss").toString();
          calculateUsage(lastStopTime, username).then(usage => {
            db.updateStatusAndUsage('Stopped', lastStopTime, usage.cumulativeUsage, username);
            db.getStartTimeFromUsageRecord(username).then(startTime => {
              db.updateUsageRecord(lastStopTime, usage.runningTime, username, startTime);
            });
            isInstanceStopped(req.params.instanceId).then(stopped => {
              if (stopped) {
                rds.deleteInstance(req.params.instanceId).then(result => {
                  if (result) {
                    db.updateOnDeleteInstance(null, null, null, null, username);
                  }
                })
              }
            })
          })
        }
      })
    }
    res.status(200).send();
  })
})

router.get('/:username/getInstanceStatus', function (req, res, next) {
  rds.getInstanceStatus(user.instanceId).then(status => {
    if (status) {
      user.instanceStatus = status;
      res.json({
        status: res.statusCode
      })
    } else {
      res.status(500).send()
    }
  })
})

/** CreateInstance */
router.post('/:username/createInstance', authenticationMiddleware(), function (req, res, next) {
  var username = req.params.username;
  var instanceId = null;
  rds.getAvailableEipAddresses().then(result => {
    if (result && result.length > 0) {
      rds.createInstance(username).then(result => {
        if (result && !result.error) {
          instanceId = result.InstanceId;
          isInstanceStopped(instanceId).then(stopped => {
            if (stopped) {
              rds.bindIpAddress(instanceId).then((data) => {
                if (data) {
                  db.saveInstanceDetails(instanceId, data.instanceIP, data.ipAllocationId, 'Stopped', null, username);
                  res.status(200).send('Created');
                } else {
                  db.saveInstanceDetails(instanceId, null, null, 'IP unassigned, delete & launch new PC', null, username);
                  res.status(500).send('Failed to assign IP, delete & launch new PC');
                }
              })
            } else {
              db.saveInstanceDetails(instanceId, null, null, 'IP unassigned, delete & launch new PC', null, username);
              res.status(500).send('Failed to assign IP, delete & launch new PC');
            }
          })
        } else {
          res.status(500).send(result.error);
        }
      })
    } else {
      res.status(500).send('IP unavailable! Contact IT Services')
    }
  })

})

/** Delete Instance */
router.post('/:username/deleteInstance', function (req, res, next) {
  isInstanceStopped(req.body.instanceId).then(stopped => {
    if (stopped) {
      rds.deleteInstance(req.body.instanceId).then(result => {
        if (result) {
          db.updateOnDeleteInstance(null, null, null, null, req.params.username);
          res.status(200).send();
        } else {
          res.status(500).send('Request failed');
        }
      })
    } else {
      res.status(500).send('Incorrect instance state');
    }
  })
})

/** Calculates running time of an instance */
function calculateUsage(stopTime, username) {
  var usage = { cumulativeUsage: 0, runningTime: 0 };
  return new Promise((resolve, reject) => {
    db.getLastStartTimeAndUsage(username).then((result) => {
      usage.cumulativeUsage = result[0].usageInSeconds;
      if (result && result[0].lastStartTime) {
        var lastStartTime = moment(result[0].lastStartTime, "DD-MM-YYYY HH:mm:ss")
        var lastStopTime = moment(stopTime, "DD-MM-YYYY HH:mm:ss")
        var diffInMs = lastStopTime.diff(lastStartTime);
        usage.runningTime = moment.duration(diffInMs).asSeconds();
        usage.cumulativeUsage = usage.cumulativeUsage + usage.runningTime;
        resolve(usage)
      } else {
        resolve(usage)
      }
    }).catch(err => {
      console.log(`calculateUsage: ${err}`);
    })
  })
}

function authenticationMiddleware() {
  return (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  }
}

/** Checks if the instance is in stopped state
 * by pinging the status every 6 seconds, 10 times
 */
function isInstanceStopped(instanceId) {
  return new Promise((resolve, reject) => {
    var count = 10;
    var timer = setInterval(() => {
      if (count <= 0) {
        clearInterval(timer);
        reject(false);
      }
      rds.getInstanceStatus(instanceId).then(status => {
        console.log(`isInstanceStopped: count=${count}`);
        count = count - 1;
        if (status && status == "Stopped") {
          clearInterval(timer);
          resolve(true)
        }
      });
    }, 6000);
  }).catch(err => {
    console.error(`isInstanceStopped: ${err}`)
    return false;
  })

}
module.exports = router;
