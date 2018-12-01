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

/** Release instance */
$("button").on("click", function () {
  event.preventDefault();
  event.stopPropagation();
  var instanceId = $(this).closest("tr").find(".instanceId").text();
  var username = $(this).closest("tr").find(".username").text();
  console.log(username);
  console.log(instanceId);
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
      },
      error: function (err) {
        console.log('ERROR: ', err);
      }
    })
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
      },
      error: function (err) {
        console.log('ERROR: ', err);
      }
    })
  }
})
