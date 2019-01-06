/** Setup button states after page load */
$(document).ready(function () {
	$("#error").hide()
	var status = $('#instanceStatus').text();
	var instanceId = $('#instanceId').text();
	if (!instanceId) {
		$('#create-btn').attr("disabled", false);
		$('#shutdown-btn').attr("disabled", true);
		$('.copy-btn').attr("disabled", true);
	}
	if (status == 'Running') {
		$('#create-btn').attr("disabled", true);
	}
	var clipboard = new ClipboardJS('.copy-btn', {
		target: function () {
			return document.querySelector('#instanceIP');
		}
	});
	clipboard.on('success', function (e) {
		setTooltip(e.trigger, 'Copied!');
		hideTooltip(e.trigger);
	});
});

/** Stop Instance */
$('#shutdown-btn').on('click', function (event) {
	event.preventDefault();
	event.stopPropagation();
	$('#shutdown-btn').attr("disabled", true);
	$('#loader').show();
	var instanceId = $('#instanceId').text();
	$.ajax({
		url: $(this).attr("data-url"),
		success: function (response) {
			if (response == 'Stopped') {
				deleteInstance(instanceId);
			} else {
				$('#instanceStatus').text('Shutting Down, do not close the browser...');
				setTimeout(function () {
					deleteInstance(instanceId);
				}, 40000);
			}
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
	$('#error').hide();
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
function deleteInstance(instanceId) {
	$('#instanceStatus').text('Deleting...');
	var username = $('#username').attr("data-username");
	var url = `/users/${username}/deleteInstance`;
	$.ajax({
		url: url,
		method: 'POST',
		data: {
			instanceId: instanceId
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
				$('#instanceStatus').text('Starting Windows, 4 minutes to go...');
				setTimeout(function () {
					$('#instanceStatus').text('Initialising, 3 minutes remaining...');
					setTimeout(function () {
						$('#instanceStatus').text('Just a moment, setting up profile...');
						setTimeout(function () {
							$('#instanceStatus').text('Done');
							$('#loader').hide();
							location.reload();
						}, 90000);
					}, 90000);
				}, 60000);
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

// Tooltip
$('.copy-btn').tooltip({
	trigger: 'click',
	placement: 'bottom'
});

function setTooltip(btn, message) {
	$(btn).tooltip('hide')
		.attr('data-original-title', message)
		.tooltip('show');
}

function hideTooltip(btn) {
	setTimeout(function () {
		$(btn).tooltip('hide');
	}, 1000);
}