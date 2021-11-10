// Chat service widget
// Author Cecilia Carboo by the designs of Martin Jonsson

// In order to work at its best:
// 1) this widget needs a function to provide a "providedUser" from the clients logged in user. For now providedUser is set as a global variable. When user i provided,
//    the input field for Signatur at write_msg_form has to be removed and getInput() has to be adapted for providedUser to be registered as "name".
// 2) addMSG(debug, obj) needs a review on how message id is set. Math.random is used now = does not garantee uniqueness.
//    One might want it set differently in a database.

//GLOBAL VARIABLES

//debug flag
var debug = true;
var providedUser = "Sotarn";

// Arrays to play with:
// var arrayNumbers = [1, 2, 3, 4];
// var arrayFruits = [
//   { id: 1, name: "äpple" },
//   { id: 2, name: "päron" },
//   { id: 3, name: "äpple" },
//   { id: 4, name: "äpple" },
//   { id: 5, name: "bappelsin" },
//   { id: 6, name: "jos" },
//   { id: 7, name: "äpple" },
// ];

// Wrapper for filter buttons and buttons
var outerWrapperDiv = document.getElementById("edit__outer_wrapper");
var editOverlayDiv = document.getElementById("edit_overlay");
var editWrapperDiv = document.getElementById("edit_wrapper");
var writeMsgWrapperDiv = document.getElementById(
  "write_msg_container__wrapper"
);
var newMsgBtn = document.getElementById("new_msg_btn");
var refreshBtn = document.getElementById("refresh_btn");
var filterBtn = document.getElementById("toggle_filters");
var subjectSelect = document.getElementById("filter__subject_select");
var userSelect = document.getElementById("filter__user_select");
var dayBtn = document.getElementById("filter__day_btn");
var weekBtn = document.getElementById("filter__week_btn");
var monthBtn = document.getElementById("filter__month_btn");
var returnBtn = document.getElementById("filter__all_btn");
var arrayFilterBtns = [dayBtn, weekBtn, monthBtn];

// Buttons used in update/edit functions
var editResetBtn = document.getElementById("edit_reset_btn");

// // Creating container to hold chat
var chatContainer = document.getElementById("chat_container");

// HELPER FUNCTIONS
// Shorthand for console.log()
function log(item) {
  console.log(item);
}

class MSGService {
  constructor(debug) {
    this.debug = debug;

    // Array to hold message JSONs
    this.array = [];

    // Array to hold all users that have written messages
    this.usersArray = [];

    // Array that holds subjects by which messages are categorized
    this.subjectArray = ["Värme", "Kyla", "Ventilation", "Allmänt"];

    // Init, starting up functions that are the base of the widget
    this.getArr(this.debug);
    this.renderFilters(this.debug);
    this.closeEditByOverlayClick(this.debug);
  }

  getArr(debug) {
    // Is used in init of MSGService
    // This function gets stored messages from API/database/cloud/whatever, for now: the browsers Local storage.
    // This function must be modified for other storage types.
    if (debug) log("Start getArr():");
    var keyName;
    var i;
    var result;

    // Array to work with before transferring its content to MSGService's property array.
    var _array = [];
    if (debug) console.log("Array before API-call", _array);

    // Local storage can only store Strings. Stringified objects are parsed back to JSON before added to the array.
    // Getting all objects from Local storage with spread syntax.
    var entireLocalStorage = { ...window.localStorage };
    if (debug)
      console.log(
        "entireLocalStorage after spread syntax from localStorage",
        entireLocalStorage
      );

    // Use 'for..in' statement to iterate over entireLocalStorage to get individual objects to push to array
    for (var property in entireLocalStorage) {
      if (debug) log(`${property}: ${entireLocalStorage[property]}`);
      var message = entireLocalStorage[property];
      if (debug) log(message);
      if (debug) log(typeof message);
      var objectified = JSON.parse(message);
      _array.push(objectified);
      this.usersArray.push(objectified.name);
      if (debug)
        console.log("entireLocalStorage[property] objectified:", objectified);
    }

    if (debug) console.log("array after API-call", _array);
    if (debug) console.log("userArray after API-call", this.usersArray);

    // Display messages by order: most recent first
    var sortedByDateArray = _array.sort(function (a, b) {
      return b.date - a.date;
    });
    this.array = sortedByDateArray;
    this.renderArray(debug, this.array);
  } // End bracket of getArr(debug)

