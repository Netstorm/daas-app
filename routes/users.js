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
      res.render('dashboard', { page: 'MyDesktop', menuId: 'dashboard', user: results[0] });
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

// router.get('/:username/:instanceId/startInstance', authenticationMiddleware(), function (req, res, next) {
//   rds.startInstance(req.params.instanceId).then(result => {
//     if (result && result.RequestId) {
//       var lastStartTime = moment().toISOString();
//       db.updateStatusAndStartTime('Running', lastStartTime, req.params.username);
//       res.json({
//         started: true
//       });
//     } else {
//       res.status(500).send();
//     }
//   });
// });

router.get('/:username/:instanceId/stopInstance', authenticationMiddleware(), function (req, res, next) {
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
})

router.get('/:username/:instanceId/stopIdleInstance', authenticationMiddleware(), function (req, res, next) {
  console.log('Idle username: ', req.params.username);
  console.log('Idle instanceId: ', req.params.instanceId);
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
router.get('/:username/createInstance', authenticationMiddleware(), function (req, res, next) {

  var username = req.params.username;
  db.getInstanceId(req.params.username).then((data) => {
    if (data && data[0].instanceId) {
      var instanceId = data[0].instanceId;
      rds.startInstance(instanceId).then(result => {
        if (result && result.RequestId) {
          var lastStartTime = moment().format("DD-MM-YYYY HH:mm:ss").toString();
          db.updateStatusAndStartTime('Running', lastStartTime, req.params.username);
          setTimeout(function () {
            res.status(200).send();
          }, 30000)
        }
      })
    } else {
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
              setTimeout(() => {
                rds.associateEipAddress(instanceId, ipAllocationId).then((result) => {
                  if (result) {
                    rds.startInstance(instanceId).then(result => {
                      if (result && result.RequestId) {
                        var lastStartTime = moment().format("DD-MM-YYYY HH:mm:ss").toString();
                        db.saveInstanceDetails(instanceId, instanceIP, ipAllocationId, 'Running', lastStartTime, username);
                        res.status(200).send();
                      } else {
                        db.saveInstanceDetails(instanceId, instanceIP, ipAllocationId, 'Stopped', null, username);
                        res.status(200).send('Stopped');
                      }
                    })
                  } else {
                    setTimeout(() => {
                      rds.deleteInstance(instanceId)
                    }, 30000);
                    res.status(500).send('Failed to assign IP');
                  }
                })
              }, 45000)
            } else {
              res.status(500).send('Could not create instance');
            }
          })
        } else {
          res.status(500).send('IP Unavailable')
        }
      })
    }
  })

})

/** Delete Instance */
router.post('/:username/deleteInstance', authenticationMiddleware(), function (req, res, next) {
  var instanceStatus;
  rds.getInstanceStatus(req.body.instanceId).then(status => {
    instanceStatus = status;
    if (status == 'Stopped') {
      rds.deleteInstance(req.body.instanceId).then(result => {
        if (result) {
          db.updateOnDeleteInstance(null, null, null, null, req.params.username);
          res.status(200).send();
        } else {
          res.status(500).send('Request failed');
        }
      })
    } else {
      db.updateInstanceStatus(instanceStatus, req.params.username);
      res.status(500).send(instanceStatus);
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

module.exports = router;
