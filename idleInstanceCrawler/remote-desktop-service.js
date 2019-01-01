var RPCClient = require('@alicloud/pop-core').RPCClient;
var _ = require('lodash');
// Account config and request options
var client = new RPCClient({
    accessKeyId: process.env.ALICLOUD_ACCESS_KEY_ID,
    secretAccessKey: process.env.ALICLOUD_SECRET_ACCESS_KEY,
    endpoint: process.env.ALICLOUD_ENDPOINT,
    apiVersion: '2014-05-26',
    opts: {
        timeout: 8000
    }
});

const getStoppedInstances = async () => {
    try {
        var result = await client.request('DescribeInstances', { 'RegionId': process.env.REGION_ID });
        var instances = result.Instances.Instance;
        var stoppedInstances = _.filter(instances, (record) => {
            if (record.ImageId == process.env.IMAGE_ID && record.Status == 'Stopped') {
                return record;
            }
        });
        var data = [];
        if (stoppedInstances.length > 0) {
            stoppedInstances.forEach(instance => {
                var instanceId = instance.InstanceId;
                data.push(instanceId);
            });
            console.log(`getstoppedInstances: ${JSON.stringify(data)}`)
        }
        return data;
    } catch (err) {
        console.error('getstoppedInstances:', err);
    }

}

function deleteInstance(instanceId) {
    return new Promise((resolve, reject) => {
        client.request('DeleteInstance', { 'InstanceId': instanceId }).then((result) => {
            if (result && result.RequestId) {
                console.log(`deleteInstance: ${instanceId}`);
                resolve(true);
            }
            else {
                reject('Failed to delete');
            }
        }).catch(err => {
            console.error(`deleteInstance: ${err}`);
            return false;
        });
    });
}

module.exports = { getStoppedInstances, deleteInstance }