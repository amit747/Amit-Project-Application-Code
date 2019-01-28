var nexus = nexus || {};
nexus.errorLevels = {
                        debug: 0, 
                        error: 1, 
                        warning: 2, 
                        info: 3,
                    };

var jsclient = jsclient || {};
jsclient.retryCounter = 0;
jsclient.retryElapsedTime = 120000; // 2 minutes, in miliseconds

// use them from config store, comment before deploying
//jsclient.postbacklevel = nexus.errorLevels.error;
//jsclient.loglevel = nexus.errorLevels.error;

function retryLogComponent(errorLevel, errorCode, errorText, key) {
    this.errorLevel = errorLevel;
    this.errorCode = errorCode;
    this.errorText = errorText;
    this.key = key;
}

jQuery(document).ready(function () {
    "use strict";

    var $ = jQuery;

    // This method logs any error or important info
    nexus.log = function (errorLevel, errorText, errorCode) {
        errorCode = errorCode || "";
        errorLevel = errorLevel || jsclient.loglevel;

        if (errorLevel === jsclient.postbacklevel)
        {
            var serverLogLevel = '';
            switch (errorLevel.toLowerCase()) {
                case "error":
                    serverLogLevel = 'Critical';
                    break;
                case "debug":
                    serverLogLevel = 'Verbose';
                    break;
                case "warning":
                    serverLogLevel = 'Warning';
                    break;
                case "info":
                    serverLogLevel = 'Verbose';
                    break;
            }

            nexus.logOnServer(serverLogLevel, errorText, errorCode,
               function (data) {
                   // call succedded, error logged successfully
               },
               function (xhr, statusText, errorThrown) {
                   debugger;
                   // call failed, error not logged. Store this error in the Session Storage for some time before retrying to log on server
                   console.log(errorCode + ": " + errorText);
                   
                   if (typeof (Storage) !== "undefined") {
                       if (sessionStorage.errorcount) {
                           sessionStorage.errorcount = Number(sessionStorage.errorcount) + 1;
                       } else {
                           sessionStorage.errorcount = 1;
                       }
                       var comp = new retryLogComponent(errorLevel, errorCode, errorText, "nexuserror" + sessionStorage.errorcount);
                       //sessionStorage.setItem("nexuserror" + sessionStorage.errorcount, "Code: " + errorCode + ";;;Text: " + errorText); // Store
                       sessionStorage.setItem("nexuserror" + sessionStorage.errorcount, JSON.stringify(comp)); 
                   }
                   else {
                       // Sorry! No Web Storage support..
                   }
           });
        }
        else {
            console.log(errorCode + ": " + errorText);
        }

    }
    
   // This method retries sending error messages from session storage to server, if any
    nexus.retry = function ()
    {
        if (sessionStorage.length > 0)
        {
            var messages = [];
            // get aal messages
            for (var i = 0; i < sessionStorage.length; i++)
            {
                var key = sessionStorage.key(i);
                if (/nexuserror/.test(key))
                {
                    var item = JSON.parse( sessionStorage.getItem(key) );
                    messages.push(item);
                }
           }
           
            // start by sending a single message
            if (messages.length > 0) {
                var isFirstCallSucceded = false;
                nexus.logOnServer(messages[0].errorLevel, messages[0].errorText, messages[0].errorCode, messages[0].key,
                               function (data) {
                                   // first call succedded, error logged successfully
                                   isFirstCallSucceded = true;
                                   sessionStorage.removeItem(messages[0].key);
                                   
                                   // start posting remaining messages
                                   for (var j = 1; j < messages.length; j++) {
                                       nexus.logOnServer(messages[j].errorLevel, messages[j].errorText, messages[j].errorCode, messages[0].key,
                                         function (data) {
                                           // succedded, remove this entry from session storage
                                          // the server needs to return "session key" on success, pass the key while posting
                                            
                                       }, function (xhr, status, error) { });
                                   }
                                },
                               function (xhr, statusText, errorThrown) {
                                   // This means that the 1st call failed, do not attempt to post any further messages.
                                   isFirstCallSucceded = false;
                               });
            }
            
        }
        }

    // retry posting messages back to server.
    nexus.startTimer = function () {
        setInterval(nexus.retry, jsclient.retryElapsedTime);
    }
    nexus.startTimer();
});