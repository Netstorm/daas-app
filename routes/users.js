var express = require('express');
var router = express.Router();
const db = require('../services/db');
var rds = require('../services/remote-desktop-service');
var moment = require('moment');

/* GET users listing. */
// router.post('/', function (req, res, next) {
//   db.saveUser(req.body.username, req.body.name).then(results => {
//     res.json({ data: results });
//   })

// });

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
          var lastStartTime = moment().format("DD-MM-YYYY HH:mm:ss").toString();
          db.updateStatusAndStartTime('Running', lastStartTime, req.params.username);
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
          calculateUsage(lastStopTime, req.params.username).then(usageInSeconds => {
            db.updateStatusAndUsage('Stopped', lastStopTime, usageInSeconds, req.params.username);
          })
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
          calculateUsage(lastStopTime, username).then(usageInSeconds => {
            db.updateStatusAndUsage('Stopped', lastStopTime, usageInSeconds, username);
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
  var instanceIP = null;
  var ipAllocationId = null;
  rds.getAvailableEipAddresses().then(result => {
    if (result) {
      instanceIP = result[0].IpAddress;
      ipAllocationId = result[0].AllocationId;
      rds.createInstance(username).then(result => {
        if (result) {
          instanceId = result.InstanceId;
          isInstanceStopped(instanceId).then(stopped => {
            if (stopped) {
              rds.bindIpAddress(instanceId, ipAllocationId).then((result) => {
                if (result) {
                  db.saveInstanceDetails(instanceId, instanceIP, ipAllocationId, 'Stopped', null, username);
                  res.status(200).send('Stopped');
                } else {
                  db.saveInstanceDetails(instanceId, null, null, 'IP unassigned, delete & launch new PC', null, username);
                  res.status(500).send('Failed to assign IP');
                }
              })
            } else {
              db.saveInstanceDetails(instanceId, null, null, 'IP unassigned, delete & launch new PC', null, username);
              res.status(500).send('Failed to assign IP');
            }
          })
        } else {
          res.status(500).send('Could not create instance');
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

function authenticationMiddleware() {
  return (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  }
}

// router.get('/stopped/:instanceId', function (req, res) {
//   db.getUsername(req.params.instanceId).then(result => {
//     res.send(result);
//   })
// })

function isInstanceStopped(instanceId) {
  return new Promise((resolve, reject) => {
    var count = 8;
    var timer = setInterval(() => {
      if (count <= 0) {
        clearInterval(timer);
        reject(false);
      }
      rds.getInstanceStatus(instanceId).then(status => {
        count = count - 1;
        console.log(`isInstanceStopped: count=${count}`);
        if (status && status == "Stopped") {
          clearInterval(timer);
          resolve(true)
        }
      });
    }, 5000);
  }).catch(err => {
    console.error(`isInstanceStopped: ${err}`)
    return false;
  })

}
module.exports = router;