  getInput(debug) {
    // This function is used in addMSG() at form submit.
    // Grabs input from the textarea HTML element.
    if (debug) log("getInput() start:");
    var subject = document.getElementById("chat_subject");
    var input = document.getElementById("write_msg__textarea");
    var date = new Date().getTime();
    var time = new Date().toLocaleTimeString();

    var name = document.getElementById("user_name");
    // //TO BE USED WHEN CONECTED TO THE CLIENT'S USER INSTEAD OF getting name from write_msg_form's user_name input
    // // something like this:
    // var name = providedUser;

    // Remove seconds from time string.
    time = time.slice(0, -3);

    var obj = {
      subject: subject.value,
      message: input.value,
      name: name.value,
      date: date,
      time: time,
    };

    // Empty subject and textarea elements values
    input.value = "";
    name.value = "";
    if (debug) console.log("getInput() creates object:", obj);

    return obj;
  }

  addMSG(debug, obj) {
    // This function is used at form submit. MUST BE MODIFIED according to storage/database for the id property
    // This function uses the object passed from input() to create an object to be stored in Local storage.
    // The object can only be retrieved from Local storage individually by its key. That's why key is also saved as a property, to make it easier to find.
    if (debug) log("addMSG start");

    var id = Math.floor(100 * Math.random());
    var key = `message${id}`;
    var msgObj = {
      id: id,
      name: obj.name,
      subject: obj.subject,
      message: obj.message,
      date: obj.date,
      time: obj.time,
      key: key,
    };

    var stringified = JSON.stringify(msgObj);
    window.localStorage.setItem(key, stringified);
  }

  confirmUser(debug, providedUser, author) {
    // This function is used in renderArray().
    // providedUser for now is "Sotarn" = "loged in" user on station

    if (debug) log("confirmUser() start:");
    if (debug) console.log("Author of message: ", author); // = obj.name

    if (providedUser !== author) {
      if (debug) log("Access denied!");
      return false;
    } else {
      if (debug) log("Users match! Go ahead to the next step...");
      return true;
    }
  }

  deleteMSGByIndex(debug, index, key) {
    // MUST BE MODIFIED for database. This function is used in renderArray() to remove messages from chat and database/Local storage
    if (debug) log("deleteByIndex() start:");
    var obj = this.array[index];
    if (debug) log(obj);
    var _array = [...this.array];
    _array.splice(index, 1);
    if (debug) log(_array);
    this.array = _array;
    window.localStorage.removeItem(key);
  }

  overlayOn(debug) {
    // This function is used in renderArray().
    if (debug) log("overlayOn() running...");
    editOverlayDiv.classList.toggle("edit_overlay--show");
  }

  closeEditByOverlayClick(debug) {
    // This function is used in init/constructor of MSGService class.
    // It removes overlay and empty values of edit elements.

    if (debug) log("closeEditByOverlayClick() start:");
    //Enable callback functions to reach "this".
    var that = this;

    // Hide overlay
    editOverlayDiv.addEventListener(
      "click",
      function () {
        if (debug) log("closeEditByOverlayClick() running..");

        // Hide editOverlay and outerWrapperDiv that positions the editWrapper or the writeMsgWrapperDiv
        that.closeByEditResetBtnClick(debug);
      },
      false
    );
  }

