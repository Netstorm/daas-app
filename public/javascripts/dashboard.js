/** Setup button states after page load */
$(document).ready(function () {
	$("#error").hide()
	var status = $('#instanceStatus').text();
	var instanceId = $('#instanceId').text();
	if (!instanceId) {
		$('#create-btn').attr("disabled", false);
		$('#shutdown-btn').attr("disabled", true);
	}
	if (status == 'Running') {
		$('#create-btn').attr("disabled", true);
	}
});

/** Stop Instance */
$('#shutdown-btn').on('click', function (event) {
	event.preventDefault();
	event.stopPropagation();
	$('#shutdown-btn').attr("disabled", true);
	$('#loader').show();
	$.ajax({
		url: $(this).attr("data-url"),
		success: function (response) {
			$('#instanceStatus').text('Shutting Down...');
			$('#error').hide();
			setTimeout(function () {
				$('#loader').hide();
				deleteInstance();
			}, 40000);
		},
		error: function (err) {
			$('#loader').hide();
			$('#error').text('Failed to shutdown, please try again');
			$('#error').show();
			$('#shutdown-btn').attr("disabled", false);
		}
	});
});

/** Start or Create Instance */
$("#create-btn").on("click", function () {
	event.preventDefault();
	event.stopPropagation();
	$('#loader').show();
	$('#create-btn').attr("disabled", true);
	$('#delete-btn').attr("disabled", true);
	var instanceId = $('#instanceId').text();
	var username = $('#username').attr("data-username");
	if (instanceId) {
		startInstance(username);
	} else {
		createInstance(username);
	}

});

/** Delete Instance */
function deleteInstance() {
	$('#instanceStatus').text('Deleting...');
	var username = $('#username').attr("data-username");
	var instanceId = $('#instanceId').text();
	var ipAllocationId = $('#ipAllocationId').text();
	var url = `/users/${username}/deleteInstance`;
	$.ajax({
		url: url,
		method: 'POST',
		data: {
			instanceId: instanceId,
			ipAllocationId: ipAllocationId
		},
		success: function (response) {
			setTimeout(function () {
				$('#loader').hide();
				location.reload();
			}, 20000);
		},
		error: function (err) {
			$('#loader').hide();
			$('#instanceStatus').text(err.responseText);
			$('#error').text('Failed to delete, please try again');
			$('#error').show();
			$('#shutdown-btn').attr("disabled", false);
		}
	});
};

function startInstance(username) {
	$('#instanceStatus').text('Requesting start');
	$.ajax({
		url: `/users/${username}/startInstance`,
		method: 'PUT',
		success: function (response) {
			if (response == "Running") {
				$('#instanceStatus').text('Starting Windows...');
				setTimeout(function () {
					$('#instanceStatus').text('Initialising, will take few minutes...');
				}, 60000);
				setTimeout(function () {
					$('#instanceStatus').text('Setting up profile...');
				}, 80000);
				setTimeout(function () {
					$('#instanceStatus').text('Done');
					$('#loader').hide();
					location.reload();
				}, 80000);
			} else {
				$('#instanceStatus').text(response);
				$('#loader').hide();
			}
		},
		error: function (err) {
			$('#loader').hide();
			$('#instanceStatus').text('Failed');
			$('#error').text(err.responseText);
			$('#error').show();
			$('#delete-btn').attr("disabled", false);
			$('#create-btn').attr("disabled", false);
		}
	});
}

function createInstance(username) {
	$('#instanceStatus').text('Creating new Windows PC...');
	return $.ajax({
		url: `/users/${username}/createInstance`,
		method: 'POST',
		success: function (response) {
			if (response == "Stopped") {
				$('#instanceStatus').text('Created');
				startInstance(username);
			} else {
				$('#instanceStatus').text(response);
				setTimeout(function () {
					$('#loader').hide();
					location.reload();
				}, 10000)
			}
		},
		error: function (err) {
			$('#loader').hide();
			$('#instanceStatus').text('Failed');
			$('#error').text(err.responseText);
			$('#error').show();
			$('#delete-btn').attr("disabled", false);
			$('#create-btn').attr("disabled", false);
		}
	});
}