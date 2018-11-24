var RPCClient = require('@alicloud/pop-core').RPCClient;
var _ = require('lodash');

var client = new RPCClient({
	accessKeyId: process.env.ALICLOUD_ACCESS_KEY_ID,
	secretAccessKey: process.env.ALICLOUD_SECRET_ACCESS_KEY,
	endpoint: process.env.ALICLOUD_ENDPOINT,
	apiVersion: '2014-05-26',
	opts: {
		timeout: 6000
	}
});

const REGION_ID = 'ap-southeast-2';

const describeInstances = async () => {
	try {
		var result = await client.request('DescribeInstances', { 'RegionId': REGION_ID });
		console.log('Instances:', JSON.stringify(result));
		return result;
	} catch (err) {
		console.log('ECS-error:', err);
	}

}

const describeInstanceStatus = async (instanceId) => {
	try {
		var result = await client.request('DescribeInstanceStatus', { 'RegionId': REGION_ID });
		var instanceStatuses = result.InstanceStatuses.InstanceStatus;
		var statusRecord = _.filter(instanceStatuses, (record) => {
			if (record.InstanceId == instanceId) {
				return record;
			}
		});
		console.log(`Status Record: ${JSON.stringify(statusRecord)}`);
		return statusRecord[0].Status;
	} catch (err) {
		console.log('ECS-error:', err);
	}

}

const startInstance = async (instanceId) => {
	try {
		var result = await client.request('StartInstance', { 'InstanceId': instanceId });
		console.log(`StartInstance: ${JSON.stringify(result)}`);
		return result;
	} catch (err) {
		console.log('Start instance error:', err);
	}
}

const stopInstance = async (instanceId) => {
	try {
		var result = await client.request('StopInstance', { 'InstanceId': instanceId });
		console.log(`StopInstance: ${JSON.stringify(result)}`);
		return result;
	} catch (err) {
		console.log('Stop instance error: ', err);
	}
}

const createInstance = async () => {
	try {
		var result = await client.request('CreateInstance');
	} catch (err) {

	}
}


module.exports = { describeInstances, describeInstanceStatus, startInstance, stopInstance };