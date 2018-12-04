
/** Setup button states after page load */
$(document).ready(function () {
  $(".instanceId").each(function () {
    if ($(this).text()) {
      $(this).closest("tr").find("[id^=create]").attr("disabled", true);
    }
    else {
      $(this).closest("tr").find("[id^=release]").attr("disabled", true);
    }
  })
  $(".usage").each(function () {
    var seconds = parseInt($(this).attr("data-usage"))
    var minutes = moment.duration(seconds).minutes();
    var hours = Math.trunc(moment.duration(seconds).asHours());
    if (hours < 10) {
      hours = "0" + hours;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    $(this).html(hours + ':' + minutes + ':' + seconds);
  })
});

/** Sync users and reload */
$('#sync-btn').on('click', function (event) {
  event.preventDefault();
  event.stopPropagation();
  $('#sync-btn').attr("disabled", true);
  $('#loader').show();
  $.ajax({
    url: $(this).attr("data-url"),

  }).done(function (synced) {
    if (synced) {
      console.log('Syncing: ', synced);
      location.reload();
    } else {
      console.error('Failed to sync');
    }
    $('#loader').hide();
  }).fail(function (err) {
    console.error(err);
  });
});

/** Create, Release, Bind IP, Unbind IP */
$("button").on("click", function () {
  event.preventDefault();
  event.stopPropagation();
  var instanceId = $(this).closest("tr").find(".instanceId").text();
  var username = $(this).closest("tr").find(".username").text();
  console.log(username);
  console.log(instanceId);
  $('#loader').show();
  if ($(this).hasClass('release-btn')) {
    $.ajax({
      url: '/admin/releaseInstance',
      method: 'POST',
      data: {
        username: username,
        instanceId: instanceId
      },
      success: function (response) {
        console.log(response);
        $('#loader').hide();
        location.reload();
      },
      error: function (err) {
        console.log('ERROR: ', err);
        $('#loader').hide();
      }
    });
  }
  else if ($(this).hasClass('create-btn')) {
    $.ajax({
      url: '/admin/createInstance',
      method: 'POST',
      data: {
        username: username
      },
      success: function (response) {
        console.log(response);
        $(this).closest("tr").find(".instanceId").text(response.instanceId);
        $('#loader').hide();
        location.reload();
      },
      error: function (err) {
        console.log('ERROR: ', err);
        $('#loader').hide();
      }
    });
  }
  else if ($(this).hasClass('bind-btn')) {
    $.ajax({
      url: '/admin/bindip',
      method: 'PUT',
      data: {
        username: username,
        instanceId: instanceId
      },
      success: function (response) {
        console.log(response);
        $('#loader').hide();
        location.reload();
      },
      error: function (err) {
        console.log('ERROR: ', err);
        $('#loader').hide();
      }
    });
  }
  else if ($(this).hasClass('unbind-btn')) {
    $.ajax({
      url: '/admin/unbindip',
      method: 'PUT',
      data: {
        username: username,
        instanceId: instanceId
      },
      success: function (response) {
        console.log(response);
        $('#loader').hide();
        location.reload();
      },
      error: function (err) {
        console.log('ERROR: ', err);
        $('#loader').hide();
      }
    });
  }
});