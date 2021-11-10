# Chat service

This is a chat service widget I built during an internship, according to the designs of my mentor Martin Jonsson.

This widget interacts with your browsers Local storage. **PLEASE NOTE:** anything you write as a message will be stored in the browser forever unless you
delete the message. Therefore, please keep the following in mind, according to https://blog.logrocket.com/localstorage-javascript-complete-guide/#:~:text=To%20get%20items%20from%20localStorage%2C%20use%20the%20getItem%28%29,as%20a%20string.%20To%20retrieve%20a%20user%20key%3A:

> "Do not store sensitive user information in localStorage
>
> - It is not a substitute for a server based database as information is only stored on the browser
> - localStorage is limited to 5MB across all major browsers
> - localStorage is quite insecure as it has no form of data protection and can be accessed by any code on your web page
> - localStorage is synchronous, meaning each operation called would only execute one after the other"

Chat service is ment to be modified to interact with databases in the future, and to be used from different clients. The property/variable "providedUser" is
planned to be set according to which person is logged in on the system. The default value of "providedUser" for now is "Sotarn".
To enjoy this widget to the fullest I recomend that you either sign your messages as Sotarn or set the global variable "providedUser" to a name of your choice.
When you write a message you must sign with that exact name, otherwise you will not be able to edit or delete your messages.

You can however reach the browsers Local storage via Dev Tools and delete "other users" messages from there.

Enjoy!
