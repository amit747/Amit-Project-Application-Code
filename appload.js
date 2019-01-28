(function () {

    // A small library that adds a fake "app load" event to which listeners can be attached

    // An event listener kan be added to a specific app name, and once 
    // the event for the app name is triggered, it will run all event listeners.
    // If the event is triggered before the listeners is added, it will instead run an added
    // listener directly once it is addedn. Listeners will only run once, so the second time you try to
    // trigger the event for a specific app name, nothing will happen.

    // A listener is added like this:
    // AppLoad.addEventListener('myAppName', functionToRun);
    // Where 'myAppName' is a string specifying the app that should have listeners run when it's done
    // and functionToRun is a named function that will be run as soon as the event is triggered

    // An event for an app is triggered like this:
    // AppLoad.triggerEvent('myAppName');
    // and that will run all listeners added with the 'myAppName' string.

    // Take note that the listeners takes no parameters, but are only supposed to be events
    // that should be triggered, no parameters should be passed

    // In the context of the Nexus project and especially the Angular widget, the listeners are added
    // in the nexus.js file, and are totally removed from the angular code running the angular widget
    // REST calls. So when an angular widget is done and successfull, it will trigger an event for this library.

    // The name of the app is set as a web part property in the angular widget and has to be
    // configured in the UI of the angular widget web part
    // Written by Stina Qvarnstrom, Bool Nordic AB


    AppLoad = {};
    var apps = {};

    var initializeApp = function (appName, hasBeenTriggered) {
        apps[appName] = {};
        apps[appName].listeners = [];
        apps[appName].hasBeenTriggered = hasBeenTriggered;
    };

    AppLoad.addEventListener = function (appName, listener) {
        if (typeof listener !== 'function') {
            return false;
        }

        if (appName in apps) {
            if (apps[appName].hasBeenTriggered) {
                listener();
            } else {
                apps[appName].listeners.push(listener);
            }
        } else {
            initializeApp(appName, false)
            apps[appName].listeners.push(listener);
        }
    };

    AppLoad.triggerEvent = function (appName) {
        if (!(appName in apps)) {
            initializeApp(appName, true);
        } else {
            if (apps[appName].hasBeenTriggered) {
                return;
            }

            var allListeners = apps[appName].listeners;
            allListeners.forEach(function (listener) {
                setTimeout(listener);
            });

            apps[appName].hasBeenTriggered = true;
        }
    };
}());