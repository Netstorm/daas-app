var express = require('express');
var router = express.Router();
var db = require('../services/db');
var moment = require('moment');

router.get('/', (req, res, next) => {
  const PAGE = 'Report';
  var thisWeek = moment().isoWeek();
  var lastWeek = (thisWeek != 1) ? thisWeek - 1 : 52;
  var vdiusers = [];
  getWeeklyReport(lastWeek).then(users => {
    db.getUsageForWeek(thisWeek).then(results => {
      users.map(user => {
        results.forEach(element => {
          if (user.username == element.username) {
            var usageThisWeek = element.usageInSeconds;
            vdiusers.push({ ...user, usageThisWeek })
          }
        });
      })
      res.render('report', { page: PAGE, menuId: 'report', vdiusers: vdiusers });
    })
  });
});

router.get('/week/:filter', (req, res, next) => {
  db.getUsageForWeek(parseInt(req.params.filter)).then(data => {
    res.send(data);
  }).catch(err => {
    console.error(err);
  });
});

router.get('/month/:filter', (req, res, next) => {
  db.getUsageForMonth(parseInt(req.params.filter)).then(data => {
    res.send(data);
  });
});

function getWeeklyReport(weekNumber) {
  return new Promise((resolve, reject) => {
    var promises = [];
    db.getUsageForWeek(parseInt(weekNumber)).then(results => {
      vdiusers = results.map(user => {
        promises.push(db.getLastStopTime(user.username).then(lastStopTime => {
          user = { ...user, ...lastStopTime[0] };
          return user;
        }));
      });
      Promise.all(promises).then(result => {
        resolve(result);
      }).catch(err => {
        console.error(err)
      });
    })
  })
}

function getMonthlyReport(month) {
  return new Promise((resolve, reject) => {
    var promises = [];
    db.getUsageForMonth(parseInt(month)).then(results => {
      vdiusers = results.map(user => {
        promises.push(db.getLastStopTime(user.username).then(lastStopTime => {
          user = { ...user, ...lastStopTime[0] };
          return user;
        }));
      });
      Promise.all(promises).then(result => {
        resolve(result);
      }).catch(err => {
        console.error(err)
      });
    })
  })
}

module.exports = router;