/**
 * Copyright 2016 Michael N. Rubinstein. All Rights Reserved.
 * 
 * HYLOSPHERE
 */

// Initialize Firebase.
var config = {
  apiKey: "AIzaSyD8d4Q4mOI-RCh4zY7XfxUa_G4BfevAgOg",
  authDomain: "hylosphere.firebaseapp.com",
  databaseURL: "https://hylosphere.firebaseio.com",
  storageBucket: "hylosphere.appspot.com",
  messagingSenderId: "547167037002"
};
firebase.initializeApp(config);

var dbRef = firebase.database();

$(document).ready(function() {
  // Handle the submit form event:
  $('#activities-form').submit(function(event) {
    event.preventDefault();

    var newActivity = {};

    // Grab the new activity from the form, then blank out the fields
    newActivity.name = $('#new-act-name').val();
    newActivity.desc = $('#new-act-desc').val();
    newActivity.duration = $('#new-act-duration').val();

    $('#new-act-name').val('');
    $('#new-act-desc').val('');
    $('#new-act-duration').val('');

    // Locate the 'activities' collection in the databse, OR create it if it doesn't exist,
    // and get a reference to it.
    var actColRef = dbRef.ref('activities');

    // Add the new activity to the 'activities' collection with a quantity of 1.
    actColRef.push({
      name: newActivity.name,
      description: newActivity.desc,
      duration: newActivity.duration
    });
  });

  // Perform a READ (the R in CRUD) to refresh the list view
  actListViewObj.getActivities();
});

var actListViewObj = (function() {
  function getActivities() {
    // This event listener is triggered whenever a value in the activities collection is changed?
    dbRef.ref('activities').on('value', function(results) {
      var $actList = $('.activity-list');
      var activities = [];
      var allActivities = results.val();

      for (var a in allActivities) {
        var name = allActivities[a].name;
        var $activityListElement = $('<li>');
        var $deleteElement = $('<i class="fa fa-trash pull-right delete"></i>');

        // Handle clicks to DELETE an activity
        $deleteElement.on('click', function(e) {
          var id = $(e.target.parentNode).data('id');
          deleteActivity(id);
        });

        $activityListElement.attr('data-id', a);
        $activityListElement.html(name);
        $activityListElement.append($deleteElement);
        activities.push($activityListElement);
      }
      $actList.empty();
      for (var i in activities) {
        $actList.append(activities[i]);
      }
    });
  }

  function deleteActivity(id) {
    var actRef = dbRef.ref('activities').child(id);
    actRef.remove();
  }

  return {
    getActivities: getActivities
  };
})();