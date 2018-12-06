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

router.get('/:username/:instanceId/startInstance', authenticationMiddleware(), function (req, res, next) {
  rds.startInstance(req.params.instanceId).then(result => {
    if (result && result.RequestId) {
      var lastStartTime = moment().toISOString();
      db.updateStatusAndStartTime('Running', lastStartTime, req.params.username);
      res.json({
        started: true
      });
    } else {
      res.status(500).send();
    }
  });
});

router.get('/:username/:instanceId/stopInstance', authenticationMiddleware(), function (req, res, next) {
  rds.stopInstance(req.params.instanceId).then(result => {
    if (result && result.RequestId) {
      db.updateInstanceStatus('Stopped', req.params.username);
      res.json({
        stopped: true
      });
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
      db.updateInstanceStatus('Stopped', req.params.username);
      res.json({
        stopped: true
      });
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
  var instanceId = null;
  var instanceIP = null;
  var ipAllocationId = null;
  rds.createInstance(username).then(result => {
    if (result) {
      instanceId = result.InstanceId;
      rds.getAvailableEipAddresses().then(result => {
        if (result) {
          instanceIP = result[0].IpAddress;
          ipAllocationId = result[0].AllocationId;
          setTimeout(function () {
            rds.associateEipAddress(instanceId, ipAllocationId).then((result) => {
              if (result) {
                db.saveInstanceDetails(instanceId, instanceIP, ipAllocationId, 'Stopped', username).then(() => {
                  res.status(200).send();
                })
              } else {
                db.saveInstanceDetails(instanceId, null, null, 'Stopped', username).then(() => {
                  res.status(200).send();
                })
              }
            })
          }, 10000)
        } else {
          instanceIP = 'Unavailable, contact IT services'
          db.saveInstanceDetails(instanceId, instanceIP, null, 'Stopped', username).then(() => {
            res.status(200).send();
          })
        }
      })
    } else {
      res.status(500).send();
    }
  })
})

/** Delete Instance */
router.post('/:username/deleteInstance', authenticationMiddleware(), function (req, res, next) {
  rds.getInstanceStatus(req.body.instanceId).then((status) => {
    if (status && status == 'Stopped') {
      rds.deleteInstance(req.body.instanceId).then(result => {
        if (result) {
          db.saveInstanceDetails(null, null, null, null, req.params.username).then(() => {
            res.status(200).send()
          })
        } else {
          res.status(500).send()
        }
      })
    } else {
      res.status(200).send('Could not delete, please try again');
    }
  })
})


// router.get('/:username/getUsage', function (req, res) {
//   db.getLastStartTimeAndUsage(req.params.username).then((result) => {
//     if (result) {
//       console.log('Result[0]: ', result[0])
//       console.log('last: ', result[0].lastStartTime)
//       var stopTime = moment().toISOString();
//       var lastStartTime = moment(result[0].lastStartTime)
//       console.log('lastToDate: ', lastStartTime)
//       var runningTime = lastStartTime.diff(stopTime, 'secs');
//       console.log('running: ', runningTime);
//       res.json({
//         data: result
//       });
//     } else {
//       res.json({
//         error: result
//       })
//     }
//   })
// })

function authenticationMiddleware() {
  return (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  }
}

module.exports = router;
