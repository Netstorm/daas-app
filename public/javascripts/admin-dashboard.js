
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
      $(this).closest("tr").find("[id^=bind]").attr("disabled", true);
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
  var self = $(this);
  $.blockUI({
    css: {
      border: 'none',
      padding: '15px',
      backgroundColor: '#000',
      '-webkit-border-radius': '10px',
      '-moz-border-radius': '10px',
      opacity: .5,
      color: '#fff'
    }
  });
  var instanceId = $(this).closest("tr").find(".instanceId").text();
  var username = $(this).closest("tr").find(".username").text();
  $(this).disabled = true;
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
        setTimeout(() => {
          $('#loader').hide();
          if (response.created) {
            self.closest("tr").children("td.instanceId").text(response.instanceId);
          }
          $.unblockUI();
          location.reload();
        }, 20000);

      },
      error: function (err) {
        $('#error').text(err.responseText);
        $('#error').show();
        $.unblockUI();
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
        $('#loader').hide();
        $.unblockUI();
        location.reload();
      },
      error: function (err) {
        $('#error').text(err.responseText);
        $('#error').show();
        $.unblockUI();
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
        $('#loader').hide();
        $.unblockUI();
        location.reload();
      },
      error: function (err) {
        $('#error').text(err.responseText);
        $('#error').show();
        $.unblockUI();
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
        $.unblockUI();
        location.reload();
      }, 10000);
    },
    error: function (err) {
      $('#loader').hide();
      $('#error').text('Failed to delete, please try again');
      $('#error').show();
      $.unblockUI();
    }
  });
};

function stopInstance(username, instanceId) {
  $.ajax({
    url: `/users/${username}/${instanceId}/stopInstance`,
    success: function (response) {
      setTimeout(() => {
        $('#loader').hide();
        $.unblockUI();
        location.reload();
      }, 40000);
    },
    error: function (err) {
      $('#loader').hide();
      $('#error').text('Failed to stop instance, please try again');
      $('#error').show();
      $.unblockUI();
    }
  });
}