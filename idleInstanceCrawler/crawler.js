const db = require('./db');
const rds = require('./remote-desktop-service');
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
          if (instanceslastChecked.includes(instanceId)) {
            rds.deleteInstance(instanceId).then(deleted => {
              if (deleted) {
                instanceslastChecked = instanceslastChecked.filter(item => item !== instanceId);
                db.getUsername(instanceId).then(result => {
                  if (result && result.length > 0) {
                    db.updateOnDeleteInstance(null, null, null, null, result[0].username);
                  }
                }).catch(err => {
                  console.error(err);
                });
              }
            });
          } else {
            instanceslastChecked.push(instanceId);
            console.log(`array push ${JSON.stringify(instanceslastChecked)}`);
          }
        });
        resolve();
      } else {
        console.log('No stopped instances');
        resolve();
      }
    })
  })
}