var RPCClient = require('@alicloud/pop-core').RPCClient;
var client = new RPCClient({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  endpoint: process.env.ENDPOINT,
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

const startInstance = async() => {
    try {
        var result = await client.request('StartInstance', {'instanceId': ''});
    } catch(err) {

    }
}

const stopInstance = async() => {
    try {
        var result = await client.request('StopInstance', {'instanceId': ''});
    } catch(err) {

    }
}

const createInstance = async() => {
    try {
        var result = await client.request('CreateInstance');
    } catch(err) {

    }
}

module.exports = { describeInstances };