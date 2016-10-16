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

// Create an asynchronous reference to the Firebase Real-Time Database.
var dbRef = firebase.database();

// Create application object.
// All the code is inside an Immediately Implemented Function Expression.
var hyloAppObject = (function() {

  // PUBLIC METHOD
  function setupListeners() {

    // Whenever the Activities collection in Firebase changes, re-load the full list of
    // activities into the view, and attach click event listeners for each list item.
    // (This event listener is triggered whenever a value in the activities collection is changed.)
    dbRef.ref('activities').on('value', function(results) {
      var $actList = $('.activity-list');
      var allActivities = results.val();
      populateListView($actList, allActivities);
    });


    // Handle ANY submit-form event:
    $('form').submit(function(e) {
      // Get a pointer to the form that was just submitted.
      var $frm = $(e.target);
      // Locate the form's associated object in the databse, OR create it if it doesn't exist,
      // and get a reference to it.
      var dbobjRef = dbRef.ref($frm.data('dbobj-name'));
      var tempObj = {};

      // TODO: put UPDATE code in here...
      // dbobjRef.update({
      //   someKey: someval
      // });

      $frm.find('.form-control').each(function(index) {
        tempObj[$(this).data('field')] = $(this).val();
        $(this).val('');
      });
      dbobjRef.push(tempObj);
      e.preventDefault();
    });

  }


  // PRIVATE METHODS

  function populateListView($listView, listData) {
    var dbobjName = $listView.data('dbobj-name');
    $listView.empty();
    $listView.data('snapshot', listData);

    for (var itemID in listData) {
      var name = listData[itemID].name;
      var $li = $('<li>');

      $li.data('id', itemID);
      $li.html(name);

      var $deleteElement = $('<i class="fa fa-trash pull-right delete"></i>');
      $deleteElement.on('click', deleteItem);
      $li.append($deleteElement);

      var $editElement = $('<i class="fa fa-pencil-square-o pull-right edit"></i>');
      $editElement.on('click', populateFormWithItem);
      $li.append($editElement);

      $listView.append($li);
    }
  }

  function deleteItem(e) {
    var id = $(e.target).parent().data('id');
    var dbobjName = $(e.target).parent().parent().data('dbobj-name');
    var dbobjItemRef = dbRef.ref(dbobjName).child(id);
    dbobjItemRef.remove();
  }

  function populateFormWithItem(e) {
    var id = $(e.target).parent().data('id');
    var selectedObj = $(e.target).parent().parent().data('snapshot')[id];
    var dbobjName = $(e.target).parent().parent().data('dbobj-name');
    var frm = `form[data-dbobj-name='${dbobjName}']`
    // Load the data into the form
    for (var prop in selectedObj) {
      $(`${frm} .form-control[data-field='${prop}']`).val(selectedObj[prop]);
    }
  }

  return {
    setupListeners: setupListeners
  };

})(); // END OF hyloAppObject

// When DOM is fully loaded, execute the app object's single public method
// to attach all functionality to the DOM via event listeners.
$(document).ready(function() {
  hyloAppObject.setupListeners();
});
