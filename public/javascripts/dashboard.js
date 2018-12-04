/** Setup button states after page load */
$(document).ready(function () {
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
});

/** Start instance and change status */
$('#start-btn').on('click', function (event) {
	event.preventDefault();
	event.stopPropagation();
	$('#start-btn').attr("disabled", true);
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
			$('#instanceStatus').text('Failed to start, try again');
		}
	});
});

/** Stop instance and change status */
$('#shutdown-btn').on('click', function (event) {
	event.preventDefault();
	event.stopPropagation();
	$('#shutdown-btn').attr("disabled", true);
	$('#instanceStatus').text('Shutting Down');
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
			$('#instanceStatus').text('Request failed, try again');
			$('#loader').hide();
		}
	});
});

/** Create Instance */
$("#create-btn").on("click", function () {
	event.preventDefault();
	event.stopPropagation();
	$('#loader').show();
	$.ajax({
		url: $(this).attr("data-url"),
		success: function (response) {
			$('#loader').hide();
			location.reload();
		},
		error: function (err) {
			$('#loader').hide();
			$('#instanceStatus').text('Request failed, try again');
		}
	});
});

/** Delete Instance */
$("#delete-btn").on("click", function () {
	event.preventDefault();
	event.stopPropagation();
	$('#loader').show();
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
			console.log('ERROR: ', err.statusText);
			$('#loader').hide();
			$('#instanceStatus').text('Failed, try again');
		}
	});
});