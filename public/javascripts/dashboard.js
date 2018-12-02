/** Setup button states after page load */
$(document).ready(function () {
	var status = $('#instanceStatus').text();
	console.log(status);
	if (status == 'Stopped' || !status) {
		$('#shutdown-btn').attr("disabled", true);
	} if (status == 'Running'  || !status) {
		$('#start-btn').attr("disabled", true);
	}
});

/** Start instance and change status */
$('#start-btn').on('click', function (event) {
	event.preventDefault();
	event.stopPropagation();
	$.ajax({
		url: $(this).attr("data-url")
	}).done(function (data) {
		console.log('Start: ', data);
		if (data.started) {
			$('#start-btn').attr("disabled", true);
			$('#loader').show();
			$('#instanceStatus').text('Starting Windows');
			setTimeout(function () {
				$('#shutdown-btn').attr("disabled", false);
				$('#instanceStatus').text('Running');
				$('#loader').hide();
			}, 8000);
		} else {
			$('#instanceStatus').text('Failed to start, try again');
		}
	}).fail(function (err) {
		console.log(err);
	});
});

/** Stop instance and change status */
$('#shutdown-btn').on('click', function (event) {
	event.preventDefault();
	event.stopPropagation();
	$.ajax({
		url: $(this).attr("data-url")
	}).done(function (data) {
		console.log('shutdown: ', data);
		if (data.stopped) {
			$('#shutdown-btn').attr("disabled", true);
			$('#instanceStatus').text('Shutting Down');
			$('#loader').show();
			setTimeout(function () {
				$('#start-btn').attr("disabled", false);
				$('#instanceStatus').text('Stopped');
				$('#loader').hide();
			}, 8000);
		} else {
			$('#instanceStatus').text('Failed to shutdown, try again');
		}
	}).fail(function (err) {
		console.log(err);
	});
});
