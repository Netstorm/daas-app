var RPCClient = require('@alicloud/pop-core').RPCClient;
var client = new RPCClient({
  accessKeyId: process.env.ALICLOUD_ACCESS_KEY_ID,
  secretAccessKey: process.env.ALICLOUD_SECRET_ACCESS_KEY,
  endpoint: process.env.ALICLOUD_ENDPOINT,
  apiVersion: '2014-05-26',
  opts: {
    timeout: 6000
  }
});

const describeInstances = async () => {
    try {
        var result = await client.request('DescribeInstances',{'regionId':'ap-southeast-2'});
        console.log('Instances:', JSON.stringify(result));
    } catch(err) {
        console.log('ECS-error:', err);
    }
    
}

const describeInstanceStatus = async () => {
    try {
        var result = await client.request('DescribeInstanceStatus',{'regionId':'ap-southeast-2'});
        console.log('InstanceStatus:', JSON.stringify(result));
    } catch(err) {
        console.log('ECS-error:', err);
    }
    
}

const startInstance = async(instanceId) => {
    try {
        var result = await client.request('StartInstance', {'instanceId': instanceId});
        console.log('Instance Starting...', result);
    } catch(err) {
        console.log('Start instance error:', err);
    }
}

const stopInstance = async(instanceId) => {
    try {
        var result = await client.request('StopInstance', {'instanceId': instanceId});
    } catch(err) {

    }
}

const createInstance = async() => {
    try {
        var result = await client.request('CreateInstance');
    } catch(err) {

    }
}



module.exports = { describeInstances, describeInstanceStatus, startInstance, stopInstance };