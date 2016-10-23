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

// ******** CREATE APPLICATION OBJECT: hyloAppObject ********
// Almost all the code is inside an Immediately Implemented Function Expression.
var hyloAppObject = (function() {

  // ******** PUBLIC METHOD OF hyloAppObject: setupListeners ********
  function setupListeners() {

    // ***** EVENT LISTENER: CHANGE IN FIREBASE AT PATH "ACTIVITIES" ****
    // Whenever the Activities collection in Firebase changes, re-load the full list of
    // activities into the view, and attach click event listeners for each list item.
    // (This event listener is triggered whenever a value in the activities collection is changed.)
    dbRef.ref('activities').on('value', function(results) {
      var $actList = $('.activity-list');
      var allActivities = results.val();
      populateListView($actList, allActivities);
    });

    // **** EVENT LISTENER: FORM SUBMIT EVENT ****
    // Handle ANY submit-form event:
    $('form').submit(function(e) {
      // Get a pointer to the form that was just submitted.
      var $frm = $(e.target);

      // Locate the form's associated object in the databse, OR create it if it doesn't exist,
      // and get a reference to it.
      var dbobjName = $frm.data('dbobj-name');
      var dbobjRef = dbRef.ref(dbobjName);
      var tempObj = {};

      // Store the content of all the form fields in a temporary holding object.
      $frm.find('.form-control').each(function(index) {
        tempObj[$(this).data('field')] = $(this).val();
      });

      if (dbobjName === "activities") {
        tempObj.subsequence = $('.sortable-list').sortable('toArray');
      }

      // Update existing item or save new one
      var currItemID = $frm.data('current-item-id');
      if (currItemID != '') {
        let dbItemRef = dbobjRef.child(currItemID);
        dbItemRef.update(tempObj);
      } else {
        dbobjRef.push(tempObj);
      }

      // Clear the form and close it
      clearForm($frm);
      e.preventDefault();
    });

    // ***** EVENT LISTENER: CLICK EVENT FOR "CANCEL" BUTTON ON FORM *****
    $('.btn-cancel-form').on('click', function(e) {
      var $frm = $(e.target.parentNode);
      clearForm($frm);
    });

    // ***** EVENT LISTENER: CLICK EVENT FOR "CREATE NEW" BUTTON ON LIST VIEW *****
    $('.btn-show-form').on('click', function(e) {
      var $btn = $(e.target);
      var dbobjName = $btn.data('dbobj-name');
      showForm(dbobjName);
    });

    // ***** DOM ELEMENT MODIFIER: USE JQUERY UI TO MAKE A LIST SORTABLE
    $('.sortable-list').sortable();

  } // End of setupListeners


  // ******** PRIVATE METHODS OF hyloAppObject **********

  // ***** METHOD showForm: DISPLAY THE FORM *****
  function showForm(dbobjName) {
    $(`#${dbobjName}-form`).removeClass('hidden');
    $('#item-form').removeClass('hidden');
    $('.list-item').prop('disabled', false);
  }

  // ***** METHOD clearForm: CLEAR THE FORM, RESTORE IT TO "NEW ITEM" STATE, & HIDE IT *****
  function clearForm($frm) {
    $frm.find('.form-control').val('');
    $frm.data('current-item-id', '');
    $frm.find('.btn-primary').html('Save Item');
    $frm.find('.sortable-list').empty();
    $('#item-form').addClass('hidden');
    $frm.addClass('hidden');
    $('.list-item').prop('disabled', true);
  }

  // ***** METHOD populateListView *****
  function populateListView($listView, listData) {
    var dbobjName = $listView.data('dbobj-name');
    $listView.empty();
    $listView.data('snapshot', listData);

    for (var itemID in listData) {
      var name = listData[itemID].name;
      var $li = $('<div class="checkbox"><label>');

      var $checkboxElement = $('<input type="checkbox" value="" class="list-item" disabled>');
      $checkboxElement.on('click', checkItem);
      $li.append($checkboxElement);

      $li.data('id', itemID);
      $li.append(name);

      var $deleteElement = $('<i class="fa fa-trash pull-right delete"></i>');
      $deleteElement.on('click', deleteItem);
      $li.append($deleteElement);

      var $editElement = $('<i class="fa fa-pencil-square-o pull-right edit"></i>');
      $editElement.on('click', populateFormWithItem);
      $li.append($editElement);
      $li.append('</label></div>');

      $listView.append($li);
    }
  }

  function checkItem(e) {
    if (!$('#item-form').hasClass('hidden')) {
      var dbobjName = $('#item-form form').data('dbobj-name');
      console.log(`Just checked an item in ${dbobjName}.`);
      var $cbox = $(e.target);
      var id = $cbox.parent().data('id');
      // TODO: Find a better alternative to references like the one below,
      // because doing it this way ties it directly to the current layout/hierarchy
      // of the form -- which means that if I change the form, this code will break.
      // Switching to Angular or React is probably the best solution...
      if (dbobjName === "activities") {
        var listData = $('.activity-list').data('snapshot');
        if ($cbox.prop('checked')) {
          console.log(`You checked ${id}`);
          $('#sub-activities').append(`<li id="${id}" class="sub-activity">${listData[id].name}</li>`);
        } else {
          console.log(`You UNchecked ${id}`);
        }
      }
    }
  }

  // ***** METHOD deleteItem *****
  function deleteItem(e) {
    var id = $(e.target).parent().data('id');
    var dbobjName = $(e.target).parent().parent().data('dbobj-name');
    var dbobjItemRef = dbRef.ref(dbobjName).child(id);
    dbobjItemRef.remove();
  }

  // ***** METHOD populateFormWithItem *****
  function populateFormWithItem(e) {
    var id = $(e.target).parent().data('id');
    var listData = $(e.target).parent().parent().data('snapshot');
    var selectedObj = listData[id];
    var dbobjName = $(e.target).parent().parent().data('dbobj-name');
    var frm = `form[data-dbobj-name='${dbobjName}']`
    // Load the data into the form
    $(frm).data('current-item-id', id);
    $(`${frm} .btn-primary`).html('Update Item');
    for (var prop in selectedObj) {
      $(`${frm} .form-control[data-field='${prop}']`).val(selectedObj[prop]);
    }
    // If this is an Activity, load the sortable list
    if (dbobjName === "activities") {
      var $subsequence = $('.sortable-list');
      // var testArray = Object.keys(listData).slice(0,5);
      var arr = selectedObj.subsequence ? selectedObj.subsequence : [];
      for (const el of arr) {
        $subsequence.append(`<li id="${el}" class="sub-activity">${listData[el].name}</li>`);
      }
    }
    showForm(dbobjName);
  }

  return {
    setupListeners: setupListeners
  };

})();
// ******** END OF APPLICATION OBJECT: hyloAppObject ********

// ***** JQUERY DOCUMENT READY FUNCTION *****
// When DOM is fully loaded, execute the app object's single public method
// to attach all functionality to the DOM via event listeners.
$(document).ready(function() {
  hyloAppObject.setupListeners();
});