  closeByEditResetBtnClick(debug) {
    // This function is used in closeEditByOverlayClick(), update() and formElement reset (for writeNewMsg element).
    // Closing overlay.
    if (debug) log("closeByEditResetBtnClick() start:");
    editOverlayDiv.classList.remove("edit_overlay--show");

    // Hide outerWrapperDiv that positions the editWrapper or the writeMsgWrapperDiv
    outerWrapperDiv.classList.remove("outer_wrapper--flex");

    // Check if writeMsgWrapperDiv is active, in that case hide it
    if (writeMsgWrapperDiv.classList.contains("show_msg")) {
      if (debug)
        console.log(
          "'write_msg_container__wrapper' classList before:",
          writeMsgWrapperDiv.classList
        );
      writeMsgWrapperDiv.classList.remove("show_msg");
      if (debug)
        console.log(
          "'write_msg_container__wrapper' classList after:",
          writeMsgWrapperDiv.classList
        );
    }

    // Check if "edit_wrapper" is active, in that case hide it and empty values
    if (editWrapperDiv.classList.contains("edit_wrapper--show")) {
      if (debug)
        console.log(
          "'write_msg_container__wrapper' classList before:",
          editWrapperDiv.classList
        );
      editWrapperDiv.classList.remove("edit_wrapper--show");
      if (debug)
        console.log(
          "'write_msg_container__wrapper' classList before:",
          editWrapperDiv.classList
        );
      var subject = document.getElementById("edit_subject");
      var textArea = document.getElementById("edit_message");
      subject.value = "";
      textArea.innerHTML = "";
    }
  }

  update(debug, obj) {
    // This function is used in renderArray().
    var that = this; // Enables nested functions to reach "this".

    if (debug) {
      log("update() start:");
      console.log("Object passed from renderArray: ", obj);
      console.log("message subject to be checked or updated: ", obj.subject);
      console.log("message to be updated: ", obj.message);
    }

    // Presenting old message for editing
    var subject = document.getElementById("edit_subject");
    subject.value = obj.subject;
    var textArea = document.getElementById("edit_message");
    textArea.innerHTML = obj.message;
    var editSubmitBtn = document.getElementById("edit_submit_btn");

    editSubmitBtn.addEventListener(
      "click",
      function () {
        // Spread operator: making a copy of the original object to work on, to avoid reference errors
        var _obj = { ...obj };

        // Editing subject is optional. Therefore a check if update of subject is neccessary.
        var newSubject = subject.value;
        if (newSubject.length > 0) {
          _obj.subject = newSubject;
        }

        // set new message value to object and send it to local storage
        _obj.message = textArea.value;
        if (debug) console.log("_obj.message:", _obj.message);

        obj = { ..._obj };
        if (debug) console.log("update(): updated message: ", obj.message);

        var stringified = JSON.stringify(obj);
        window.localStorage.setItem(obj.key, stringified);
      },
      false
    );

    // Reset button
    editResetBtn.addEventListener(
      "click",
      function () {
        that.closeByEditResetBtnClick(debug);
      },
      false
    );
  } // End bracket for update()

