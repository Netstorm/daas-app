$(document).ready(function () {
	$("#error").hide();
	$(".usage").each(function () {
		var secs = parseInt($(this).attr("data-usage"))
		$(this).html(hhmmss(secs));
	});
	$(".this-week").each(function () {
		var secs = parseInt($(this).attr("data-usage"))
		$(this).html(hhmmss(secs));
	});
	var d = new Date();
	var thisMonth = d.getMonth() + 1;
	$.ajax({
		url: `/report/month/${thisMonth}`
	}).done(function (data) {
		data.forEach(function (user) {
			$(`.this-month#${user.username}`).html(hhmmss(user.usageInSeconds));
		});
	}).fail(function (jqXHR, textStatus, errorThrown) {
		$('#error').text(errorThrown);
		$('#error').show();
	})
});

$("select.filter").change(function () {
	var selected = $(this).children("option:selected").val();
	if (selected == 'last-week') {
		var thisWeek = moment().isoWeek();
		var lastWeek = (thisWeek != 1) ? thisWeek - 1 : 52;
		fetchWeeklyReport(lastWeek);
	} else {
		fetchMonthlyReport(selected);
	}
});

function fetchWeeklyReport(filter) {
	$.ajax({
		url: `/report/week/${filter}`
	}).done(function (data) {
		data.forEach(function (user) {
			// $(`.username#${user.username}`).html(user.username);
			$(`.usage#${user.username}`).html(hhmmss(user.usageInSeconds));
			// $(`.last-used#${user.username}`).html(user.lastStopTime);
		});

	}).fail(function (jqXHR, textStatus, errorThrown) {
		$('#error').text(errorThrown);
		$('#error').show();
	})
}

function fetchMonthlyReport(filter) {
	$.ajax({
		url: `/report/month/${filter}`
	}).done(function (data) {
		data.forEach(function (user) {
			// $(`.username#${user.username}`).html(user.username);
			$(`.usage#${user.username}`).html(hhmmss(user.usageInSeconds));
			// $(`.last-used#${user.username}`).html(user.lastStopTime);
		});

	}).fail(function (jqXHR, textStatus, errorThrown) {
		$('#error').text(errorThrown);
		$('#error').show();
	})
}

function hhmmss(secs) {
	function pad(num) {
		return ("0" + num).slice(-2);
	}
	var minutes = Math.floor(secs / 60);
	secs = secs % 60;
	var hours = Math.floor(minutes / 60)
	minutes = minutes % 60;
	return pad(hours) + ":" + pad(minutes) + ":" + pad(secs);
}