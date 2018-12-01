var express = require('express');
var router = express.Router();
const db = require('../services/db');
var rds = require('../services/remote-desktop-service');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('OK');
});

router.get('/:username', authenticationMiddleware(), function (req, res, next) {
  db.getUser(req.params.username).then((results) => {
    if (results.length > 0) {
      if (!results[0].instanceId) {
        results[0].instanceId = 'Unassigned';
        results[0].instanceIP = 'Unassigned';
        res.render('dashboard', { page: 'MyDesktop', menuId: 'dashboard', user: results[0], authenticated: true });
      } else {
        rds.getInstanceStatus(results[0].instanceId).then(status => {
          if (status) {
            results[0].instanceStatus = status;
          }
          res.render('dashboard', { page: 'MyDesktop', menuId: 'dashboard', user: results[0], authenticated: true });
        });
      }
    } else {
      res.send('No records found');
    }
  });
});

router.get('/:username/:instanceId/startInstance', authenticationMiddleware(), function (req, res, next) {
  rds.startInstance(req.params.instanceId).then(result => {
    if (result && result.RequestId) {
      db.updateInstanceStatus(req.params.username, 'Running');
      res.json({
        started: true
      });
    } else {
      res.json({
        started: false
      });
    }
  });
});

router.get('/:username/:instanceId/stopInstance', authenticationMiddleware(), function (req, res, next) {
  rds.stopInstance(req.params.instanceId).then(result => {
    if (result && result.RequestId) {
      db.updateInstanceStatus(req.params.username, 'Stopped');
      res.json({
        stopped: true
      });
    } else {
      res.json({
        stopped: false
      });
    }
  });
});

router.get('/:username/:instanceId/stopIdleInstance', authenticationMiddleware(), function (req, res, next) {
  console.log('Idle username: ', req.params.username);
  console.log('Idle instanceId: ', req.params.instanceId);
  res.json({
    stopped: true,
    status: res.statusCode
  });
});

router.get('/:username/getInstanceStatus', function (req, res, next) {
  rds.getInstanceStatus(user.instanceId).then(status => {
    if (status) {
      user.instanceStatus = status;
    }

    res.json({
      status: res.statusCode
    });
  });
});

function authenticationMiddleware() {
  return (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  }
}

module.exports = router;
