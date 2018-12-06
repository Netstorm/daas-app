/** Setup button states after page load */
$(document).ready(function () {
	$("#error").hide()
	var status = $('#instanceStatus').text();
	var instanceId = $('#instanceId').text();
	if (instanceId) {
		$('#create-btn').attr("disabled", true);
	}
	if (!instanceId) {
		$('#delete-btn').attr("disabled", true);
	}
	if (status == 'Stopped' || !status) {
		$('#shutdown-btn').attr("disabled", true);
	}
	if (status == 'Running' || !status) {
		$('#start-btn').attr("disabled", true);
		$('#delete-btn').attr("disabled", true);
	}
	var instanceIP = $('#instanceId').text();
	if (instanceId && !instanceIP) {
		$('#error').text('Failed to assign IP. Delete, then create new or contact IT Services');
		$('#error').show();
	}
});

/** Start instance and change status */
$('#start-btn').on('click', function (event) {
	event.preventDefault();
	event.stopPropagation();
	$('#start-btn').attr("disabled", true);
	$('#delete-btn').attr("disabled", true);
	$('#instanceStatus').text('Starting Windows');
	$('#loader').show();
	$.ajax({
		url: $(this).attr("data-url"),
		success: function (response) {
			setTimeout(function () {
				$('#shutdown-btn').attr("disabled", false);
				$('#delete-btn').attr("disabled", true);
				$('#instanceStatus').text('Running');
				$('#loader').hide();
			}, 10000);
		},
		error: function (err) {
			$('#loader').hide();
			$('#error').text('Failed to start,please try again');
			$('#error').show();
		}
	});
});

/** Stop instance and change status */
$('#shutdown-btn').on('click', function (event) {
	event.preventDefault();
	event.stopPropagation();
	$('#shutdown-btn').attr("disabled", true);
	// $('#instanceStatus').text('Shutting Down');
	$('#loader').show();
	$.ajax({
		url: $(this).attr("data-url"),
		success: function (response) {
			setTimeout(function () {
				$('#start-btn').attr("disabled", false);
				$('#delete-btn').attr("disabled", false);
				$('#instanceStatus').text('Stopped');
				$('#loader').hide();
			}, 10000);
		},
		error: function (err) {
			$('#loader').hide();
			$('#error').text('Failed to shutdown, please try again');
			$('#error').show();
		}
	});
});

/** Create Instance */
$("#create-btn").on("click", function () {
	event.preventDefault();
	event.stopPropagation();
	$('#loader').show();
	$('#create-btn').attr("disabled", true);
	$('#instanceStatus').text('Launching Windows...');
	$.ajax({
		url: $(this).attr("data-url"),
		success: function (response) {
			$('#instanceStatus').text('Initializing...');
			setTimeout(function () {
				$('#loader').hide();
				location.reload();
			}, 100000)

		},
		error: function (err) {
			$('#loader').hide();
			$('#instanceStatus').text('');
			$('#error').text('Failed to launch, please try again');
			$('#error').show();
			$('#create-btn').attr("disabled", false);
		}
	});
});

/** Delete Instance */
$("#delete-btn").on("click", function () {
	event.preventDefault();
	event.stopPropagation();
	$('#loader').show();
	$('#delete-btn').attr("disabled", true);
	$('#instanceStatus').text('Deleting...');
	setTimeout(() => {
		var instanceId = $('#instanceId').text();
		var ipAllocationId = $('#ipAllocationId').text();
		$.ajax({
			url: $(this).attr("data-url"),
			method: 'POST',
			data: {
				instanceId: instanceId,
				ipAllocationId: ipAllocationId
			},
			success: function (response) {
				console.log(response);
				$('#loader').hide();
				location.reload();
			},
			error: function (err) {
				$('#loader').hide();
				$('#error').text('Failed to delete, please try again');
				$('#error').show();
				$('#delete-btn').attr("disabled", false);
			}
		});
	}, 25000);
});