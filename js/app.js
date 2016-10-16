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
  hyloAppObject.setupListeners();
});

var hyloAppObject = (function() {

  // PUBLIC METHOD
  function setupListeners() {

    // Whenever the Activities collection in Firebase changes, re-load the full list of
    // activities into the view, and attach click event listeners for each list item.
    // (This event listener is triggered whenever a value in the activities collection is changed.)
    dbRef.ref('activities').on('value', function(results) {
      var $actList = $('.activity-list');
      var allActivities = results.val();
      // console.log(allActivities); // testing
      populateListView($actList, allActivities);
    });


    // Handle ANY submit-form event:
    $('form').submit(function(e) {
      // Get a pointer to the form that was just submitted.
      var $frm = $(e.target);
      // Locate the form's associated object in the databse, OR create it if it doesn't exist,
      // and get a reference to it.
      var dbobjRef = dbRef.ref($frm.data('dbobj'));
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

  function editItem(dbobj, id) {
    var dbobjItemRef = dbRef.ref(dbobj).child(id);
    console.log(`Edit link for ${dbobj} ${id} has been clicked on.`);
    // Load the data into the form
  }

  function deleteItem(dbobj, id) {
    var dbobjItemRef = dbRef.ref(dbobj).child(id);
    dbobjItemRef.remove();
  }

  function populateListView($listView, listData) {
    var dbobj = $listView.data('dbobj');
    $listView.empty();

    for (var itemID in listData) {
      // console.log(itemID);
      var name = listData[itemID].name;
      var $li = $('<li>');

      var $deleteElement = $('<i class="fa fa-trash pull-right delete"></i>');
      $deleteElement.on('click', function(e) {
        var id = $(e.target).parent().data('id');
        deleteItem(dbobj, id);
      });

      var $editElement = $('<i class="fa fa-pencil-square-o pull-right edit"></i>');
      $editElement.on('click', function(e) {
        var id = $(e.target).parent().data('id');
        editItem(dbobj, id);
      });

      $li.data('id', itemID);
      $li.html(name);
      $li.append($deleteElement);
      $li.append($editElement);
      $listView.append($li);
    }
  }

  return {
    setupListeners: setupListeners
  };

})();