  renderArray(debug, array) {
    // This function is used in getArr() and in the filter functions.
    if (debug) console.log("renderArray() start");

    // Empty previous chat
    chatContainer.innerHTML = "";
    chatContainer.scrollTo(0, 0);

    // Creating div element to hold chat
    var chatWrapper = document.createElement("div");
    chatWrapper.setAttribute("id", "chat_wrapper");
    // chatWrapper.setAttribute("class", "border--white");
    chatContainer.appendChild(chatWrapper);

    // Instansiating messages with information from array/DB
    // and creating div elements to display messages
    array.map((item, index) => {
      if (debug) console.log("loggat index", index);
      if (debug) console.log("loggat item", item);

      // enables functions in Event listeners to reach "this".
      var that = this;

      // individual buttonWrapperIds for functionality
      var buttonWrapperId = `button_wrapper_nr${index}`;

      // Rendering wrapper for styling of individual messages
      var messageWrapper = document.createElement("div");
      messageWrapper.setAttribute("class", "message__wrapper--style ");

      // Rendering top bar to individual message, holding subject of message, date and time
      var headerDivWrapper = document.createElement("div");
      headerDivWrapper.setAttribute("class", "header_div--style");

      var subjectDiv = document.createElement("div");
      subjectDiv.setAttribute("class", "subject_div--style");
      var subjectText = document.createTextNode(item.subject);
      subjectDiv.appendChild(subjectText);

      // headerDivWrapper.appendChild(subjectDiv);
      messageWrapper.appendChild(headerDivWrapper);

      var dateDiv = document.createElement("div");
      dateDiv.setAttribute("class", "date_div");
      var unixTime = parseInt(item.date);
      var dateToDisplay = new Date(unixTime).toLocaleDateString();
      var dateText = document.createTextNode(dateToDisplay);
      dateDiv.appendChild(dateText);

      var timeDiv = document.createElement("div");
      timeDiv.setAttribute("class", "time_div");
      var timeText = document.createTextNode("kl." + item.time);
      timeDiv.appendChild(timeText);

      var momentDiv = document.createElement("div");
      momentDiv.setAttribute("class", "moment_div");
      momentDiv.appendChild(dateDiv);
      momentDiv.appendChild(timeDiv);

      // Rendering div to hold the actual message
      var textDiv = document.createElement("div");
      textDiv.setAttribute("class", "text_div--style");

      // Rendering paragraf for behavior of text
      var messageParagraph = document.createElement("p");
      var messageText = document.createTextNode(item.message);
      messageParagraph.appendChild(messageText);
      textDiv.appendChild(messageParagraph);

      // Rendering a wrapper for menu button
      var menuBtnWrapper = document.createElement("div");
      menuBtnWrapper.setAttribute("class", "message__menu_btn_wrapper--style");
      textDiv.appendChild(menuBtnWrapper);

      // Rendering menu button to hold "Edit" and "Delete" options
      var menuBtn = document.createElement("button");
      menuBtn.setAttribute("class", "message__menu_btn--style");
      var menuIcon = document.createElement("img");
      menuIcon.setAttribute("src", "images/ellipsis-v-solid.svg");
      menuIcon.setAttribute("class", "menu__image--style");
      menuBtn.appendChild(menuIcon);
      menuBtnWrapper.appendChild(menuBtn);

      // Adding event listener to menuBtn, to show select dropdown
      menuBtn.addEventListener(
        "click",
        function () {
          // Show or hide edit and delete buttons CREATE FUNCTION TO CLOSE BUTTONWRAPPER when click outside, and close after click
          document
            .getElementById(buttonWrapperId)
            .classList.toggle("button_wrapper--active");
        },
        false
      );

      messageWrapper.appendChild(textDiv);

      // Rendering divs to hold and style author of message
      var userWrapper = document.createElement("div");
      userWrapper.setAttribute("class", "user_wrapper");

      var nameDiv = document.createElement("div");
      nameDiv.setAttribute("class", "name_wrapper");
      var nameText = document.createTextNode(item.name);
      nameDiv.appendChild(nameText);
      userWrapper.appendChild(nameDiv);

      // Rendering update button
      var updateBtn = document.createElement("button");
      var updateTextNode = document.createTextNode("Redigera");
      updateBtn.setAttribute("class", "btn--gray");
      updateBtn.appendChild(updateTextNode);

      updateBtn.addEventListener(
        "click",
        function () {
          // Checks that no other than the author of the message is allowed access to edit message
          var confirm = that.confirmUser(debug, providedUser, item.name);

          if (confirm) {
            // Activate fullscreen overlay
            outerWrapperDiv.classList.toggle("outer_wrapper--flex");
            that.overlayOn(debug);

            // Make edit_wrapper div visible
            editWrapperDiv.classList.toggle("edit_wrapper--show");

            // Running update. Not calling renderArray(), the form element in update seem to refresh browser anyway.
            that.update(debug, item);
          } else {
            window.alert(
              "Chat Service: Tyvärr. Du är inte behörig att redigera detta meddelande."
            );
          }
        },
        false
      );

      //Rendering delete button
      var deleteBtn = document.createElement("button");
      var deleteTextNode = document.createTextNode("Ta bort");
      deleteBtn.setAttribute("class", "delete__btn--style btn--gray");
      deleteBtn.appendChild(deleteTextNode);

      deleteBtn.addEventListener(
        "click",
        function () {
          // Checks that no other than the author of the message is allowed access to delete message
          var confirm = that.confirmUser(debug, providedUser, item.name);
          if (confirm) {
            var message = `Chat Service: Är du säker på att du vill RADERA detta meddelande: "${item.message}"?`;
            var runDelete = window.confirm(message);
            if (runDelete) {
              that.deleteMSGByIndex(debug, index, item.key);
              messageWrapper.remove();
              window.alert("Ditt meddelande har raderats.");
            }
          } else {
            window.alert(
              "Chat Service: Tyvärr. Du är inte behörig att radera detta meddelande."
            );
          }
        },
        false
      );

      // Rendering div to hold and style buttons
      var buttonWrapper = document.createElement("div");
      buttonWrapper.setAttribute("class", "button_wrapper--style");
      buttonWrapper.setAttribute("id", buttonWrapperId);
      buttonWrapper.appendChild(updateBtn);
      buttonWrapper.appendChild(deleteBtn);

      buttonWrapper.addEventListener(
        "click",
        function () {
          if (buttonWrapper.classList.contains("button_wrapper--active"))
            buttonWrapper.classList.remove("button_wrapper--active");
        },
        false
      );

      // Rendering div to act as footer to message, holding author and buttons
      var messageFooterWrapper = document.createElement("div");
      messageFooterWrapper.setAttribute(
        "class",
        "message__footer_wrapper--style"
      );
      messageFooterWrapper.appendChild(momentDiv);
      messageFooterWrapper.appendChild(subjectDiv);
      messageFooterWrapper.appendChild(userWrapper);
      messageFooterWrapper.appendChild(buttonWrapper);
      messageWrapper.appendChild(messageFooterWrapper);

      // Appending all child elements to chat wrapper
      chatWrapper.appendChild(messageWrapper);
    });
  } // End bracket for renderArray()

