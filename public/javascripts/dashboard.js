/** Setup button states after page load */
$(document).ready(function () {
	$("#error").hide()
	var status = $('#instanceStatus').text();
	var instanceId = $('#instanceId').text();
	if (!instanceId) {
		$('#create-btn').attr("disabled", false);
		$('#delete-btn').attr("disabled", true);
		$('#shutdown-btn').attr("disabled", true);
	}
	if (status == 'Stopped') {
		$('#shutdown-btn').attr("disabled", true);
	}
	if (status == 'Running') {
		$('#create-btn').attr("disabled", true);
		$('#delete-btn').attr("disabled", true);
	}
});

/** Start instance and change status */
// $('#start-btn').on('click', function (event) {
// 	event.preventDefault();
// 	event.stopPropagation();
// 	$('#start-btn').attr("disabled", true);
// 	$('#delete-btn').attr("disabled", true);
// 	$('#instanceStatus').text('Starting Windows');
// 	$('#loader').show();
// 	$.ajax({
// 		url: $(this).attr("data-url"),
// 		success: function (response) {
// 			setTimeout(function () {
// 				$('#shutdown-btn').attr("disabled", false);
// 				$('#delete-btn').attr("disabled", true);
// 				$('#instanceStatus').text('Running');
// 				$('#loader').hide();
// 			}, 10000);
// 		},
// 		error: function (err) {
// 			$('#loader').hide();
// 			$('#error').text('Failed to start,please try again');
// 			$('#error').show();
// 		}
// 	});
// });

/** Stop instance and change status */
$('#shutdown-btn').on('click', function (event) {
	event.preventDefault();
	event.stopPropagation();
	$('#create-btn').attr("disabled", true);
	$('#shutdown-btn').attr("disabled", true);
	$('#delete-btn').attr("disabled", true);
	$('#loader').show();
	$.ajax({
		url: $(this).attr("data-url"),
		success: function (response) {
			$('#instanceStatus').text('Shutting Down...');
			setTimeout(function () {
				$('#loader').hide();
				location.reload();
			}, 100000);
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
	$('#delete-btn').attr("disabled", true);
	$('#instanceStatus').text('Launching Windows...');
	$.ajax({
		url: $(this).attr("data-url"),
		success: function (response) {
			if (response == "Stopped") {
				$('#loader').hide();
				location.reload();
			} else {
				$('#instanceStatus').text('Initializing...');
				setTimeout(function () {
					$('#loader').hide();
					location.reload();
				}, 100000)
			}
		},
		error: function (err) {
			$('#loader').hide();
			$('#instanceStatus').text(err.responseText);
			$('#error').text('Failed to launch, please try again');
			$('#error').show();
			$('#delete-btn').attr("disabled", false);
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
	var url = $(this).attr("data-url");
	setTimeout(function () {
		var instanceId = $('#instanceId').text();
		var ipAllocationId = $('#ipAllocationId').text();
		$.ajax({
			url: url,
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
				$('#instanceStatus').text(err.responseText);
				$('#error').text('Failed to delete, please try again');
				$('#error').show();
				$('#delete-btn').attr("disabled", false);
			}
		});
	}, 25000);
});