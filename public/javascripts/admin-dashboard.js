
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
    var secs = parseInt($(this).attr("data-usage"))
    function pad(num) {
      return ("0" + num).slice(-2);
    }
    function hhmmss(secs) {
      var minutes = Math.floor(secs / 60);
      secs = secs % 60;
      var hours = Math.floor(minutes / 60)
      minutes = minutes % 60;
      return pad(hours)+":"+pad(minutes)+":"+pad(secs);
    }
    $(this).html(hhmmss(secs));
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