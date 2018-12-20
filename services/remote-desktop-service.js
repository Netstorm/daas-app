var RPCClient = require('@alicloud/pop-core').RPCClient;
var _ = require('lodash');
var joinDomain = require('./join-domain');

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

const describeInstances = async () => {
	try {
		var result = await client.request('DescribeInstances', { 'RegionId': process.env.REGION_ID });
		console.log('describeInstances:', JSON.stringify(result));
		return result;
	} catch (err) {
		console.error('describeInstances:', err);
	}

}

const getInstanceStatus = async (instanceId) => {
	try {
		var result = await client.request('DescribeInstanceStatus', { 'RegionId': process.env.REGION_ID });
		var instanceStatuses = result.InstanceStatuses.InstanceStatus;
		var statusRecord = _.filter(instanceStatuses, (record) => {
			if (record.InstanceId == instanceId) {
				return record;
			}
		});
		console.log(`getInstanceStatus: ${JSON.stringify(statusRecord[0].Status)}`);
		return statusRecord[0].Status;
	} catch (err) {
		console.error('getInstanceStatus:', err);
		return false;
	}

}

const startInstance = async (instanceId) => {
	try {
		var result = await client.request('StartInstance', { 'InstanceId': instanceId });
		if (result && result.RequestId) {
			console.log(`startInstance: success`);
			return result;
		}
	} catch (err) {
		console.log('startInstance: ', err);
	}
}

const stopInstance = async (instanceId) => {
	try {
		var result = await client.request('StopInstance', { 'InstanceId': instanceId });
		if (result && result.RequestId) {
			console.log(`stopInstance: success`);
			return result;
		}
	} catch (err) {
		console.log('stopInstance: ', err);
	}
}

function createInstance(username) {
	var params = {
		RegionId: process.env.REGION_ID,
		ImageId: process.env.IMAGE_ID,
		InstanceType: process.env.INSTANCE_TYPE,
		InstanceName: `WKS-${username}`,
		Hostname: `WKS-${username}`,
		UserData: Buffer.from(joinDomain.userdata).toString('base64'),
		InstanceChargeType: process.env.INSTANCE_CHARGE_TYPE,
		SecurityGroupId: process.env.SECURITY_GROUP_ID,
		VSwitchId: process.env.VSWITCH_ID
	}
	var opts = { timeout: 15000 }
	return new Promise((resolve, reject) => {
		client.request('CreateInstance', params, opts).then(result => {
			if (result && result.RequestId) {
				console.log(`createInstance: ${JSON.stringify(result.InstanceId)}`);
				resolve(result);
			} else {
				reject();
			}
		}).catch(err => {
			console.error('createInstance: ', err);
			resolve(false);
		});
	});
}

function deleteInstance(instanceId) {
	return new Promise((resolve, reject) => {
		client.request('DeleteInstance', { 'InstanceId': instanceId }).then((result) => {
			if (result && result.RequestId) {
				console.log(`deleteInstance: success`);
				resolve(true);
			}
			else {
				resolve(false);
			}
		}).catch(err => {
			console.error(`deleteInstance: ${err}`);
			resolve(false);
		});
	});
}

function allocateEipAddress() {
	var params = {
		RegionId: process.env.REGION_ID
	}
	return new Promise((resolve, reject) => {
		client.request('AllocateEipAddress', params).then(result => {
			if (result && result.RequestId) {
				console.log(`allocateEipAddress: ${JSON.stringify(result)}`);
				resolve(result);
			} else {
				resolve(false);
			}
		}).catch(err => {
			console.error(`allocateEipAddress: ${err}`);
			resolve(false);
		});
	});
}

function getAvailableEipAddresses() {
	var params = {
		RegionId: process.env.REGION_ID,
		Status: 'Available'
	}
	return new Promise((resolve, reject) => {
		client.request('DescribeEipAddresses', params).then(result => {
			if (result && result.EipAddresses.EipAddress.length > 0) {
				resolve(result.EipAddresses.EipAddress);
			} else {
				resolve(false);
			}
		}).catch(err => {
			console.error(`describeEipAddresses: ${err}`);
			resolve(false);
		});
	});
}

const bindIpAddress = async (instanceId, allocationId) => {
	try {
		var params = {
			RegionId: process.env.REGION_ID,
			AllocationId: allocationId,
			InstanceId: instanceId
		}
		var result = await client.request('AssociateEipAddress', params);
		if (result && result.RequestId) {
			console.log(`bindIpAddress: IP Binded`);
			return result;
		}
	} catch (err) {
		console.error(`bindIpAddress: ${err}`);
		return false;
	}
}

const unbindIpAddress = async (instanceId, allocationId) => {
	try {
		var params = {
			AllocationId: allocationId,
			InstanceId: instanceId
		}
		var result = await client.request('UnassociateEipAddress', params);
		if (result && result.RequestId) {
			console.log(`unbindIpAddress: IP Unbinded`);
			return result;
		}
	} catch (err) {
		console.error(`unbindIpAddress: ${err}`);
		return false;
	}
}

const releaseEipAddress = async (allocationId) => {
	try {
		var params = {
			AllocationId: allocationId
		}
		var result = await client.request('ReleaseEipAddress', params);
		if (result && result.RequestId) {
			console.log(`releaseEipAddress: ${JSON.stringify(result)}`);
			return result;
		}
	} catch (err) {
		console.error(`releaseEipAddress: ${err}`);
		return false;
	}
}

module.exports = {
	describeInstances, getInstanceStatus, startInstance, stopInstance, createInstance,
	deleteInstance, allocateEipAddress, bindIpAddress, unbindIpAddress, releaseEipAddress, getAvailableEipAddresses
};