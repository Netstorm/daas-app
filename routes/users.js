var express = require('express');
var router = express.Router();
const db = require('../services/db');
var rds = require('../services/remote-desktop-service');

/* GET users listing. */
router.post('/', function (req, res, next) {
  db.saveUser(req.body.username, req.body.name).then(results => {
    res.json({ data: results });
  })

});

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
      db.updateInstanceStatus('Running', req.params.username);
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
router.get('/:username/createInstance', function (req, res, next) {
  var username = req.params.username;
  var instanceId = null;
  var instanceIP = null;
  var ipAllocationId = null;
  rds.createInstance(username).then(result => {
    if (result) {
      instanceId = result.InstanceId;
      rds.allocateEipAddress().then(result => {
        if (result) {
          instanceIP = result.EipAddress;
          ipAllocationId = result.AllocationId;
          rds.associateEipAddress(instanceId, ipAllocationId).then(() => {
            db.saveInstanceDetails(instanceId, instanceIP, ipAllocationId, 'Stopped', username).then(() => {
              res.json({
                instanceId: instanceId,
                ipCreated: true
              })
            });
          })
        } else {
          rds.getAvailableEipAddresses().then(result => {
            if (result) {
              instanceIP = result[0].IpAddress;
              ipAllocationId = result[0].AllocationId;
              rds.associateEipAddress(instanceId, ipAllocationId).then(() => {
                db.saveInstanceDetails(instanceId, instanceIP, ipAllocationId, 'Stopped', username).then(() => {
                  res.json({
                    instanceId: instanceId,
                    ipCreated: false
                  })
                })
              })
            } else {
              db.saveInstanceDetails(instanceId, null, null, 'Failed to assign IP', username).then(() => {
                res.json({
                  instanceId: instanceId,
                  ipCreated: false
                })
              })
            }
          })
        }
      })
    } else {
      res.status(500).send();
    }
  })
})

/** Delete Instance */
router.get('/:username/:instanceId/:ipAllocationId/deleteInstance', function (req, res, next) {
  rds.deleteInstance(req.params.instanceId).then(result => {
    if (result) {
      setTimeout(function () {
        rds.releaseEipAddress(req.params.ipAllocationId).then(() => {
          db.saveInstanceDetails(null, null, null, null, req.params.username).then(() => {
            dbUpdated = true;
            res.json({
              deleted: true
            })
          })
        })
      }, 10000)
    } else {
      res.status(500).send()
    }
  })
})


router.get('/:username/allocateEip', function (req, res) {
  rds.allocateEipAddress().then((result) => {
    if (result) {
      res.json({
        data: result
      });
    } else {
      res.json({
        error: result
      })
    }
  })
})

function authenticationMiddleware() {
  return (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  }
}

module.exports = router;
