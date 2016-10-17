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

      $frm.find('.form-control').each(function(index) {
        tempObj[$(this).data('field')] = $(this).val();
      });

      // Update existing item or save new one
      var currItemID = $frm.data('current-item-id');
      if (currItemID != '') {
        console.log($('.sortable-list').sortable('toArray'));
        let dbItemRef = dbobjRef.child(currItemID);
        dbItemRef.update(tempObj);
      } else {
        dbobjRef.push(tempObj);
        // Clear the form and close it
        clearForm($frm);
      }

      e.preventDefault();
    });


    $('.btn-cancel-form').on('click', function(e) {
      var $frm = $(e.target.parentNode);
      clearForm($frm);
    });

    $('.btn-show-form').on('click', function(e) {
      var $btn = $(e.target);
      var dbobjName = $btn.data('dbobj-name');
      showForm(dbobjName);
    });

    $('.sortable-list').sortable();

  } // End of setupListeners


  // PRIVATE METHODS

  function showForm(dbobjName) {
    $(`#${dbobjName}-form`).removeClass('hidden');
    $('#item-form').removeClass('hidden');
  }

  function clearForm($frm) {
    $frm.find('.form-control').val('');
    $frm.data('current-item-id', '');
    $frm.find('.btn-primary').html('Save Item');
    $frm.find('.sortable-list').empty();
    $('#item-form').addClass('hidden');
    $frm.addClass('hidden');
  }

  function populateListView($listView, listData) {
    var dbobjName = $listView.data('dbobj-name');
    $listView.empty();
    $listView.data('snapshot', listData);

    for (var itemID in listData) {
      var name = listData[itemID].name;
      var $li = $('<a href="#" class="list-group-item">');

      $li.data('id', itemID);
      $li.html(name);

      var $deleteElement = $('<i class="fa fa-trash pull-right delete"></i>');
      $deleteElement.on('click', deleteItem);
      $li.append($deleteElement);

      var $editElement = $('<i class="fa fa-pencil-square-o pull-right edit"></i>');
      $editElement.on('click', populateFormWithItem);
      $li.append($editElement);
      $li.append('</a>');

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
    var listData = $(e.target).parent().parent().data('snapshot');
    var selectedObj = listData[id];
    var dbobjName = $(e.target).parent().parent().data('dbobj-name');
    var frm = `form[data-dbobj-name='${dbobjName}']`
    // Load the data into the form
    $(frm).data('current-item-id', id);
    $(`${frm} .btn-primary`).html('Update Item');
    // console.log(`loaded item ${$(frm).data('current-item-id')} into form`);
    for (var prop in selectedObj) {
      $(`${frm} .form-control[data-field='${prop}']`).val(selectedObj[prop]);
    }
    // TEST SORTABLE LIST
    var $subsequence = $('.sortable-list');
    var testArray = Object.keys(listData).slice(0,5);
    for (const el of testArray) {
      $subsequence.append(`<li id="${el}" class="list-group-item">${listData[el].name}</li>`);
    }
    showForm(dbobjName);
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