  getUniqueUserList(debug, array) {
    if (debug) log("Start getUniqueUserList()");
    // Create a new array with unique user names from passed array
    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }
    var uniqueUserNamesArray = array.filter(onlyUnique);
    if (debug) log(uniqueUserNamesArray);
    return uniqueUserNamesArray;
  } // End bracket for getUniqueUserList()

  getSelectedFilterSubject(debug) {
    // This function reads the hard coded subject select element
    if (debug) log("start getSelectedFilterSubject()");
    var that = this;

    subjectSelect.addEventListener(
      "change",
      function (e) {
        // Reset other filters
        that.subjectResetOtherFilters(debug);
        if (debug)
          log("Selected subject from subjectSelect element: " + e.target.value);
        var selectedOption = e.target.value;
        that.filterByKey(debug, selectedOption);
      },
      false
    );
  } // End bracket for getSelectedFilterSubject()

  renderSelectNameOptions(debug, array) {
    // This function renders a list to select users from dynamically, based on users that have added a message to the chat.
    if (debug) log("start  renderSelectNameOptions()");
    var that = this;

    array.map(function (item) {
      var option = document.createElement("option");
      option.text = item;
      userSelect.appendChild(option);
    });

    if (debug) log(userSelect);

    userSelect.addEventListener(
      "change",
      function (e) {
        // Reset other filters. LEFT TO DO: buttons DYGN, VECKA, MÅNAD, ALLA
        that.userResetOtherFilters(debug);

        if (debug)
          log("Selected user name from userSelect element:  " + e.target.value);
        var selectedOption = e.target.value;
        that.filterByKey(debug, selectedOption);
      },
      false
    );
  } // End bracket for renderSelectNameOptions()

  filterByKey(debug, filterKey) {
    //This function is used in renderSelectNameOptions(debug, array) and getSelectedFilterSubject(debug).
    if (debug) log("filterByKey() start");

    if (filterKey === "Alla") {
      log("Alla meddelanden valda ur filter: kategori eller namn");
      this.renderArray(debug, this.array);
    } else {
      if (
        filterKey === "Värme" ||
        filterKey === "Kyla" ||
        filterKey === "Ventilation" ||
        filterKey === "Allmänt"
      ) {
        var filteredMessages = this.array.filter(function (item) {
          return item.subject === filterKey;
        });
      } else {
        var filteredMessages = this.array.filter(function (item) {
          return item.name === filterKey;
        });
      }
      if (debug) console.log("array inifrån 'filterByKey':", filteredMessages);
      this.renderArray(debug, filteredMessages);
    }
  } // End bracket for filterByKey()

  filterByDate(debug, desiredDateInterval) {
    //This function compares and filters messages by date according to users input of time interval.

    if (debug) {
      log("filterByDate() start");
      console.log("filterByDate() uses this.array:", this.array);
    }

    // Todays unix time to compare to
    var currentDate = new Date();
    if (debug) console.log("currentDate:", currentDate);

    // Yesterdays unix time to compare to
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (debug) console.log("yesterday:", yesterday);

    var oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() - 7);
    if (debug) console.log("oneWeekFromNow:", oneWeekFromNow);

    var oneMonthFromNow = new Date();
    oneMonthFromNow.setDate(oneMonthFromNow.getDate() - 30);
    if (debug) console.log("oneMonthFromNow:", oneMonthFromNow);

    switch (desiredDateInterval) {
      case 1:
        var filteredMessages = this.array.filter(function (item) {
          return item.date <= currentDate && item.date >= yesterday;
        });
        if (debug)
          console.log(
            "array inifrån 'filterByDate' filtrerat på 24h:",
            filteredMessages
          );
        this.renderArray(debug, filteredMessages);
        break;
      case 7:
        // Filter for 7 dayz
        var filteredMessages = this.array.filter(function (item) {
          return item.date <= currentDate && item.date >= oneWeekFromNow;
        });
        if (debug)
          console.log(
            "array inifrån 'filterByDate' filtrerat på 7 dagar:",
            filteredMessages
          );
        this.renderArray(debug, filteredMessages);
        break;
      case 30:
        // Filter for 30 dayz
        var filteredMessages = this.array.filter(function (item) {
          return item.date <= currentDate && item.date >= oneMonthFromNow;
        });
        if (debug)
          console.log(
            "array inifrån 'filterByDate' filtrerat på 30 dagar:",
            filteredMessages
          );
        this.renderArray(debug, filteredMessages);
        break;
      default:
        console.log(
          "error from filterByDate: switch case statement not working!"
        );
        break;
    }
  } // End bracket for filterByDate()

  renderFilters(debug) {
    // This function adds functionality to all Top and Filter buttons.

    if (debug) console.log("start renderFilters():");
    var that = this; // Enables nested functions to reach "this".

    // Adds functionality to the HTML-element "new_msg_btn"
    newMsgBtn.addEventListener(
      "click",
      function () {
        subjectSelect.selectedIndex = 0;
        that.subjectResetOtherFilters(debug);
        outerWrapperDiv.classList.toggle("outer_wrapper--flex");
        writeMsgWrapperDiv.classList.toggle("show_msg");
        that.overlayOn(debug);
      },
      false
    );

    // Adds functionality to the HTML-element "toggle_filters"
    filterBtn.addEventListener(
      "click",
      function () {
        userSelect.selectedIndex = 0;
        that.userResetOtherFilters(debug);

        // Show or hide filter messages options
        document
          .getElementById("filter__container_wrapper")
          .classList.toggle("filter__container_wrapper--show");
      },
      false
    );

    // Adds functionality to the HTML-element "refresh_btn"
    // Reloads web page
    refreshBtn.addEventListener(
      "click",
      function () {
        location.reload();
      },
      false
    );

    // Adds functionality to HTML-element "filter__subject_select", filter messages by subject
    this.getSelectedFilterSubject(debug);

    // Renders a list of users to choose from, filter messages by user
    this.renderSelectNameOptions(
      debug,
      this.getUniqueUserList(debug, this.usersArray)
    );

    // filter messages by 24h
    dayBtn.addEventListener(
      "click",
      function () {
        dayBtn.classList.add("btn--gray--active");
        that.resetSelectedFilterButtons(debug, dayBtn);
        that.filterByDate(debug, 1);
      },
      false
    );

    // filter messages by 7 days
    weekBtn.addEventListener(
      "click",
      function () {
        weekBtn.classList.add("btn--gray--active");
        that.resetSelectedFilterButtons(debug, weekBtn);
        that.filterByDate(debug, 7);
      },
      false
    );

    // filter messages by 30 days
    monthBtn.addEventListener(
      "click",
      function () {
        monthBtn.classList.add("btn--gray--active");
        that.resetSelectedFilterButtons(debug, monthBtn);
        that.filterByDate(debug, 30);
      },
      false
    );
  } // End bracket renderFilters()

  subjectResetOtherFilters(debug) {
    // Reset all other filters except subject select dropdown
    if (debug) log("subjectResetOtherFilters() start");
    userSelect.selectedIndex = 0;
    this.resetAllFilterButtons(debug);
  }

  userResetOtherFilters(debug) {
    // Reset all other filters except user select dropdown
    if (debug) log("userResetOtherFilters() start");
    subjectSelect.selectedIndex = 0;
    this.resetAllFilterButtons(debug);
  }

  resetAllFilterButtons(debug) {
    //loop through and remove active class
    for (var i = 0; i < arrayFilterBtns.length; i++) {
      if (arrayFilterBtns[i].classList.contains("btn--gray--active")) {
        if (debug)
          console.log("GRÅ KNAPP AKTIVERAD på knappen: ", arrayFilterBtns[i]);
        arrayFilterBtns[i].classList.remove("btn--gray--active");
        if (debug) log("GRÅ KNAPP AVAKTIVERAD!");
      }
    }
  }

  resetSelectedFilterButtons(debug, selectedBtn) {
    // Reset both select dropdowns
    userSelect.selectedIndex = 0;
    subjectSelect.selectedIndex = 0;

    // Remove current = "selectedBtn" button from array-of-buttons-to-be-inactivated
    for (var i = 0; i < arrayFilterBtns.length; i++) {
      if (arrayFilterBtns[i] === selectedBtn) {
        if (debug) console.log("selectedBtn found: ", arrayFilterBtns[i]);

        arrayFilterBtns.splice(i, 1);

        if (debug)
          console.log("arrayFilterBtns after splice: ", arrayFilterBtns);
      }
    }

    // Inactivate other filter buttons
    for (var i = 0; i < arrayFilterBtns.length; i++) {
      if (arrayFilterBtns[i].classList.contains("btn--gray--active")) {
        if (debug)
          console.log("GRÅ KNAPP AKTIVERAD på knappen: ", arrayFilterBtns[i]);

        arrayFilterBtns[i].classList.remove("btn--gray--active");

        if (debug) log("GRÅ KNAPP AVAKTIVERAD!");
      }
    }
    arrayFilterBtns.push(selectedBtn);
    if (debug) console.log("arrayFilterBtns after push: ", arrayFilterBtns);
  } // End bracket of resetSelectedFilterButtons
} // End bracket of MSGService class

var service = new MSGService(debug);

var formElement = document.getElementById("write_msg__form");
formElement.setAttribute(
  "onsubmit",
  "service.addMSG(debug, service.getInput(debug))"
);
formElement.setAttribute("onreset", "service.closeByEditResetBtnClick(debug)");
