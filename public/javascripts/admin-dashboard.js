
/** Setup button states after page load */
$(document).ready(function () {
  $("#error").hide();
  $(".instanceId").each(function () {
    if ($(this).text()) {
      $(this).closest("tr").find("[id^=create]").attr("disabled", true);
    }
    else {
      $(this).closest("tr").find("[id^=release]").attr("disabled", true);
      $(this).closest("tr").find("[id^=stop]").attr("disabled", true);
    }
  });
  $(".status").each(function () {
    if ($(this).text() !== 'Stopped') {
      $(this).closest("tr").find("[id^=release]").attr("disabled", true);
      $(this).closest("tr").find("[id^=unbind]").attr("disabled", true);
    }
    if ($(this).text() == 'Stopped') {
      $(this).closest("tr").find("[id^=stop]").attr("disabled", true);
    }
  });
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
      return pad(hours) + ":" + pad(minutes) + ":" + pad(secs);
    }
    $(this).html(hhmmss(secs));
  })
});

/** Sync users and reload */
// $('#sync-btn').on('click', function (event) {
//   event.preventDefault();
//   event.stopPropagation();
//   $('#sync-btn').attr("disabled", true);
//   $('#loader').show();
//   $.ajax({
//     url: $(this).attr("data-url"),

//   }).done(function (synced) {
//     if (synced) {
//       console.log('Syncing: ', synced);
//       location.reload();
//     } else {
//       console.error('Failed to sync');
//     }
//     $('#loader').hide();
//   }).fail(function (err) {
//     console.error(err);
//   });
// });

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
    deleteInstance(username, instanceId);
  }
  else if ($(this).hasClass('stop-btn')) {
    stopInstance(username, instanceId);
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

/** Delete Instance */
function deleteInstance(username, instanceId) {
  $('#instanceStatus').text('Deleting...');
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
      }, 10000);
    },
    error: function (err) {
      $('#loader').hide();
      $('#error').text('Failed to delete, please try again');
      $('#error').show();
    }
  });
};

function stopInstance(username, instanceId) {
  $.ajax({
    url: `/users/${username}/${instanceId}/stopInstance`,
    success: function (response) {
      console.log(response);
      setTimeout(() => {
        $('#loader').hide();
        location.reload();
      }, 40000);
    },
    error: function (err) {
      console.log('ERROR: ', err);
      $('#loader').hide();
      $('#error').text('Failed to stop instance, please try again');
      $('#error').show();
    }
  });
}
