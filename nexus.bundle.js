var nexus = nexus || {};
var SP = SP || null;
var infobarData = null, currentUserId;
nexus.loggedInUserID = '';


// IE9 fix (in case there is some console.log() left in the code it will crash in IE9 unless the dev console has been opened at least once)
if (!window.console) {
    var console = {
        log: function () { },
        warn: function () { },
        error: function () { },
        time: function () { },
        timeEnd: function () { }
    }
}

//var host = window.location.host;
//var protocol = window.location.protocol;
//var url = protocol + "//" + host;

//if (url.indexOf("https://nexus-test.mandieselturbo.com") === 0) {
//    nexus.admintoolapi = "https://api-test.mandieselturbo.com/nexususerapi/";
//    nexus.rootUrl = "https://nexus-test.mandieselturbo.com";
//}
//else {

//    nexus.admintoolapi = "http://etdkcphas004.mdt-ext-test.biz:82/"; //"http://dtdkcphas0700:8012/";
//    nexus.rootUrl = url;
//}

nexus.gotoPage = function (target) {
    "use strict";

    var newURL = "";

    if (target === "root") {
        newURL = window.location.protocol + "//" + window.location.host;
    }
    else if (target === "userprofile") {
        newURL = window.location.protocol + "//" + window.location.host + "/pages/MyProfile.aspx";
    }
    else if (target === "news") {
        newURL = window.location.protocol + "//" + window.location.host + "/pages/News.aspx";
    }
    else if (target === "appstore") {
        newURL = window.location.protocol + "//" + window.location.host + "/pages/AppStore.aspx";
    }
    else if (target === "help") {
        newURL = window.location.protocol + "//" + window.location.host + "/help";
    }
    else {
        newURL = target;
    }

    if (newURL !== "") {
        window.location.href = newURL;
    }

    return false;
}


var reloadPage = function () {
    // Helper function to reload a page
    location.reload();
};

jQuery(document).ready(function () {
    "use strict";

    var $ = jQuery;

   // -- Move the SharePoint NavBox into view on pages that have the container -------------

    if ($("#nexus-navbar-container").length > 0) {
        $("#sideNavBox").addClass("nexus-navbar-restyle");
        $("#sideNavBox").addClass("nexus-navbar-restyle-width");
        $("#nexus-navbar-container").append($("#sideNavBox"));
    }

    // check if the current user has permissions to add items to current library/folder. If not, disable the "Upload Multiple" button in the ribbon
    nexus.multiFileUpload_checkifUserHasEditPermissions = false;
    var _theList,
        currentFolderAssignments;
    
    function DT_GIIW_NEXUS_MultipleUpload_checkifUserHasEditPermissions() {
       var context = new SP.ClientContext.get_current();

        var web = context.get_web();

        var _currentUser = web.get_currentUser();

        // this is to check if the user has permission to the current folder (a user may not have permissions to library but may have it to a folder)
        var cleanFolderPath, hasRootFolder = false,
            queryStrings = window.location.search,
            currentFolderPath;
        if (!!ctx) {
            if (!!ctx.rootFolder) {
                cleanFolderPath = decodeURIComponent(ctx.rootFolder);
            }
        }
        if (!!cleanFolderPath)
        {
            var folder = web.getFolderByServerRelativeUrl(cleanFolderPath);
            currentFolderAssignments = web.getFolderByServerRelativeUrl(cleanFolderPath).get_listItemAllFields();
            context.load(currentFolderAssignments, 'EffectiveBasePermissions');
        }
        _theList = web.get_lists().getById(_spPageContextInfo.pageListId);

        context.load(_currentUser);

        context.load(web, 'EffectiveBasePermissions');

        context.load(_theList, 'EffectiveBasePermissions')

        context.executeQueryAsync(Function.createDelegate(this, onPermissionsSuccessMethod), Function.createDelegate(this, onPermissionsFailureMethod));
      }


    function onPermissionsSuccessMethod(sender, args) {
        if (_theList.get_effectiveBasePermissions().has(SP.PermissionKind.addListItems)) {
            nexus.multiFileUpload_checkifUserHasEditPermissions = true;
            if (!!$('#nexus-multi-file-upload-container-panel')
                && $('#nexus-multi-file-upload-container-panel').length > 0)
                $('#nexus-multi-file-upload-container-panel').closest('[id^=MSOZoneCell_').show();
        }
        else if (!!currentFolderAssignments) {
            if (currentFolderAssignments.get_effectiveBasePermissions().has(SP.PermissionKind.addListItems)) {
                nexus.multiFileUpload_checkifUserHasEditPermissions = true;
                if (!!$('#nexus-multi-file-upload-container-panel')
                    && $('#nexus-multi-file-upload-container-panel').length > 0)
                    $('#nexus-multi-file-upload-container-panel').closest('[id^=MSOZoneCell_').show();
            }
        }
       else {
            nexus.multiFileUpload_checkifUserHasEditPermissions = false;
            if (!!$('#nexus-multi-file-upload-container-panel')
                            && $('#nexus-multi-file-upload-container-panel').length > 0)
                $('#nexus-multi-file-upload-container-panel').closest('[id^=MSOZoneCell_').hide();
        }
    }

        var onPermissionsFailureMethod = function() {
        nexus.multiFileUpload_checkifUserHasEditPermissions = false;
        if (!!$('#nexus-multi-file-upload-container-panel')
                        && $('#nexus-multi-file-upload-container-panel').length > 0)
            $('#nexus-multi-file-upload-container-panel').closest('[id^=MSOZoneCell_').hide();
    }

    DT_GIIW_NEXUS_MultipleUpload_checkifUserHasEditPermissions();



    //Set Current user details in Javascript global variable
    function setUPCurrentUserLogin() {
        ///Setting hiddenfield for Cardiolog:Shailesh
        $('#userid').val("MD-MAN\\" + nexus.currentUserADFSName);
        var userid = _spPageContextInfo.userId;
        var requestUri = _spPageContextInfo.webAbsoluteUrl + "/_api/web/getuserbyid(" + userid + ")";
        var requestHeaders = {
            "accept": "application/json;odata=verbose"
        };
        $.ajax({
            url: requestUri,
            contentType: "application/json;odata=verbose",
            headers: requestHeaders,
            success: onSuccess,
            error: onError,
            cache: true
        });

        function onSuccess(data, request) {
            nexus.currentUserName = data.d.Title;
            //var adfUserRegex=/(adfs[|])([a-zA-Z0-9]+)/g;
            nexus.currentUserWithDomainName = parseLoginID(data.d.LoginName, "AccountNameWithDomain");
            nexus.currentUserAccountName = parseLoginID(data.d.LoginName, "AccountNameWithoutDomain");
            //Set the topbar profile picture url
            $('.nexus-profile-picture').attr("src", nexus.admintoolapi + "user/" + nexus.currentUserAccountName + "/picture");
            
            if (window.location.href.toLowerCase().indexOf('appstore') == -1) {
                initiateDirectContactWidget();
            }
        }

        function onError(xhr, statusText, errorThrown) {
            nexus.log(nexus.errorLevels.error, xhr.responseText, xhr.status);
        }
    }
    function parseLoginID(userid, expression) {
        var adfsUserRegex = /(adfs[|])([a-zA-Z0-9]+)/;
        var windowsUserRegex = /([a-zA-Z-]+)[\\]([a-zA-Z]+)/;
        var match;
        if (adfsUserRegex.exec(userid) != null) {
            match = adfsUserRegex.exec(userid);
        }
        else if (windowsUserRegex.exec(userid) != null) {
            match = windowsUserRegex.exec(userid);
        }


        switch (expression) {
            case "AccountNameWithoutDomain":
                return match[2];
                break;
            case "AccountNameWithDomain":
                return match[0]
                break;

        }


    }
    ///
    setUPCurrentUserLogin();

    // -- Generic click handler to close when clicking outside open menus etc ---------------

    nexus.closeAllOpenPopups = function (excepForThis) {
        $(".nexus-opened").each(function () {
            if (excepForThis != this) {
                $(this).click();
            }
        });
    }

    $('html').on('click', function (e) {
        nexus.closeAllOpenPopups();
    });

    // -- Handle Window Resize --------------------------------------------------------------

    // Set the profile name/dropdown max width so that icons are always visible
    nexus.setProfileMaxWidth = function () {
        var profileMaxWidth = $("#nexus-toolbar-icons").offset().left - $(".nexus-profile-dropdown").offset().left - $("#nexus-site-menu").width() - 32;
        $("#nexus-profile-dropdown .ms-core-menu-root").css("max-width", profileMaxWidth);
    };

    // Fix fixed size widgets on app page
    nexus.setAppStoreWidgetSize = function () {
        $(".nexus-widget-app-store-fixed-size").each(function () {
            // header should only be one line
            var headerElement = $(this).find(".nexus-icon-header");
            var maxWidth = $(headerElement).width() - parseInt($(headerElement).css("padding-left")) - parseInt($(headerElement).css("padding-right"));
            $(this).find(".nexus-icon-header h3").width(maxWidth + "px");

            // body should be 5 lines
        });
    };


    // Allows divs to get same height as another div
    nexus.resizeDivs = function () {
        $(".nexus-resize-height").each(function () { // add class .nexus-resize-height to div that is to be rezieds
            var targetHeight = $("#" + $(this).data("resize-height-target-id")).height(); // also add a data-resize-height-target-id='someid' and make sure that some other div has this id
            $(this).height(targetHeight + "px");
        });
    };
    if ($(".nexus-resize-height").length > 0) {
        nexus.resizeDivs();
    }

    //$(window).resize(setProfileMaxWidth);

    $(window).resize(function () {
        nexus.setProfileMaxWidth();
        nexus.setAppStoreWidgetSize();
        if ($(".nexus-resize-height").length > 0) {
            nexus.resizeDivs();
        }
    });

    // -- Plain SharePoint pages ------------------------------------------------------------

    // if page has no nexus page layout; make it look a little bit prettier
    if ($(".nexus-content-margin").length === 0) {
        $("#DeltaPlaceHolderMain").css("padding", "10px 20px 20px 20px");

        if ($("td > .ms-webpart-zone").length !== 0) {
            // ex edit form: http://dev/sites/nexus/Pages/Forms/EditForm.aspx?ID=2
            $(".nexus-content [id^=WebPartWPQ]").css("padding", "20px");
            $(".nexus-content [id^=WebPartWPQ]").css("box-shadow", "0 0 8px rgba(0, 0, 0, 0.1)");
        }

        if ($(".ms-webpartzone-cell").length === 0) {
            $("<style type='text/css'> .ms-dialog .nexus-content { box-shadow: none !important;} </style>").appendTo("head");
            $(".nexus-content").css("background-color", "white");
            $(".nexus-content").css("padding", "0 20px 20px 20px");
            $(".nexus-content").css("box-shadow", "0 0 8px rgba(0, 0, 0, 0.1)");
        } else {
            $(".ms-webpartzone-cell").each(function () {
                $(this).css("padding", "20px");
                $(this).css("background-color", "white");
            });
        }

        $("#sideNavBox").addClass("nexus-navbar-restyle");
        $("#nexus-navbar-no-page-layout-container").append($("#sideNavBox"));

        $("#nexus-breadbrumb").css( {"margin": "0", "padding-left": "10px"});

    }

    // --- Main Menu ---------------------------------------------------------------

    // open the main menu
    $("#nexus-toolbar-menu-button").click(function (e) {
        e.stopPropagation();
        nexus.closeAllOpenPopups(this);
        $("#nexus-main-menu-arrow").fadeToggle(100);
        var $nexusMainMenu = $('#nexus-main-menu');
        $nexusMainMenu.slideToggle(150, function () {
            if ($('#nexus-main-menu').is(':visible')) {
                $("#nexus-toolbar-menu-button").addClass("nexus-opened");
            } else {
                $("#nexus-toolbar-menu-button").removeClass("nexus-opened");
            }
        });

        return false;
    });

    // stop event bubbling to prevent closing menu when clicking an item
    $("#nexus-main-menu").click(function (e) {
        e.stopPropagation();
    });

    // load menu items
    nexus.getMainMenu(function (data) {
        if (data) {
            var html, n, i;

            html = "<ul>";

            for (n = 0; n < data.length; n++) {

                if (data[n].Url) {
                    html += "<li>";
                    html += "<a href='" + data[n].Url + "'>" + data[n].Title + "</a>";
                    html += "</li>";
                } else if (data[n].SubItems) {
                    html += "<li>";

                    html += "<a href='#' class='nexus-main-menu-open-submenu'>";
                    html += data[n].Title + "<span class='nexus-icon-menu-open'></span>";
                    html += "</a>";

                    html += "<ul class='nexus-main-menu-submenu'>";
                    for (i = 0; i < data[n].SubItems.length; i++) {
                        html += "<li>";
                        html += "<a target=\"_blank\" href='" + data[n].SubItems[i].Url + "'>" + data[n].SubItems[i].Title + "</a>";
                        html += "</li>";
                    }
                    html += "</ul>";

                    html += "</li>";
                }
            }
            html += "</ul>";

            var $nexusMainMenu = $('#nexus-main-menu');
            $nexusMainMenu.append(html);

            var makeMenuFitOnScreen = function ($nexusMainMenu) {
                // does the menu fit on screen?

                // start by resetting the height so that the following calculations are correct
                $nexusMainMenu.css('height', '');
                $nexusMainMenu.css('overflow-y', '');

                var menuOffsetTop = $nexusMainMenu.offset().top;
                var windowHeight = window.innerHeight;
                var spaceForMenu = windowHeight - menuOffsetTop;
                var menuHeight = $nexusMainMenu.height();

                if (menuHeight > spaceForMenu) {
                    $nexusMainMenu.css('height', spaceForMenu + 'px');
                    $nexusMainMenu.css('overflow-y', 'scroll');
                }
            };

            var closeSubmenu = function ($menuElement) {
                $menuElement.removeClass("nexus-expanded");
                $menuElement.next("ul").removeClass("nexus-expanded");
                $menuElement.closest("li").removeClass("nexus-expanded");
                $menuElement.next("ul").slideUp(150, function () {
                    makeMenuFitOnScreen($nexusMainMenu);
                });
                $menuElement.children("span").removeClass("nexus-rotated");
            };

            var openSubmenu = function ($menuElement) {
                $menuElement.addClass("nexus-expanded");
                $menuElement.next("ul").addClass("nexus-expanded");
                $menuElement.closest("li").addClass("nexus-expanded");
                $menuElement.next("ul").slideDown(150, function () {
                    makeMenuFitOnScreen($nexusMainMenu);
                });
                $menuElement.children("span").addClass("nexus-rotated");
            };

            // open submenus in the main menu
            $(".nexus-main-menu-open-submenu").on('click', function () {
                var $menuElement = $(this);
                var allOpenTopLevelMenuItems = $('#nexus-main-menu li.nexus-expanded .nexus-main-menu-open-submenu');

                allOpenTopLevelMenuItems.each(function () {
                    // This closes all elements except the clicked
                    if (!(this === $menuElement.get(0))) {
                        // and the odd if statement is to make sure that the currently clicked element should not be closed
                        closeSubmenu($(this));
                    }
                });

                if($menuElement.hasClass("nexus-expanded")) {
                    closeSubmenu($menuElement);
                } else {
                    openSubmenu($menuElement);
                }



            });
        }
    });


    // --- Project Menu ---------------------------------------------------------------

    // open the project menu
    $("#nexus-toolbar-menu-buttontool a").eq(0).click(function (e) {
        e.stopPropagation();
        nexus.closeAllOpenPopups(this);

        $("#nexus-main-menu-arrow1").removeAttr("position");
        $("#nexus-main-menu1").removeAttr("position");
        $("#nexus-main-menu-arrow1").fadeToggle(100);
        $('#nexus-main-menu1').slideToggle(150, function () {
            if ($('#nexus-main-menu1').is(':visible')) {
                $("#nexus-toolbar-menu-buttontool a").eq(0).addClass("nexus-opened");


                //$("#nexus-toolbar-menu1").addClass("nexus-opened");

            } else {
                $("#nexus-toolbar-menu-buttontool a").eq(0).removeClass("nexus-opened");
            }
        });
        return false;
    });

    // stop event bubbling to prevent closing menu when clicking an item
    $("#nexus-main-menu1").click(function (e) {

        e.stopPropagation();
    });


    nexus.getMainMenu2(function (data) {
        if (data) {
            var html, n, i;

            html = "<ul>";

            for (n = 0; n < data.length; n++) {

                if (data[n].Url) {
                    html += "<li>";
                    html += "<a target=\"_blank\" href='" + data[n].Url + "'>" + data[n].Name + "</a>";
                    html += "</li>";
                } else if (data[n].SubItems) {
                    html += "<li>";

                    html += "<a target=\"_blank\" href='#' class='nexus-main-menu-open-submenu'>";
                    html += data[n].Title + "<span class='nexus-icon-menu-open'></span>";
                    html += "</a>";

                    html += "<ul class='nexus-main-menu-submenu'>";
                    for (i = 0; i < data[n].SubItems.length; i++) {
                        html += "<li>";
                        html += "<a target=\"_blank\" href='" + data[n].SubItems[i].Url + "'>" + data[n].SubItems[i].Title + "</a>";
                        html += "</li>";
                    }
                    html += "</ul>";

                    html += "</li>";
                }
            }
            html += "</ul>";
            $("#nexus-main-menu1").append(html);



        }
    });



    // --- Notifications Popup ------------------------------------------------------------

    // open notifications
    $("#nexus-toolbar-notifications-area").click(function (e) {
        e.stopPropagation();
        nexus.closeAllOpenPopups(this);
        $("#nexus-toolbar-notifications-popup-arrow").fadeToggle(150);
        $('#nexus-toolbar-notifications-popup').slideToggle(250, function () {
            if ($('#nexus-toolbar-notifications-popup').is(':visible')) {
                $("#nexus-toolbar-notifications-area").addClass("nexus-opened");
                if ($("#nexus-toolbar-notifications-area").text() > 0) {
                    // send message to server to clear notifications
                    nexus.clearNotifications();
                }
            } else {
                $("#nexus-toolbar-notifications-area").removeClass("nexus-opened");
                $("#nexus-toolbar-notifications-area").text("0");
            }
        });
        return false;
    });

    // stop event bubbling to prevent closing menu when clicking an item
    $("#nexus-toolbar-notifications-popup").click(function (e) {
        e.stopPropagation();
        return false;
    });

    var notificationsWidth = $('#nexus-toolbar-notifications-popup').width();

    // notification variables
    nexus.notificationsCurrentPage = 1;
    nexus.notificationsPageCount = 1;
    nexus.notificationsCount = 0;
    nexus.notificationsMaxPerPage = 5;
    nexus.notificationPopupWidth = notificationsWidth ? notificationsWidth : 22;
    nexus.notificationItemHeight = 40;
    nexus.notificationTimeheight = 2;
    // get notifications and display on page
    nexus.getNotifications(function (data) {

        if (data && data.Items) {
            var html, n;

            // set count in toolbar
            nexus.notificationsCount = data.Items.length;
            
            $("#nexus-toolbar-notifications-area").text(nexus.notificationsCount);
            $("#nexus-toolbar-notifications-navigate-left").addClass("nexus-disabled");

            // populate notifications popup
            html = "<ul style='left: 0px;'>";
            for (n = 0; n < nexus.notificationsCount; n++) {
                if (n > 0 && n % nexus.notificationsMaxPerPage === 0) {
                    nexus.notificationsPageCount++;
                    html += "</ul>\n<ul style='left: " + ((nexus.notificationsPageCount - 1) * nexus.notificationPopupWidth) + "px;'>";
                }
                var UTCRegex = /([0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}).(\d)/g;
                var match = UTCRegex.exec(data.Items[n].Timestamp);
                var Time;
                Time = new Date(match[1] + "Z");
              
                // a fix for IE9. IE9 fails on milliseconds with digit counts other than 3, gives "Invalid Date".
                if (isNaN(Time.getTime())) {
                    var parts = (data.Items[n].Timestamp).match(/\d+/g);
                    var isoTime = Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
                    Time = new Date(isoTime);
                }

                var FriendlyTime = SP.DateTimeUtil.SPRelativeDateTime.getRelativeDateTimeString(Time, true, SP.DateTimeUtil.SPCalendarType.none, false);
                html += "<a href='" + data.Items[n].Url + "'><li><span class='nexus-icon-notification'></span> " + data.Items[n].Message + "</li>" +
                "<li style=\"padding-left: 35px;cursor:default;\">" + FriendlyTime + "</li></a>\n";


            }

            html += "</ul>";
            $("#nexus-toolbar-notifications-popup").append(html);

            // set popup height and navigation area
            if (nexus.notificationsCount == 0) {
                $("#nexus-toolbar-notifications-navigate").text("No notifications...");
                $("#nexus-toolbar-notifications-popup").height(nexus.notificationItemHeight);
            } else if (nexus.notificationsPageCount == 1) {
                $("#nexus-toolbar-notifications-navigate").hide();
                $("#nexus-toolbar-notifications-popup").height(nexus.notificationTimeheight * nexus.notificationsCount * nexus.notificationItemHeight);
            } else {
                $("#nexus-toolbar-notifications-popup").height((nexus.notificationTimeheight * nexus.notificationsMaxPerPage * nexus.notificationItemHeight) +nexus.notificationItemHeight);
            }
        }
    });

    // on page flipping, update the navigation area
    nexus.updateNotificationButtons = function () {
        if (nexus.notificationsCurrentPage <= 1) {
            $("#nexus-toolbar-notifications-navigate-left").addClass("nexus-disabled");
            $("#nexus-toolbar-notifications-navigate-right").removeClass("nexus-disabled");
        } else if (nexus.notificationsCurrentPage >= nexus.notificationsPageCount) {
            $("#nexus-toolbar-notifications-navigate-left").removeClass("nexus-disabled");
            $("#nexus-toolbar-notifications-navigate-right").addClass("nexus-disabled");
        } else {
            $("#nexus-toolbar-notifications-navigate-left").removeClass("nexus-disabled");
            $("#nexus-toolbar-notifications-navigate-right").removeClass("nexus-disabled");
        }

        // set pagination info
        var info = nexus.notificationsCurrentPage + " / " + nexus.notificationsPageCount;
        $("#nexus-toolbar-notifications-navigate-info").text(info);
    }
    nexus.updateNotificationButtons();

    // hook up notification arrow buttons
    $("#nexus-toolbar-notifications-navigate-left").click(function (e) {
        if (!$(this).hasClass("nexus-disabled")) {
            $("#nexus-toolbar-notifications-popup ul").animate({ left: "+=" + nexus.notificationPopupWidth }, 100);
            nexus.notificationsCurrentPage--;
            nexus.updateNotificationButtons();
        }
        return false;
    });

    $("#nexus-toolbar-notifications-navigate-right").click(function (e) {
        if (!$(this).hasClass("nexus-disabled")) {
            $("#nexus-toolbar-notifications-popup ul").animate({ left: "-=" + nexus.notificationPopupWidth }, 200);
            nexus.notificationsCurrentPage++;
            nexus.updateNotificationButtons();
        }
        return false;
    });


    // --- Tables ---------------------------------------------------------------

    // select table rows (only for tables with nexus-selectable class)
    var skipTableClick = false;
    $(document).on("click", "table.nexus-selectable tr", function (e) {

        if (skipTableClick) {
            skipTableClick = false;
            return;
        }

        $(this).toggleClass("nexus-selected");

        // add a checkmark if there is a column with nexus-icon-check class
        $(".nexus-selection-col").each(function () {
            var tableCell = $(this);
            if (tableCell.closest("tr").hasClass("nexus-selected")) {
                tableCell.html("<span class='nexus-icon-check'></span>");
            } else {
                tableCell.html("");
            }
        });

        return false;
    });

    $(document).on("click", "table.nexus-selectable a", function (e) {
        // Note: Dont' want to select rows, but can't use stopPropagation() here because then SharePoint "callouts" will not close when clicking on other ellipsis
        skipTableClick = true;
    });


    // --- My Equipment ---------------------------------------------------------------
    $(document).on("click", ".nexus-equipment-menu-heading", function (e) {
        var submenu = $(this).parent().children("ul");
        var icon = $(this).children("span");
        if (!submenu.is(":visible")) {
            submenu.slideToggle(150);
            icon.addClass("nexus-icon-open");
        } else {
            submenu.slideToggle(150);
            icon.removeClass("nexus-icon-open");
        }

    });


    // Scroll content inside widgets where nexus-scrollable class is set (+ required div containers)

    var step = 250;

    $(document).on("click", ".nexus-scrollable-container .nexus-scrollable-button-up", function (event) {
        event.preventDefault();
        $(this).siblings(".nexus-scrollable-div").animate({
            scrollTop: "-=" + step + "px"
        });
    });

    $(document).on("click", ".nexus-scrollable-container .nexus-scrollable-button-down", function (event) {
        event.preventDefault();
        $(this).siblings(".nexus-scrollable-div").animate({
            scrollTop: "+=" + step + "px"
        });
    });


    // --- My Contacts ---------------------------------------------------------------

    var currentlySelectedContact = null;

    // the filler div is used to make the background white if not enough person cards to fill up the whole height
    var updateMyContactsFiller = function () {
        if ($(".nexus-my-contacts-filler").length > 0) {

            if ($("#nexus-my-contacts-details").position().top > ($("#nexus-my-contacts-persons").position().top)) {
                return;
            }

            var myContactsParentHeight = $(".nexus-my-contacts-filler").parent().parent().height();
            var myContactsSiblingHeight = 0;
            $(".nexus-my-contacts-filler").siblings().each(function () {
                myContactsSiblingHeight += $(this).outerHeight();
            });
            if (myContactsParentHeight > myContactsSiblingHeight) {
                $(".nexus-my-contacts-filler").height((myContactsParentHeight - myContactsSiblingHeight) + "px");
            }
        }
    }
    updateMyContactsFiller();

    // select a person in the my contacts widget
    $(document).on("mouseover", ".nexus-my-contacts-person", function () {
        currentlySelectedContact = this;
        if ($(currentlySelectedContact).hasClass("nexus-selected")) return;	// already seected
        
        // slide in new details
        $("#nexus-my-contacts-details").animate({ opacity: 0, top: "300" }, 300, function () {
            // read details from data-* attributes and copy to html
            $("#nexus-my-contacts-details-description").text($(currentlySelectedContact).data("description"));
            $("#nexus-my-contacts-details-tel a").text($(currentlySelectedContact).data("tel"));
            $("#nexus-my-contacts-details-tel a").attr("href", "tel:" + $(currentlySelectedContact).data("tel"));
            $("#nexus-my-contacts-details-mail a").text($(currentlySelectedContact).data("mail"));
            $("#nexus-my-contacts-details-mail a").attr("href", "mailto:" + $(currentlySelectedContact).data("mail"));
            $("#nexus-my-contacts-details-comment textarea").val($(currentlySelectedContact).data("comment"));
            $("#nexus-my-contacts-details-comment textarea").attr("name", $(currentlySelectedContact).data("id"));
            $(this).css("top", "-200px");
            updateMyContactsFiller();
        }).stop(true, true).animate({ opacity: 1, top: "0" }, 300);

        // change selected
        $(".nexus-my-contacts-person").removeClass("nexus-selected");
        $(".nexus-my-contacts-person").css('background', '');
        $(currentlySelectedContact).css('background', '#e6f2fa');
        $(currentlySelectedContact).addClass("nexus-selected");

        return false;
    });

    // select all text on focus
    $(document).on("focus", "#nexus-my-contacts-comment-form", function () {
        this.select();
    });

    // save button
    $(document).on("click", "#nexus-my-contacts-comment-save", function () {

        if (currentlySelectedContact === null) {
            currentlySelectedContact = $('.nexus-selected');
        }
        
        if (currentlySelectedContact) {

            $("#nexus-my-contacts-details-comment-feedback").fadeOut(function () {
                var newText = $("#nexus-my-contacts-details-comment-feedback").data("caption-saving");
                $("#nexus-my-contacts-details-comment-feedback").hide().html(newText).fadeIn(function () {
                    $("#nexus-my-contacts-details-comment-feedback").delay(1000).fadeOut();
                });
            });

            nexus.saveMyContactsComment();
        }
        return false;
    });

    // remove button
    $(document).on("click", "#nexus-my-contacts-comment-delete", function () {

        if (currentlySelectedContact === null) {
            currentlySelectedContact = $('.nexus-selected');
        }

        if (currentlySelectedContact) {
            $("#nexus-my-contacts-details-comment textarea").val("");	// clear the comment

            $("#nexus-my-contacts-details-comment-feedback").fadeOut(function () {
                var newText = $("#nexus-my-contacts-details-comment-feedback").data("caption-removed");
                $("#nexus-my-contacts-details-comment-feedback").hide().html(newText).fadeIn(function () {
                    $("#nexus-my-contacts-details-comment-feedback").delay(1000).fadeOut();
                });
            });

            nexus.saveMyContactsComment();
        }
        return false;
    });



    // select the first contact at startup
    nexus.initMyContacts = function () {
        if ($(".nexus-my-contacts-person").length > 0) {
            $(".nexus-my-contacts-person").first().mouseover();
        }
    }
    nexus.initMyContacts();


    // --- Hookup "callouts" ---------------------------------------------------------------

    $(document).on("click", ".nexus-comment-box-save", function () {
        // visual feedback
        var feedbackArea = $(this).parent().parent().find(".nexus-comment-box-feedback");
        feedbackArea.fadeOut(function () {
            var newText = feedbackArea.data("caption-saving");
            feedbackArea.hide().html(newText).fadeIn(function () {
                feedbackArea.delay(1000).fadeOut(function () {
                    newText = feedbackArea.data("caption-default");
                    feedbackArea.hide().html(newText).fadeIn();
                });
            });
        });

        // call webservice
        var commentArea = $(this).parent().parent().find(".nexus-comment-box-form");
        nexus.saveCalloutComment(commentArea.data("item-id"), commentArea.val());

        // update comment in markup link
        $("a[data-callout-item-id='" + commentArea.data("item-id") + "']").data("callout-comment", commentArea.val());
    });

    $(document).on("click", ".nexus-comment-box-delete", function () {
        // visual feedback
        var feedbackArea = $(this).parent().parent().find(".nexus-comment-box-feedback");
        feedbackArea.fadeOut(function () {
            var newText = feedbackArea.data("caption-removed");
            feedbackArea.hide().html(newText).fadeIn(function () {
                feedbackArea.delay(1000).fadeOut(function () {
                    newText = feedbackArea.data("caption-default");
                    feedbackArea.hide().html(newText).fadeIn();
                });
            });
        });

        // call webservice
        var commentArea = $(this).parent().parent().find(".nexus-comment-box-form");
        commentArea.val("");	// clear the comment
        nexus.saveCalloutComment(commentArea.data("item-id"), commentArea.val());

        // update comment in markup link
        $("a[data-callout-item-id='" + commentArea.data("item-id") + "']").data("callout-comment", commentArea.val());
    });

    nexus.initCallouts = function () {
        if (SP) {
            SP.SOD.executeFunc("callout.js", "Callout", function () {
                // setup callouts
                // ref: https://msdn.microsoft.com/en-us/library/office/dn135236.aspx

                $(".nexus-callout:not(.nexus-initialized)").each(function () {
                    var id, title, calloutContent, callout, calloutAction, comment, description, itemId;
                    var clickedLink = $(this);

                    // mark as initialized
                    $(this).addClass("nexus-initialized");

                    var contentElement = clickedLink.closest("article").find(".nexus-callout-content-container");
                    if (contentElement[0] == undefined) {
                        nexus.log(jsclient.loglevel, "No callout content element found.");
                    }

                    // all callouts use the same content element, so we need to populate it before it is shown
                    var populateCallout = function () {
                        contentElement.find(".nexus-callout-description").text(clickedLink.data("callout-description"));
                        if (clickedLink.data("callout-comment") != undefined) {
                            contentElement.find(".nexus-comment-box").show();
                            contentElement.find(".nexus-comment-box-feedback").text(contentElement.find(".nexus-comment-box-feedback").data("caption-default"));
                            contentElement.find(".nexus-comment-box-feedback").show();

                            nexus.loadComment(contentElement.find(".nexus-comment-box-form"), clickedLink.data("callout-item-id"));
                            contentElement.find(".nexus-comment-box-form").val(clickedLink.data("callout-comment"));
                            contentElement.find(".nexus-comment-box-form").data("item-id", clickedLink.data("callout-item-id"));
                        } else {
                            contentElement.find(".nexus-comment-box").hide();
                        }
                    }
                    // create the callout
                    callout = CalloutManager.createNew({
                        launchPoint: clickedLink[0],
                        ID: "callout" + Math.random().toString(),	// each callout must have a unique id,
                        title: clickedLink.data("callout-title"),
                        contentElement: contentElement[0],
                        beakOrientation: "leftRight",
                        onOpeningCallback: populateCallout
                    });


                    // add the links at the bottom of the callout (up to three, if defined)

                    if (clickedLink.data("callout-link1-caption") != undefined) {
                        calloutAction = new CalloutAction({
                            text: clickedLink.data("callout-link1-caption"),
                            onClickCallback: function () {
                                nexus.gotoPage(clickedLink.data("callout-link1-url"));
                            }
                        });
                        callout.addAction(calloutAction);
                    }

                    if (clickedLink.data("callout-link2-caption") != undefined) {
                        calloutAction = new CalloutAction({
                            text: clickedLink.data("callout-link2-caption"),
                            onClickCallback: function () {
                                var url = clickedLink.data("callout-link2-url");
                                if (clickedLink.data("callout-link2-target") === "_blank") {
                                    window.open(url, "_blank");
                                }
                                else {
                                    nexus.gotoPage(url);
                                }
                            }
                        });
                        callout.addAction(calloutAction);
                    }



                    if (clickedLink.data("callout-link3-caption") != undefined) {
                        calloutAction = new CalloutAction({
                            text: clickedLink.data("callout-link3-caption"),
                            onClickCallback: function () {
                                nexus.gotoPage(clickedLink.data("callout-link3-url"));
                            }
                        });
                        callout.addAction(calloutAction);
                    }
                });
            });
        }
    }
    nexus.initCallouts();

    // --- Panels -------------------------------------------------------------

    nexus.showPanel = function (panelBaseId, panelNumberToShow) {
        if ($("#" + panelBaseId + " > .nexus-panel:visible").length == 0) {	// first time nothing is visible
            $("#" + panelBaseId + "-" + panelNumberToShow).fadeIn(200);
        } else {
            $("#" + panelBaseId + " > .nexus-panel:visible").fadeOut(200, function () {
                $("#" + panelBaseId + "-" + panelNumberToShow).fadeIn(200);
            });
        }
    }

    // --- Dropdown Controls --------------------------------------------------

    nexus.initDropdowns = function () {
        $(".nexus-dropdown:not(.nexus-initialized):not(.nexus-dropdown-full-width)").each(function () {
            // dynamically set width of dropdown "button"
            var items = $(this).find(".nexus-dropdown-list li");
            var i, max = $(this).find(".nexus-dropdown-selected-value").outerWidth(true);
            for (i = 0; i < items.length; i++) {
                $(this).find(".nexus-dropdown-selected-value").text($(items[i]).text());
                max = Math.max(max, $(this).find(".nexus-dropdown-selected-value").outerWidth(true));
            }
            var buttonWidth = $(this).find(".nexus-dropdown-button").outerWidth(true);
            var margin = 10;
            $(this).find(".nexus-dropdown-selected-value:not(#nexus-project-status-selected-value)").width(max + margin + buttonWidth);
        });

        $(".nexus-dropdown:not(.nexus-initialized)").each(function () {

            // mark as initialized
            $(this).addClass("nexus-initialized");

            // set default value and show default panel
            var selectedKey = $(this).data("selected-key");
            var selectedValue = $(this).find("[data-key='" + selectedKey + "']").text();
            $(this).find(".nexus-dropdown-selected-value").text(selectedValue);

            // show panel (note: this must run after donut charts have been generated, or else it will fail since there will be duplicate id:s)
            nexus.showPanel($(this).data("panel-base-id"), selectedKey);

            // hockup click events

            $(this).click(function (e) {
                e.stopPropagation();
                nexus.closeAllOpenPopups(this);

                var dropDownButton = $(this);
                var dropDownList = $(this).find(".nexus-dropdown-list");

                dropDownList.slideToggle(150, function () {
                    if (dropDownList.is(':visible')) {
                        dropDownButton.addClass("nexus-opened");
                    } else {
                        dropDownButton.removeClass("nexus-opened");
                    }
                });
                return false;
            });

            $(this).find("li").click(function (e) {
                e.stopPropagation();

                var newKey = $(this).data("key");
                var newValue = $(this).text();

                $(this).closest(".nexus-dropdown").click();

                var parent = $(this).closest(".nexus-dropdown");
                if (parent.data("selected-key") == newKey) return;
                parent.data("selected-key", newKey);
                parent.find(".nexus-dropdown-selected-value").text(newValue);

                // when selecting a dropdown list item, show the corresponding "panel"
                nexus.showPanel(parent.data("panel-base-id"), newKey);

                return false;
            });


        });
    }
    nexus.initDropdowns();

    // --- Text Tabs ----------------------------------------------------------

    nexus.initTextTabs = function () {
        $(".nexus-text-tabs:not(.nexus-initialized)").each(function () {

            // mark as initialized
            $(this).addClass("nexus-initialized");

            // show default panel
            var selectedKey = $(this).data("selected-key");
            nexus.showPanel($(this).data("panel-base-id"), selectedKey);
        });
    }
    nexus.initTextTabs();

    $(document).on("click", ".nexus-text-tab", function () {
        $(this).siblings().removeClass("nexus-selected");
        $(this).addClass("nexus-selected");
        var newKey = $(this).data("key");
        var parent = $(this).closest(".nexus-text-tabs");
        if (parent.data("selected-key") == newKey) return;
        parent.data("selected-key", newKey);
        nexus.showPanel(parent.data("panel-base-id"), newKey);
    });

    // --- Collapse Widgets ---------------------------------------------------

    $(".nexus-header-collapsable-caption-show").hide();

    $(document).on("click", ".nexus-header-collapsable", function (e) {
        e.stopPropagation();

        var clickedLink = $(this);

        clickedLink.closest("header").nextAll("section").each(function () {
            var section = $(this);
            section.slideToggle(150, function () {
                var caption = clickedLink.find(".nexus-header-collapsable-caption");
                if (section.is(':visible')) {
                    caption.text(caption.data("caption-hide"));
                } else {
                    caption.text(caption.data("caption-show"));
                }
            });
        });
        clickedLink.find(".nexus-icon-menu-open").toggleClass("nexus-rotated");
        return false;
    });

    // --- Dialogs ------------------------------------------------------------

    nexus.showDialog = function (title, htmlContent) {

        var htmlElement = document.createElement('div');
        $(htmlElement).html(htmlContent += "<p style='margin-top: 1em;'><button style='float:right;' onClick='SP.UI.ModalDialog.commonModalDialogClose();'>Close</button></p>");

        var options = {
            title: title,
            html: htmlElement,
            autoSize: true,
            showClose: true,
            width: 360,
            height: 100
        };

        SP.SOD.execute('sp.ui.dialog.js', 'SP.UI.ModalDialog.showModalDialog', options);
    }

    nexus.showWelcomeDialog = function (title, htmlContent) {

        var htmlElement = document.createElement('div');
        $(htmlElement).html(htmlContent += "<p style='margin-top: 1em;'><button style='float:right;' onClick='SP.UI.ModalDialog.commonModalDialogClose();'>Close</button></p>");

        var options = {
            title: title,
            html: htmlElement,
            autoSize: true,
            showClose: true,
            width: 360,
            height: 300
        };

        SP.SOD.execute('sp.ui.dialog.js', 'SP.UI.ModalDialog.showModalDialog', options);
    }

    // --- Free floating header, a web part that is just the header, and should, graphically, connect with the following web part  ------------------------------------------
    var connectHeaderWidgetToNextWebPart = function () {
        var headerWidget = $('.nexus-widget-header-widget');
        var parentWebPart = headerWidget.parents('.s4-wpcell-plain');
        parentWebPart.addClass('nexus-webpart-header-widget');
    }();



    // --- Search in responsive mode ------------------------------------------

    $("#nexus-toolbar-search-button").click(function () {
        $("#nexus-responsive-search").animate({
            top: 0
        }, 300);
    });
    $("#nexus-responsive-search-close-button").click(function () {
        $("#nexus-responsive-search").animate({
            top: -70
        }, 300);

    });


    // --- Infobar ------------------------------------------------------------

    function resizeCampaignBanner() {
        //Get max height all text field in campaign banner
        var maxHeight = 165;
        $('.nexus-infobar-content-container').each(function () {
            maxHeight = maxHeight > $(this).outerHeight() ? maxHeight : $(this).outerHeight();
        });
        //Set all our rotator objects to correct height
        $('.nexus-campaign-rotator-item').css('height', maxHeight);
    }

    if ($("#nexus-infobar").length > 0) {

        nexus.getInfobarData(function (data) {
            infobarData = data;
            //$("#nexus-infobar-welcome .nexus-infobar-content-container").html(data.WelcomeText);
            $("#nexus-infobar-status .nexus-infobar-content-container").html(data.SnapshotText.Text);

            bindSnapshot();

            getCurrentUserId(); // bind welcome text or survey
            if (!!data.Campaigns) {
                if (data.Campaigns.length > 0) {
                    // show campaign (rotate, if multiple)
                    var appendHtml = '';// = '<div id="nexus-campaign-items-rotator">';

                    //Add container for rotator
                    var containerHtml = '<div id="nexus-campaign-rotator-container" style="margin-right: -15px; min-height: 165px;"></div>';
                    $('#nexus-infobar-campaign').removeAttr('style');
                    $('#nexus-infobar-campaign').css("padding-left", "0");
                    $('#nexus-infobar-campaign').html(containerHtml);

                    for (var i = 0; i < data.Campaigns.length; i++) {
                        var imageUrl = data.Campaigns[i].ImageUrl;
                        imageUrl = imageUrl.substring(0, imageUrl.indexOf('?'));

                        if (!!imageUrl) {

                            var category = data.Campaigns[i].Category;
                            var catText = '&category1=';
                            if (category !== null) {
                                catText += category;
                            }
                            var interest = data.Campaigns[i].Interest;
                            var intText = '&interest1=';
                            if (interest !== null) {
                                intText += interest;
                            }

                            imageUrl = imageUrl.replace('http://', 'https://');
                            var campaignURL = '/Pages/news.aspx?articleid=' + data.Campaigns[i].SharePointID + catText + intText;
                            appendHtml += '<a href="' + campaignURL + '" style="padding-left: 0px;"><img class="nexus-campaign-rotator-item" src="' + imageUrl + '">';
                        }
                    }

                    $('#nexus-campaign-rotator-container').html(appendHtml);

                    //No need for cycle if we only have one campaign
                    if (data.Campaigns.length > 1) {
                        $('#nexus-campaign-rotator-container').cycleContent({
                            speed: 750, displaytime: 5000
                        });
                    }
                    //Set campaign banner image to correct size
                    resizeCampaignBanner();
                    //_spBodyOnLoadFunctionNames.push("resizeCampaignBanner");
                    
                    //Set campaign banner image to correct size when user resize browser
                    $(function () {
                        $(window).resize(function () {
                            resizeCampaignBanner();
                        });
                    });
                }
                else {
                    // show latest news article
                     getMostRecentNewsArticle();
                }
            }
            else {
                // show latest news article
                 getMostRecentNewsArticle();
            }
        });
    }

    nexus.getNewsData(function (data) {
        // $("#nexus-infobar-campaign").css('background-image', 'url('+ data[0].PictureUrl + ')');
    });

    var a = true == 1 ? "ja" : "nej";
    // --- Form Validation ----------------------------------------------------

    // Validation funtions
    nexus.validateText = function (text) {
        return text.trim() != "";
    }
    nexus.validateEmail = function (email) {
        return /^.+@.+$/.test(email);          // Valid: a@b
        //return /^.+@.+\..+$/.test(email);    // Valid: a@b.c
    }

    // Hide error fields at start
    $(".nexus-form-field-error").each(function () {
        $(this).hide();
    });

    // Validate input controls. Shows/Hides the error labels on required input. Returns a bool indicating if the form is valid or not.
    nexus.validateNexusForm = function (FormID) {
        var allItemsValid = true;
        var sFormId = FormID + " input[type=text]";
        var sFormEmail = FormID + " input[type=email]";
        var sFormdates = FormID + " input[type=date]";
        var sFormDropdown = FormID + " select";
        // text inputs
        $(sFormId).each(function () {
            var required = $(this).closest(".nexus-form-field").hasClass("nexus-required");
            var value = $(this).val();
            if (required && !nexus.validateText(value)) {
                allItemsValid = false;
                $(this).addClass("nexus-required");
                $(this).parent().find(".nexus-form-field-error").text("This field is required").slideDown(150);
            } else {
                $(this).removeClass("nexus-required");
                $(this).parent().find(".nexus-form-field-error").hide(150);
            }

        });

        // email inputs
        $(sFormEmail).each(function () {
            var required = $(this).closest(".nexus-form-field").hasClass("nexus-required");
            var value = $(this).val();
            if (required && !nexus.validateEmail(value)) {
                allItemsValid = false;
                $(this).addClass("nexus-required");
                $(this).parent().find(".nexus-form-field-error").text("Not a valid email address").slideDown(150);
            } else {
                $(this).removeClass("nexus-required");
                $(this).parent().find(".nexus-form-field-error").hide(150);
            }
        });

        // date controls
        $(sFormdates).each(function () {
            var required = $(this).closest(".nexus-form-field").hasClass("nexus-required");
            var value = $(this).val();
            if (required) {
                allItemsValid = false;
                $(this).addClass("nexus-required");
                $(this).parent().find(".nexus-form-field-error").text("Please select valid date.").slideDown(150);
            } else {
                $(this).removeClass("nexus-required");
                $(this).parent().find(".nexus-form-field-error").hide(150);
            }
        });

        // select inputs
        $(sFormDropdown).each(function () {
            var required = $(this).closest(".nexus-form-field").hasClass("nexus-required");
            var value = $(this).val();
            if (required && value == "") {
                allItemsValid = false;
                $(this).addClass("nexus-required");
                $(this).parent().find(".nexus-form-field-error").text("This field is required").slideDown(150);
            } else {
                $(this).removeClass("nexus-required");
                $(this).parent().find(".nexus-form-field-error").hide(150);
            }

        });
        nexus.log(jsclient.loglevel, "Form is valid: " + allItemsValid);
        return allItemsValid;
    }

    window.disableAllPqSelects = function () {
        $('#dvInterests').pqSelect("disable");
        $('#dvEquipmntShips').pqSelect("disable");
        $('#dvEquipmntEngTypes').pqSelect("disable");
        $('#dvPowerplants').pqSelect("disable");
        $('#dvTurbochargers').pqSelect("disable");
    }
    ///IE 9 Fix for  direct contact - placeholder
    nexus.setup_placeholders = function () {
        $.support.placeholder = false;
        var test = document.createElement('input');
        if ('placeholder' in test) {
            $.support.placeholder = true;
            return function () { }
        } else {
            $('#txtdcMessage').on('focus', function () {
                if ($(this).val() === 'What\'s on your mind?') {
                    $(this).val('');
                }
            }).on('blur', function () {
                if ($('#txtdcMessage').val() === '')
                    $('#txtdcMessage').val('What\'s on your mind?');
            }).blur();

        }
    }
    nexus.setup_placeholders();


    ///
    //----- My Profile Page - Info Area widget---------------------------------
    //For Get/Updating Personal Info
    $(document).on("click", "#nexus-Personalinfo-save", function () {
        nexus.log(jsclient.loglevel, 'Called Personal info save.');
        //var userFormData = {"ID": nexus.currentUserAccountName,
        //    "gender" : $("#nexusPersInfoWdgt select[name=Gender]").val(),"FirstName": $("#nexusPersInfoWdgt input[name=FirstName]").val(), "MiddleName": $("#nexusPersInfoWdgt input[name=MiddleName]").val(), "LastName": $("#nexusPersInfoWdgt input[name=LastName]").val(),
        //    "JobTitle": $("#nexusPersInfoWdgt input[name=JobTitle]").val(), "Phone": $("#nexusPersInfoWdgt input[name=Phone]").val(), "MobilePhone": $("#nexusPersInfoWdgt input[name=MobilePhone]").val(), "Email": $("#nexusPersInfoWdgt input[name=Email]").val(), "ID": 'testhekn01'
        //};
        var userFormData = '';
        var sUserType = $("#nexusPersInfoWdgt input[id=hdUserType]").val();
        if (sUserType.toLowerCase() != 'Internal user'.toLowerCase()) {
            userFormData += userFormData + "gender=" + encodeURIComponent($("#nexusPersInfoWdgt select[name=Gender]").val()) + "&firstname=" + encodeURIComponent($("#nexusPersInfoWdgt input[name=FirstName]").val().trim()) + "&middlename=" + encodeURIComponent($("#nexusPersInfoWdgt input[name=MiddleName]").val().trim()) +
                                "&lastname=" + encodeURIComponent($("#nexusPersInfoWdgt input[name=LastName]").val().trim()) + "&jobtitle=" + encodeURIComponent($("#nexusPersInfoWdgt input[name=JobTitle]").val().trim()) +
                                "&phone=" + encodeURIComponent($("#nexusPersInfoWdgt input[name=Phone]").val().trim()) + "&mobilephone=" + encodeURIComponent($("#nexusPersInfoWdgt input[name=MobilePhone]").val().trim()) +
                                "&email=" + encodeURIComponent($("#nexusPersInfoWdgt input[name=Email]").val().trim());
            //userFormData = {"ID": nexus.currentUserAccountName,
            //    "gender" : $("#nexusPersInfoWdgt select[name=Gender]").val(),"FirstName": $("#nexusPersInfoWdgt input[name=FirstName]").val(), "MiddleName": $("#nexusPersInfoWdgt input[name=MiddleName]").val(), "LastName": $("#nexusPersInfoWdgt input[name=LastName]").val(),
            //    "JobTitle": $("#nexusPersInfoWdgt input[name=JobTitle]").val(), "Phone": $("#nexusPersInfoWdgt input[name=Phone]").val(), "MobilePhone": $("#nexusPersInfoWdgt input[name=MobilePhone]").val(), "Email": $("#nexusPersInfoWdgt input[name=Email]").val()
            //};
            
            nexus.log(jsclient.loglevel, userFormData);
            if (nexus.validateNexusForm('#nexusPersInfoWdgt')) {
                nexus.UpdatePersonalInfo(userFormData);
            }
        }
        if (sUserType.toLowerCase() === 'Internal user'.toLowerCase()) {
            //userFormData += userFormData + "ID=" + nexus.currentUserAccountName + "&deputy=" + $("#nexusPersInfoWdgt select[name=InternalDeputy]").val() + "&AbsentFrom=" + $("#nexusPersInfoWdgt input[name=AbsentFrom]").val()
            //                + "&AbsentTo=" + $("#nexusPersInfoWdgt input[name=AbsentTo]").val();
            userFormData = {
                "ID": nexus.currentUserAccountName, "Role": $("#nexusPersInfoWdgt input[id=hdUserRole]").val(), "Deputy": $("#nexusPersInfoWdgt select[name=InternalDeputy]").val(), "AbsentFrom": $("#nexusPersInfoWdgt input[name=AbsentFrom]").val(), "AbsentTo": $("#nexusPersInfoWdgt input[name=AbsentTo]").val()
            };

            nexus.log(jsclient.loglevel, userFormData);
            if (nexus.validateNexusForm('#divPersInfoEditInterUser')) {
                nexus.UpdatePersonalInfoInternalUser(userFormData);
            }
        }

    });
    $(document).on("click", "#nexus-Personalinfo-edit", function () {
        var sUserType = $("#nexusPersInfoWdgt input[id=hdUserType]").val();
        if (sUserType.toLowerCase() === 'Internal user'.toLowerCase()) 
            nexus.getMyProfile(false,true);
        else
            nexus.getMyProfile(false,false);
    });
    $(document).on("click", "#nexus-Personalinfo-cancel", function () {

        var sFormId = "#nexusPersInfoWdgt input[type=text]";
        var sFormEmail = "#nexusPersInfoWdgt input[type=email]";
        // text inputs
        $(sFormId).each(function () {
            $(this).removeClass("nexus-required");
            $(this).parent().find(".nexus-form-field-error").hide(150);
        });
        $(sFormEmail).each(function () {
            $(this).removeClass("nexus-required");
            $(this).parent().find(".nexus-form-field-error").hide(150);
        });
        nexus.getMyProfile(false);
        //nexus.togglePersonalInfoButtons();
    });

    ////////////For suggesting Company Info///////////

    $(document).on("click", "#nexus-PersCompinfo-save", function () {
        var SupplierIDval = $("#nexusPersCmpInfoWdgt input[name=SupplierID]").val() == undefined ? '' : $("#nexusPersCmpInfoWdgt input[name=SupplierID]").val().trim();
        //var CustomerIDval = $("#nexusPersCmpInfoWdgt input[name=SupplierID]").val();
        nexus.log(jsclient.loglevel, "Called Company info save.");
        var userCompanyDataJson = {
            "ID": $("#nexusPersCmpInfoWdgt input[name=CompanydataID]").val(), "CustomerID": $("#nexusPersCmpInfoWdgt input[name=CompCustomerNumber]").val(), "Address": $("#nexusPersCmpInfoWdgt input[name=CompAddress]").val().trim(),
            "Company": $("#nexusPersCmpInfoWdgt input[name=CompanyName]").val().trim(), "PostCode": $("#nexusPersCmpInfoWdgt input[name=CompPostCode]").val().trim(),
            "City": $("#nexusPersCmpInfoWdgt input[name=CompCity]").val().trim(), "Country": $("#nexusPersCmpInfoWdgt select[name=CompCountry]").val().trim(),
            "CompanyPhone": $("#nexusPersCmpInfoWdgt input[name=CompanyPhone]").val().trim(), "Web": $("#nexusPersCmpInfoWdgt input[name=CompWeb]").val().trim()
        };
        if (SupplierIDval != "")
            userCompanyDataJson["SupplierID"] = SupplierIDval;
        //var userCompanyData = "CustomerNumber=" + $("#nexusPersCmpInfoWdgt input[name=CompCustomerNumber]").val() + SupplierIDval + "&Address=" + $("#nexusPersCmpInfoWdgt input[name=CompAddress]").val().trim() +
        //                    "&Company=" + $("#nexusPersCmpInfoWdgt input[name=CompanyName]").val().trim() + "&PostCode=" + $("#nexusPersCmpInfoWdgt input[name=CompPostCode]").val().trim() +
        //                    "&City=" + $("#nexusPersCmpInfoWdgt input[name=CompCity]").val().trim() + "&Country=" + $("#nexusPersCmpInfoWdgt select[name=CompCountry]").val().trim() +
        //                    "&CompanyPhone=" + $("#nexusPersCmpInfoWdgt input[name=CompanyPhone]").val().trim() + "&Web=" + $("#nexusPersCmpInfoWdgt input[name=CompWeb]").val().trim();
        //encodeURIComponent(userFormData);
        nexus.log(jsclient.loglevel, userCompanyDataJson);
        if (nexus.validateNexusForm('#nexusPersCmpInfoWdgt')) {
            nexus.UpdateCompanyInfo(userCompanyDataJson);
        }
    });
    $(document).on("click", "#nexus-PersCompinfo-suggest", function () {
        var userCompCountry = $('#dvCompnyCountries').val();
        nexus.loadCountries(userCompCountry);
    });
    $(document).on("click", "#nexus-PersCompinfo-cancel", function () {
        var sFormId = "#nexusPersCmpInfoWdgt input[type=text]";
        //var sFormEmail = "#nexusPersCmpInfoWdgt input[type=email]";
        // text inputs
        $(sFormId).each(function () {
            $(this).removeClass("nexus-required");
            $(this).parent().find(".nexus-form-field-error").hide(150);
    });
        
        nexus.getMyCompanyInfo();
    });
    ////////////For suggesting Company Info///////////

    //For Get/Update Personal Interests
    $(document).on("click", "#nexus-Get-Interests", function () {
        //selectedInterests	          
        window.userinterests = [];
        nexus.loadUserIntrests();
        $('#dvInterests').pqSelect("enable");
        nexus.toggleInterestButtons();
    });
    $(document).on("click", "#nexus-PersonalInterests-save", function () {
        var Jsondata = [];
        CreateJsonForSelectOptions(Jsondata, '#dvInterests', window.userinterests, window.AllInterests);
        nexus.log(jsclient.loglevel, Jsondata);
        nexus.UpdateUserInterests(JSON.stringify(Jsondata));
        $('#dvInterests').pqSelect("disable");
        nexus.toggleInterestButtons();
    });

    $(document).on("click", "#nexus-PersonalInterests-AddNew", function () {
        if (nexus.validateNexusForm('#dvAddIntersts')) {

            var newInterestsgg = $('#txtnewInterest').val().trim();
            newInterestsgg = newInterestsgg.replace(/\s+/g, " "); //newInterestsgg.replace(/[ ]{2,}/, ' ');
            //window.NewInterestJson.push({ ID: null, Name: newInterestsgg, Status: 1 });
            //window.userinterests.push({ ID: null, Name: newInterestsgg, Status: 1 });
            if ($("#dvInterests option:contains('" + newInterestsgg + "')").length == 0) {
                $('#dvInterests')
                        .append($("<option></option>")
                        .attr("value", newInterestsgg)
                        .text(newInterestsgg)
                        .attr('selected', true)
                        );
                $('#dvInterests').pqSelect("refreshData");
                $('#txtnewInterest').val('');
                window.userinterests.push({ ID: newInterestsgg, Name: newInterestsgg, Status: 1 });

            } else
                nexus.showDialog('Alert', 'Cannot add same Interest !');
        }
    });
    $(document).on("click", "#nexus-Cancel-Interests", function (cont, e) {
        nexus.loadUserIntrests();
        $('#dvInterests').pqSelect("disable");
        nexus.toggleInterestButtons();
        $('#txtnewInterest').val('');
    });

    //For Get/Update User Equipments/Ships
    $(document).on("click", "#nexus-EquipmentInfo-suggest", function () {
        //debugger;
        window.userEquipShips = [];
        window.userEquipEngines = [];
        window.userPowerPlants = [];
        window.userTurbochargers = [];
        nexus.loadUserShipsEquipments();
        $('#dvEquipmntShips').pqSelect("enable");
        $('#dvEquipmntEngTypes').pqSelect("enable");
        $('#dvPowerplants').pqSelect("enable");
        $('#dvTurbochargers').pqSelect("enable");
        nexus.toggleEquipmentInfoButtons();
    });
    $(document).on("click", "#nexus-EquipmentInfo-save", function () {
        //debugger;
        var Jsondata1 = [];
        var	Jsondata2 = [];
        var Jsondata3 = [];
        var Jsondata4 = [];
        if ($('#dvEquipmntShips').parent().is(":visible"))
            Jsondata1 = CreateJsonForSelectOptions(Jsondata1, '#dvEquipmntShips', window.userEquipShips, window.AllEquipShips);
        if ($('#dvEquipmntEngTypes').parent().is(":visible"))
            Jsondata2 = CreateJsonForSelectOptions(Jsondata2, '#dvEquipmntEngTypes', window.userEquipEngines, window.AllEquipEngines);
        if ($('#dvPowerplants').parent().is(":visible"))
            Jsondata3 = CreateJsonForSelectOptions(Jsondata3, '#dvPowerplants', window.userPowerPlants, window.AllPlants);
        if ($('#dvTurbochargers').parent().is(":visible"))
            Jsondata4 = CreateJsonForSelectOptions(Jsondata4, '#dvTurbochargers', window.userTurbochargers, window.AllTurbochargers);
        //debugger;
        $.grep(Jsondata2, function (ele) {
            Jsondata1.push(ele);
        });
        $.grep(Jsondata3, function (ele) {
            Jsondata1.push(ele);
        });
        $.grep(Jsondata4, function (ele) {
            Jsondata1.push(ele);
        });
        //debugger;
        console.log(JSON.stringify(Jsondata1));
        nexus.UpdateUserEquipments(JSON.stringify(Jsondata1));

        $('#dvEquipmntShips').pqSelect("disable");
        $('#dvEquipmntEngTypes').pqSelect("disable");
        $('#dvPowerplants').pqSelect("disable");
        $('#dvTurbochargers').pqSelect("disable");
        nexus.toggleEquipmentInfoButtons();
    });

    function CreateJsonForSelectOptions(Jsondata, selectControl, UserSelectedItems, AllAvailableItems) {
        var currentSelectionItems = $(selectControl).val();
        ///For Ships
        if (currentSelectionItems!=null) {
            $.each(currentSelectionItems, function (key, value) {
                var currentShipSelection = $.grep(AllAvailableItems, function (e) {
                    return (e.ID == value)
                })[0];
                if (currentShipSelection != undefined) {
                    Jsondata.push(currentShipSelection);
                }

            });
        }
        //adding deleted items to jsonobject and setting the status to 3=deleted
        var deletedItems = $.grep(UserSelectedItems, function (e) {
            return (e.Status == 3)
        });
        if (deletedItems != undefined) {
            if (deletedItems.length == 1) {
                Jsondata.push(deletedItems);
            }
            if (deletedItems.length > 1) {
                $.grep(deletedItems, function (ele) {
                    Jsondata.push(ele);
                });
            }
        }
        //Set the status of items to 2=Added for Newly added Items from available list
        $.each(Jsondata, function (key, value) {
            if (UserSelectedItems.length == 0) {
                value.Status = 2;
            }
            if (UserSelectedItems.length > 0) {
                var objNewInterest = $.grep(UserSelectedItems, function (e) {
                    return (e.ID == value.ID)
                })[0];
                if (objNewInterest == undefined) {
                    value.Status = 2;
                }
            }
        });
        //Set the status of items to 1=Proposed for Newly added Items as suggestions
        var odata = [];
        var userSelectedIds = [];
        var allIds = [];
        $.grep(UserSelectedItems, function (ele) {
            userSelectedIds.push(ele.ID);
        });
        $.grep(AllAvailableItems, function (ele) {
            allIds.push(ele.ID);
        });
        $.grep(userSelectedIds, function (el) {
            if ($.inArray(el, allIds) == -1) {
                var objSuggests = $.grep(UserSelectedItems, function (e) {
                    return (e.ID == el);
                })[0];
                if (isNaN(objSuggests.ID))
                { objSuggests.ID = null; }
                odata.push(objSuggests);
                //window.userinterests.push(objSuggests);
            }
        });
        nexus.log(jsclient.loglevel, odata);
        $.grep(odata, function (ele) {
            Jsondata.push(ele);
        });

        nexus.log(jsclient.loglevel, Jsondata);
        return Jsondata;
    }

    $(document).on("click", "#nexus-EquipmentInfo-cancel", function () {
        nexus.loadUserShipsEquipments();
        $('#txtnewEngine').val('');
        $('#txtnewShip').val('');
        $('#dvEquipmntShips').pqSelect("disable");
        $('#dvEquipmntEngTypes').pqSelect("disable");
        $("#dvPowerplants").pqSelect('disable');
        $("#dvTurbochargers").pqSelect('disable');
        nexus.toggleEquipmentInfoButtons();
    });
    $(document).on("click", "#nexus-EquipmentsShips-AddNew", function () {
        if (nexus.validateNexusForm('#dvAddEquipmentShips')) {

            var newShipSgg = $('#txtnewShip').val().trim();
            newShipSgg = newShipSgg.replace(/\s+/g, " "); //newShipSgg.replace(/[ ]{2,}/, ' ');
            if ($("#dvEquipmntShips option:contains('" + newShipSgg + "')").length == 0) {
                $('#dvEquipmntShips')
                        .append($("<option></option>")
                        .attr("value", newShipSgg)
                        .text(newShipSgg)
                        .attr('selected', true)
                        );
                $('#dvEquipmntShips').pqSelect("refreshData");
                $('#txtnewShip').val('');
                window.userEquipShips.push({ ID: newShipSgg, Name: newShipSgg, Status: 1, TypeID: 2 });

            } else
                nexus.showDialog('Alert','Cannot add same ship again !');
        }
    });
    $(document).on("click", "#nexus-EquipmentsEngines-AddNew", function () {
        if (nexus.validateNexusForm('#dvAddEquipmentEngines')) {

            var newEnginesgg = $('#txtnewEngine').val().trim();
            newEnginesgg = newEnginesgg.replace(/\s+/g, " "); //newEnginesgg.replace(/[ ]{2,}/, ' ');
            if ($("#dvEquipmntEngTypes option:contains('" + newEnginesgg + "')").length == 0) {
                $('#dvEquipmntEngTypes')
                        .append($("<option></option>")
                        .attr("value", newEnginesgg)
                        .text(newEnginesgg)
                        .attr('selected', true)
                        );
                $('#dvEquipmntEngTypes').pqSelect("refreshData");
                $('#txtnewEngine').val('');
                window.userEquipEngines.push({ ID: newEnginesgg, Name: newEnginesgg, Status: 1, TypeID: 3 });

            } else
                nexus.showDialog('Alert', 'Cannot add same engine again !');
        }
    });
    //For power plants//
    $(document).on("click", "#nexus-EquipmentsPlant-AddNew", function () {
        if (nexus.validateNexusForm('#dvAddPowerPlants')) {

            var newPowerPlant = $('#txtnewPowerPlant').val().trim();
            newPowerPlant = newPowerPlant.replace(/\s+/g, " "); //newEnginesgg.replace(/[ ]{2,}/, ' ');
            if ($("#dvPowerplants option:contains('" + newPowerPlant + "')").length == 0) {
                $('#dvPowerplants')
                        .append($("<option></option>")
                        .attr("value", newPowerPlant)
                        .text(newPowerPlant)
                        .attr('selected', true)
                        );
                $('#dvPowerplants').pqSelect("refreshData");
                $('#txtnewPowerPlant').val('');
                window.userPowerPlants.push({ ID: newPowerPlant, Name: newPowerPlant, Status: 1, TypeID: 3 });

            } else
                alert('Cannot add same plant again!');
        }
    });
    //For turbochargers//
    $(document).on("click", "#nexus-EquipmentsTC-AddNew", function () {
        if (nexus.validateNexusForm('#dvAddTurbochargers')) {

            var newTurbocharger = $('#txtnewTurbocharger').val().trim();
            newTurbocharger = newTurbocharger.replace(/\s+/g, " "); //newEnginesgg.replace(/[ ]{2,}/, ' ');
            if ($("#dvTurbochargers option:contains('" + newTurbocharger + "')").length == 0) {
                $('#dvTurbochargers')
                        .append($("<option></option>")
                        .attr("value", newTurbocharger)
                        .text(newTurbocharger)
                        .attr('selected', true)
                        );
                $('#dvTurbochargers').pqSelect("refreshData");
                $('#txtnewTurbocharger').val('');
                window.userTurbochargers.push({ ID: newTurbocharger, Name: newTurbocharger, Status: 1, TypeID: 3 });

            } else
                alert('Cannot add same turbocharger again!');
        }
    });

    //For Get/Update User Equipments/Ships
    $(document).on("click", "#nexus-AboutMe-Edit", function () {
        $('#divProfileAboutMe').toggleClass("ng-hide");
        $('#divProfileAboutMeEdit').toggleClass("ng-hide");
        $('#nexus-AboutMe-Edit').toggleClass('ng-hide');
        $('#nexus-AboutMe-cancel').toggleClass('ng-hide');
        $('#nexus-AboutMe-save').toggleClass('ng-hide');
    });
    $(document).on("click", "#nexus-AboutMe-save", function () {
        var userFormData = "Description=" + encodeURIComponent($("#divProfileAboutMeEdit textarea[name=AboutMeDescription]").val().trim());
        var sUserType = $("#nexusPersInfoWdgt input[id=hdUserType]").val();
        
        if (sUserType.toLowerCase() === 'Internal user'.toLowerCase())
            nexus.UpdateAboutMedescription(userFormData, true);
        else 
            nexus.UpdateAboutMedescription(userFormData, false);
    });
    $(document).on("click", "#nexus-AboutMe-cancel", function () {
        nexus.getMyProfile(true);
    });

    // Like functionality on News Article pages
    GetLikeCount();
    $("a.LikeButton").click(function () {
        LikePage();
    });


    function LikePage() {
        var like = false;
        var likeButtonText = $("a.LikeButton").text();
        if (likeButtonText != "") {
            if (likeButtonText == "Like")
                like = true;

            var aContextObject = new SP.ClientContext();
            EnsureScriptFunc('reputation.js', 'Microsoft.Office.Server.ReputationModel.Reputation', function () {
                Microsoft.Office.Server.ReputationModel.
                Reputation.setLike(aContextObject,
                    _spPageContextInfo.pageListId.substring(1, 37),
                    _spPageContextInfo.pageItemId, like);

                aContextObject.executeQueryAsync(
                    function () {
                        //alert(String(like));
                        GetLikeCount();
                    }, function (sender, args) {
                        //alert('F0');
                    });
            });
        }
    }


    function GetLikeCount() {
        if (_spPageContextInfo.pageListId === undefined || _spPageContextInfo.pageItemId === undefined) {
            return;
        }

        var context = new SP.ClientContext(_spPageContextInfo.webServerRelativeUrl);
        var list = context.get_web().get_lists().getById(_spPageContextInfo.pageListId);
        var item = list.getItemById(_spPageContextInfo.pageItemId);

        context.load(item, "LikedBy", "ID", "LikesCount");
        context.executeQueryAsync(Function.createDelegate(this, function (success) {
            // Check if the user id of the current users is in the collection LikedBy. 
            var likeDisplay = true;
            var $v_0 = item.get_item('LikedBy');
            var itemc = item.get_item('LikesCount');
            if (!SP.ScriptHelpers.isNullOrUndefined($v_0)) {
                for (var $v_1 = 0, $v_2 = $v_0.length; $v_1 < $v_2; $v_1++) {
                    var $v_3 = $v_0[$v_1];
                    if ($v_3.$1E_1 === _spPageContextInfo.userId) {
                        //cb(true, item.get_item('LikesCount'));
                        //alert("Liked by me");
                        likeDisplay = false;
                    }
                }
            }
            ChangeLikeText(likeDisplay, itemc);

        }), Function.createDelegate(this, function (sender, args) {
            //alert('F1');
        }));

    }

    function ChangeLikeText(like, count) {
        if (like) {
            $("a.LikeButton").text('Like');
        }
        else {
            $("a.LikeButton").text('Unlike');
        }
        var htmlstring = '<img alt="" src="/_layouts/15/images/LikeFull.11x11x32.png" />' + " " + String(count);
        if (count > 0)
            $(".nexus-icon-like-count").html(htmlstring)
        else
            $(".nexus-icon-like-count").html("");
    }

    // this method binds data to Snapshot region in the infobar
    function bindSnapshot() {
        var data = infobarData;
        var flagManuals = false,
            totalManuals;
        if (!!data && data != null && data != '') {
            if (!!data.SnapshotText && data.SnapshotText != null) {
                if (!!data.SnapshotText.Values && data.SnapshotText.Values != null) {
                    if (data.SnapshotText.Values.length > 0) {
                        var appendHtml = '',
                            flagProjects = 0,
                            flagEngines = 0,
                            flagManuals = 0,
                            flagContacts = 0,
                            emptyProjectText = '',
                            emptyEnginesText = '',
                            emptyManualsText = '',
                            emptyContactsText = '',
                            placeholderStartIndexes = [], placeholderEndIndexes = [], i = -1, j = -1;
                        appendHtml = data.SnapshotText.Text;

                        // get all the start and end indexes of placeholders (i.e. '<' and '>')
                        while ((i = appendHtml.indexOf('<', i + 1)) != -1) {
                            placeholderStartIndexes.push(i);
                        }
                        while ((j = appendHtml.indexOf('>', j + 1)) != -1) {
                            placeholderEndIndexes.push(j);
                        }

                        var snapshotText = data.SnapshotText.Text;
                        // get substring between '<' & '>' and process
                        for (var s = 0; s < placeholderStartIndexes.length; s++) {
                            var placeholderSubString = snapshotText.substring(placeholderStartIndexes[s], placeholderEndIndexes[s] + 1);
                            var positionOfSecondHash = placeholderSubString.split('#', 2).join('#').length;
                            var entityName = placeholderSubString.substring(positionOfSecondHash + 1, placeholderSubString.length - 1);
                            // get the correspoding Snapshot value
                            var entity = $.grep(data.SnapshotText.Values, function (value) {
                                return value.Name === entityName;
                            });
                            if (!!entity) {
                                var newPlaceholderString = '';
                                if (entity[0].Type == 'Number') {
                                    if (parseInt(entity[0].Value) > 0) {
                                        var link = '#';
                                        if (entity[0].Name === 'Projects')
                                        {
                                            link = '/search/pages/projectresults.aspx';
                                        }
                                        if (parseInt(entity[0].Value == 1))
                                            newPlaceholderString += '<a target="_blank" href="' + link + '">' + placeholderSubString.split(';')[1] + '</a>';
                                        else
                                            newPlaceholderString += '<a target="_blank" href="' + link + '">' + entity[0].Value + ' ' + entity[0].Name + '</a>';
                                    }
                                    else {
                                        newPlaceholderString += '<span>' + placeholderSubString.split(';')[0].replace('#', '').replace('<', '') + '</span>';
                                    }
                                }
                                else if (entity[0].Type == 'Text') {
                                    if (entity[0].Name == 'Contacts') {
                                        if (!!entity[0].Value) {
                                            if (entity[0].Value.indexOf(';') > 0) {
                                                //there are more than 1 contacts
                                                var removeStringIndex = placeholderSubString.split(';')[2].indexOf('$');
                                                newPlaceholderString += placeholderSubString.split(';')[2].substring(0, removeStringIndex);
                                                var contacts = entity[0].Value.split(';');
                                                for (var c = 0; c < contacts.length; c++) {
                                                    if (c == contacts.length - 1)
                                                        newPlaceholderString += '<a  href="#bkmrk_myContacts">' + contacts[c] + '</a>.';
                                                    else if (c == contacts.length - 2)
                                                        newPlaceholderString += '<a href="#bkmrk_myContacts">' + contacts[c] + '</a> and ';
                                                    else
                                                        newPlaceholderString += '<a href="#bkmrk_myContacts">' + contacts[c] + '</a>, ';
                                                }
                                            }
                                            else {
                                                // only 1 contact
                                                newPlaceholderString += placeholderSubString.split(';')[1].replace('$', '') + ' <a href="#bkmrk_myContacts">' + entity[0].Value + '</a>';
                                            }
                                        }
                                        else {
                                            // there are no contacts
                                            newPlaceholderString += '<span>' + placeholderSubString.split(';')[0].replace('#', '').replace('<', '') + '</span>';
                                        }
                                    }
                                    else {
                                        // entity other than Contacts (Type = 'Text')
                                    }
                                }
                                else if (entity[0].Type == 'Query') {
                                    // this one will be filled from search query
                                    flagManuals = true;
                                    //totalManuals = entity[0].Value;
                                    var today = new Date();
                                    var dd = today.getDate();
                                    var mm = today.getMonth(); //January is 0!
                                    var yyyy = today.getFullYear();
                                    if (mm == 0)
                                    {
                                        mm = 11;
                                        yyyy = yyyy - 1;
                                    }
                                    else {
                                        mm = mm - 1; // get the documents which have been modified in the last 1 month
                                    }
                                    mm = mm + 1; // Sharepoint month is 1 based, i.e. January is 1

                                    // Adjustment for number of days in previous month
                                    var daysInMonth = new Date(yyyy, mm, 0).getDate();
                                    if (daysInMonth < dd)
                                    {
                                        dd = daysInMonth;
                                    }
                                    totalManuals = "'(contentclass:STS_ListItem_DocumentLibrary  ContentType:document  FileExtension:pdf OR  FileExtension:doc OR   FileExtension:docx  OR   FileExtension:txt OR FileExtension:ppt  OR FileExtension:pptx)  AND LastModifiedTime>=" + yyyy + "-" + mm + "-" + dd + "'&trimduplicates=false&rowlimit=90&clienttype='ContentSearchRegular'";
                                    
                                    getAndBindTotalManuals(totalManuals);
                                    var searchUrl = "/search/pages/results.aspx?k=(contentclass:STS_ListItem_DocumentLibrary  ContentType:document  FileExtension:pdf OR  FileExtension:doc OR   FileExtension:docx  OR   FileExtension:txt OR FileExtension:ppt  OR FileExtension:pptx)  AND LastModifiedTime>=" + yyyy + "-" + mm + "-" + dd;
                                    newPlaceholderString += '<a target="_blank" id="infobar-snapshot-manualsText" href="' + searchUrl + '"></a>';
                                }
                                appendHtml = appendHtml.replace(placeholderSubString, newPlaceholderString);
                            }
                        }
                        $("#nexus-infobar-status .nexus-infobar-content-container").html(appendHtml);
                        if (flagManuals) {
                              getAndBindTotalManuals(totalManuals);
                        }

                    }
                }
            }
        }
    }
    function getAndBindTotalManuals(queryTxt) {
        $.ajax({
            type: "GET",
            async: false,
            url: "/_api/search/query?querytext=" + queryTxt,
            headers: {
                "accept": "application/json;odata=verbose",
                "content-type": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                $('#infobar-snapshot-manualsText').text(data.d.query.PrimaryQueryResult.RelevantResults.TotalRowsIncludingDuplicates + ' documents');
           },
            error: function (xhr, statusText, errorThrown) {
                nexus.log(jsclient.loglevel, "Error: " + errorThrown, xhr.status);
            },
            dataType: "json"
        });
    }


    // Welcome or Surevey banner
    // this methods binds Survey or Welcome text
    var currentUser,
        responseData = new Array(),
        surveyData = new Array();

    function getCurrentUserId() {
        var clientContext = new SP.ClientContext('/content/surveys');
        var oWeb = clientContext.get_web();
        currentUser = oWeb.get_currentUser();
        clientContext.load(currentUser);
        clientContext.executeQueryAsync(Function.createDelegate(this, onUserFetchSuccess), Function.createDelegate(this, onUserFetchFailed));
    }
    function onUserFetchSuccess(sender, args) {
        currentUserId = currentUser.get_id();
    }
    function onUserFetchFailed(sender, args) {
        nexus.log(jsclient.loglevel, args.get_message());
            $('#surveyApp').hide();
            $("#nexus-infobar-welcome .nexus-infobar-content-container").html(infobarData.WelcomeText);
    }

    function onFailureGetCurrentUser(sender, args) {
        nexus.log(jsclient.loglevel, args.get_message());
    }

    // Show latest news article onto campaign portion of the Infobar
    function getMostRecentNewsArticle() {
        var url = window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl + '/NewsCenter';
        var ctx = new SP.ClientContext(url);
        var list = ctx.get_web().get_lists().getByTitle('Pages');
        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml(          '<View>' +
									        '<RowLimit>1</RowLimit>' +
												'<Query>' +
													'<Where>' +
														'<And>' +
															'<Eq>' +
																'<FieldRef Name="News_ArticleType" />' +
																'<Value Type="Choice">News</Value>' +
															'</Eq>' +
															'<Neq>' +
																'<FieldRef Name="FileLeafRef" />' +
																'<Value Type="File">news_archieve_home.aspx</Value>' +
															'</Neq>' +
														'</And>' +
													'</Where>' +
													'<OrderBy>' +
														'<FieldRef Name=\'Modified\' Ascending=\'False\' />' +
													'</OrderBy>' +
												'</Query>' +
									        '</View>');
        var items = list.getItems(camlQuery);
        ctx.load(items);
        ctx.executeQueryAsync(function () {
            var pageItem = items.getItemAtIndex(0);
            var interest = pageItem.get_item('News_Interest');
            var category = pageItem.get_item('News_Category');
            getPublishingPage(url, 'Pages', pageItem.get_fieldValues()['ID'], ['PublishingRollupImage', 'PublishingPageImage', 'Title', 'LinkFilename'], interest, category, printPageDetails, logError);

        }, function (error, args) {
            nexus.log(jsclient.loglevel, JSON.stringify(args.get_message()));
        });
    }

    function getJson(endpointUri, success, error) {
        $.ajax({
            url: endpointUri,
            type: "GET",
            processData: false,
            contentType: "application/json;odata=verbose",
            headers: {
                "Accept": "application/json;odata=verbose"
            },
            success: success,
            error: error
        });
    }


    function getPublishingPage(webUrl, listName, listItemId, publishingProperties, interest, category, success, failure) {
        var itemUri = webUrl + "/_api/web/lists/getbytitle('" + listName + "')/items(" + listItemId + ")";
        getJson(itemUri,
           function (data) {
               var pageItem = data.d;
               var selectProperties = [];
               for (var idx in publishingProperties) {
                   if (!pageItem.hasOwnProperty(publishingProperties[idx])) {
                       selectProperties.push(publishingProperties[idx]);
                   }
               }
               if (selectProperties.length > 0) {
                   //construct an additional query 
                   var query = '/FieldValuesAsHtml?$select=' + selectProperties.join(',');
                   var endpointUri = pageItem['__metadata'].uri + query;
                   getJson(endpointUri,
                      function (data) {
                          for (var property in data.d) {
                              if (property == "__metadata") continue;
                              pageItem[property] = data.d[property];
                          }
                          success(pageItem, interest, category);
                      },
                      failure);
               }
               else {
                   success(pageItem, interest, category);
               }
           },
           failure);
    }



    function printPageDetails(pageItem, interest, category) {
        if (!!pageItem) {
            var src = $(pageItem.PublishingPageImage).attr('src');
            var appendHtml = '';
            var catText = '';
            var intText = '';

            if (category) {
                catText += '&category1=' + category.Label;
            }
            if (interest) {
                intText += '&interest1=' + interest.Label;
            }

            var appendHtml = '';
            var containerHtml = '<div id="nexus-campaign-rotator-container" style="margin-right: -15px; min-height: 165px;"></div>';
            $('#nexus-infobar-campaign').removeAttr('style');
            $('#nexus-infobar-campaign').css("padding-left", "0");
            $('#nexus-infobar-campaign').html(containerHtml);

            var imageUrl = src;
            if (!!imageUrl) {
                imageUrl = imageUrl.substring(0, imageUrl.indexOf('?'));
                imageUrl = imageUrl.replace('http://', 'https://');
                var latestNewsURL = '/Pages/news.aspx?articleid=' + pageItem.ID + catText + intText;
                appendHtml += '<a href="' + latestNewsURL + '" style="padding-left: 0px;"><img class="nexus-campaign-rotator-item" src="' + imageUrl + '">';
            }
            else {
                var latestNewsUrl = '';
                if (!!catText && !!intText)
                    latestNewsUrl = '/pages/news.aspx?articleid=' + pageItem.ID + catText + intText;
                else
                    latestNewsUrl = '/pages/news.aspx?articleid=' + pageItem.ID;
                appendHtml += '<a href="' + latestNewsUrl + '">No Image<a>';
                $('#nexus-campaign-rotator-container').addClass('no-image-nexus-infobar-campaign').text('No image').
                    css('cursor', 'pointer').click(function () {
                        window.location = "/pages/news.aspx?articleid=" + pageItem.ID;
                    }
                );
            }
            $('#nexus-campaign-rotator-container').html(appendHtml);
            //Set campaign banner image to correct size
            resizeCampaignBanner();

            //Set campaign banner image to correct size when user resize browser
            $(function () {
                $(window).resize(function () {
                    resizeCampaignBanner();
                });
            });
        }

    }

    function logError(error) {
        nexus.log(jsclient.loglevel, JSON.stringify(error));
    }
    // for Internet Explorer

    //For Get/Interests Control applying pqSelect control styling
    //if (window.location.href.indexOf("myprofile") > -1) {
    //    onLoadFunctionsForMyProfile();
    //}

    // returns true if number
    function inRange(i) {
        return ((i >= 48 && i <= 57) || (i >= 96 && i <= 105));
    }

    //Handle the pqSelect Chnage Event 
    function HandlePqSelectChangeevent(CurrentUserItems, selectControlId) {
        //For delete operation handling Change event
        //Get the Previously selected/existing Interests
        var previousIds = [];
        $.grep(CurrentUserItems, function (ele) {
            var st = ele.ID;
            previousIds.push(st.toString());
        });
        //Get the current selection & get the difference between current and previous Ids
        var current = $(selectControlId).val();
        var diff = [];
        if (previousIds) {
            diff = $(previousIds).not(current).get();
        }
        //Set the Status for the deleted interest object as 3
        if (diff.length > 0) {
            $.each(diff, function (key, value) {
                var objtodelete = $.grep(CurrentUserItems, function (e) { return (e.ID == value) })[0];
                if (objtodelete != undefined) {
                    objtodelete.Status = 3;
                }
            });
        }
    }

    window.onLoadFunctionsForMyProfile = function () {
        // quit if this function has already been called
        //if (arguments.callee.done) return;

        //// flag this function so we don't do the same thing twice
        //arguments.callee.done = true;
        if (window.location.pathname.toLowerCase().indexOf("myprofile") > -1) {

            $('#dvInterests').pqSelect({
                bootstrap: { on: true },
                multiplePlaceholder: 'Please select',
                deselect: true,
                selectallText: 'Select All',
                checkbox: true,
                search: true,
                maxDisplay: 10,
                width: 400
            }).on("change", function (evt) {
                HandlePqSelectChangeevent(window.userinterests, '#dvInterests');
            });
            $('#dvEquipmntShips').pqSelect({
                bootstrap: { on: true },
                multiplePlaceholder: 'Please select',
                deselect: true,
                selectallText: 'Select All',
                checkbox: true,
                search: true,
                maxDisplay: 10,
                width: 400
            }).on("change", function (evt) {
                HandlePqSelectChangeevent(window.userEquipShips, '#dvEquipmntShips');
            });
            $('#dvEquipmntEngTypes').pqSelect({
                bootstrap: { on: true },
                multiplePlaceholder: 'Please select',
                deselect: true,
                selectallText: 'Select All',
                checkbox: true,
                search: true,
                maxDisplay: 10,
                width: 400
            }).on("change", function (evt) {
                HandlePqSelectChangeevent(window.userEquipEngines, '#dvEquipmntEngTypes');
            });
            //For PowerPlants
            $('#dvPowerplants').pqSelect({
                bootstrap: { on: true },
                multiplePlaceholder: 'Please select',
                deselect: true,
                selectallText: 'Select All',
                checkbox: true,
                search: true,
                maxDisplay: 10,
                width: 400
            }).on("change", function (evt) {
                HandlePqSelectChangeevent(window.userPowerPlants, '#dvPowerplants');
            });
            //For Turbochargers
            $('#dvTurbochargers').pqSelect({
                bootstrap: { on: true },
                multiplePlaceholder: 'Please select',
                deselect: true,
                selectallText: 'Select All',
                checkbox: true,
                search: true,
                maxDisplay: 10,
                width: 400
            }).on("change", function (evt) {
                HandlePqSelectChangeevent(window.userTurbochargers, '#dvTurbochargers');
            });
            window.disableAllPqSelects();

            //keys which shouldn't be blocked
            var utlilityKeys = [
                37,   //left
                39,   //right
                8,    //backspace
                46,   //del
                9,    //tab            
                32,   //space
                13,   //enter
                96    //return
            ];

            //keys allowed in the phone input (inc shift + key)
            var allowed = [[
                107,  //+
                109,  //-            
                188,  //,
                189   // -
            ], [
                57,   //shift + (
                48,   //shift + )            
                187   //shift + +   
            ]];

            // Validate input controls on the blur events to remove the error label if it was showing
            $(".nexus-required input[type=text]").focusout(function () {

                var valid = nexus.validateText($(this).val());
                if (valid) {
                    $(this).removeClass("nexus-required");
                    $(this).parent().find(".nexus-form-field-error").hide(150);
                }
            });
            $(".nexus-required input[type=email]").focusout(function () {
                var valid = nexus.validateEmail($(this).val());
                if (valid) {
                    $(this).removeClass("nexus-required");
                    $(this).parent().find(".nexus-form-field-error").hide(150);
                }
            });

            $(".nexus-required select").change(function () {
                if($(this).val() != "") {
                    $(this).removeClass("nexus-required");
                    $(this).parent().find(".nexus-form-field-error").hide(150);
                } else {
                    $(this).addClass("nexus-required");
                    $(this).parent().find(".nexus-form-field-error").text("This field is required").slideDown(150);
                }
            });

            $('input[id^=N_]').on("keypress", function (event) {
                if (event.which != 32 && event.which != 43 && event.which != 46 && event.which != 45 && event.which != 40 && event.which != 41 && (event.which < 48 || event.which > 57)) {
                    return false;
                }
                if (event.which == 43) {

                    var ctrl = document.getElementById($(this)[0].id);
                    var startPos = ctrl.selectionStart;
                    //var endPos = ctrl.selectionEnd;
                    if (startPos != 0)
                        return false;
                }
            });
            // $('input[id^=N_]').focusout(function () {
            // var phoneNoRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;///^\+?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/;
            // if($(this).val().match(phoneNoRegex)) {
            // return true;
            // }
            // else {
            // alert("message");
            // return false;
            // }
            // });
        }
    };
    // returns true if number
    window.inRange = function (i) {
        return ((i >= 48 && i <= 57) || (i >= 96 && i <= 105));
    }
    // update the api url of user pictures
    window.applyUserPictureUrl_MyContact = function () {
        // my contacts
        $('.nexus-my-contacts .nexus-my-contacts-person').each(function () {
            var img = $(this).find('img');
            img.attr('src', nexus.admintoolapi + "user/" + $(this).data('id') + "/picture");
        });
    }
    window.applyUserPictureUrl_ProjectMembers = function () {
        // project members
        $('ul[name=nexus-project-members-list] li figure img').each(function () {
            var img = $(this);
            img.attr('src', nexus.admintoolapi + "user/" + $(this).data('id') + "/picture");
        });

        // --- Make Donut Charts on project site collection home pages -------------  
        //this is a tweak as window.onload doesn't function as expected in IE9
        window.initProjectCharts();
    }
    window.applyUserPictureUrl_Mycolleague = function () {
        // my colleagues
        $('.nexus-widget section[name=sectMycolleague] ul li img').each(function () {
            var img = $(this);
            img.attr('src', nexus.admintoolapi + "user/" + $(this).attr('id') + "/picture");
        });
    }

    window.applyScrollButtons_MyEquipment = function () {
        /* This is to ensure that the scrolls are displayed when there is more content than the height of the widget */
        var height = $('.nexus-scrollable-div').css('height');
        if (!!height) {
            if (Math.floor(height.replace('px', '')) >= 250) {
                $('.nexus-scrollable-button-up').show(); $('.nexus-scrollable-button-down').show();
            }
        }
   }

    window.executeOrSkipStatus = function () {
        var isAngularFrameworkLoaded = false;
        var scripts = document.getElementsByTagName("script");
        for (var i = 0; i < scripts.length; i++) {
            if (!!scripts[i].getAttribute('src')) {
                if (scripts[i].getAttribute('src').indexOf('angular') > -1) {
                    isAngularFrameworkLoaded = true;
                    break;
                }
            }
        }
        if (isAngularFrameworkLoaded) {
            executeStatus();
        }
    }
    // method to see if angular framework is loaded. If so, execute surveys otherwise skip it.
    window.executeOrSkipSurveys = function () {
        var isAngularFrameworkLoaded = false;
        var scripts = document.getElementsByTagName("script");
        for (var i = 0; i < scripts.length; i++) {
            if (!!scripts[i].getAttribute('src')) {
                if (scripts[i].getAttribute('src').indexOf('angular') > -1) {
                    isAngularFrameworkLoaded = true;
                    break;
                }
            }
        }
        if (isAngularFrameworkLoaded) {
            executeSurvey();
            //init_DirectContact();
        }
    }

    window.initProjectCharts = function () {
        if (window.location.pathname.toLowerCase().indexOf("project") > -1) {
            $(".nexus-donut-chart:not(.nexus-initialized)").each(function () {

                // mark as initialized
                $(this).addClass("nexus-initialized");

                var chartId = $(this).prop("id");
                var chartPercentage = $(this).data("percentage");
                var duration = 20; // duration animates the chart if > 0, but does not work because of how the dropdown menu + panel is set up to work

                var colors = ["#fff", "#313d4a", "#e3e3e3"];      // default is white & dark gray

                if ($(this).hasClass("nexus-donut-chart-red")) {
                    colors = ["#e40045", "#e40045", "#c9003f"];
                }
                if ($(this).hasClass("nexus-donut-chart-yellow")) {
                    colors = ["#ffcd00", "#ffcd00", "#e5b700"];
                }
                if ($(this).hasClass("nexus-donut-chart-green")) {
                    colors = ["#91b900", "#91b900", "#7e9e00"];
                }
                if ($(this).hasClass("nexus-donut-chart-blue")) {
                    colors = ["#4b96d2", "#4b96d2", "#4284b7"];
                }

                Circles.create({
                    id: chartId,
                    radius: 40,
                    value: chartPercentage,
                    maxValue: 100,
                    width: 20,
                    border: 2,
                    text: '',
                    duration: duration,
                    colors: colors,
                    wrpClass: 'circles-wrp',
                    textClass: 'circles-text',
                    styleWrapper: true,
                    styleText: true
                });
            });
        }
    }
    /**
    * detect IE
    * returns version of IE or false, if browser is not Internet Explorer
    */
function detectIE() {
    var ua = window.navigator.userAgent;

    // Test values; Uncomment to check result …

    // IE 10
    // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

    // IE 11
    // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

    // IE 12 / Spartan
    // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

    // Edge (IE 12+)
    // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10) <10 ? true:false;
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        //debugger;
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        var actrv = ua.substring(rv + 3, ua.indexOf('.', rv));
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10) == 11 ? false:true;
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
        // Edge (IE 12+) => return version number
        var actrv = ua.substring(edge + 5, ua.indexOf('.', edge));
        return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10) == 12 ? false:true;
    }

    // other browser
    return false;
}

    window.executeAfterAngularJSloaded = function () {
        window.executeOrSkipSurveys();
        window.executeOrSkipStatus();

    };

    window.aboutMeInfoWidgetPostLoad = function () {
        addProfileImageSoruce();
        setupEditPicture();
    };

    var addProfileImageSoruce = function () {
        // this should run on profile page, it sets the image source
        //debugger;
        if (!!nexus.currentUserAccountName)
        $('#nexus-profile-info-image').attr('src', nexus.admintoolapi + "user/" + nexus.currentUserAccountName + "/picture");
        else {
            $('#nexus-profile-info-image').attr('src', nexus.admintoolapi + "user/undefined/picture");
            setTimeout(addProfileImageSoruce,500);
        }
            
    };

    var getMinimumWidthOrHeight = function (imageElement, imageTooSmallMessage, imageTooLargeMessage) {
        // This is a helper to see if the uploaded image is smaller than 250, if so, it will set a new 
        // original dimension of the cropping ui. It will also show out warning message
        var theImage = new Image();
        theImage.src = imageElement.attr("src");
        var originalWidth = theImage.naturalWidth;
        var originalHeight = theImage.naturalHeight;

        if (originalHeight >= 250 && originalHeight <= 768 && originalWidth >= 250 && originalWidth <= 1024) {
            // This is if the original image is large enough
            var elementHeight = imageElement.height();
            var elementWidth = imageElement.width();

            // But the image can still be rendered smaller than 250px, for example if it is 
            // a panorama image, then the smallest side is the size of the cropping box
            if (elementHeight < 250 || elementWidth < 250) {
                return elementHeight < elementWidth ? elementHeight : elementWidth;
            } else {
                return 250;
            }
        } else {

            if (originalHeight > 768 && originalWidth > 1024) 
                imageTooLargeMessage.show();// here the original is too large, that means that a message should be shown to the user
            else                
                imageTooSmallMessage.show();// here the original is too small, that means that a message should be shown to the user

            return originalHeight < originalWidth ? originalHeight : originalWidth
        }
    };

    // This is the setup for when a user edits a picture.
    // It sets up a loading input and a cropping "window".
    // The editing is done in this order: 
    // A user upload a picture to a temp location (user/picture-temp), then downloads the temp image, which is set into a cropping element, where
    // the user can crop. After save on crop the image is set as the active image

    // Two plugins are used to make this all work: "Jcrop" and "jQuery file upload"
    var setupEditPicture = function () {
        var $editButton = $('#edit-picture-button');
        var $uploadPanel = $('#nexus-file-upload-panel');
        var $uploadButton = $('#upload-chosen-image');
        var $croppingPanel = $('#nexus-file-cropping-panel');
        var $croppingImage = $('#nexus-profile-info-image-cropping');
        var $cancelButton = $('#cancel-edit-picture-button');
        var $cropAndSaveButton = $('#crop-and-save');
        var $wrongFileMessage = $('#nexus-file-upload-wrong-filetype');
        var $smallImageMessage = $('#nexus-file-upload-small-image');
        var $largeImageMessage = $('#nexus-file-upload-large-image');
        var $uploadNewImageButton = $('#nexus-upload-new-image');
        var $editPanel = $('#nexus-change-picture-panel');
        var $croppingInfo = $('#nexus-file-cropping-info');
        var jcrop_api;

        // Coordinates for the cropping
        var coordinateX1;
        var coordinateX2;
        var coordinateY1;
        var coordinateY2;

        // Sincec the image the user uploaded can be any size, it's resized in the UI using CSS
        // This messes up the coordinates for the cropping plugin. So here I calculate what the difference
        // between the actual image and the displayed image is, and can then use that number to
        // recalculate the coordinates
        var calculateResizeRatio = function () {
            // Create new offscreen image to test
            var theImage = new Image();
            theImage.src = $croppingImage.attr("src");

            // Get accurate measurements from that.
            var originalWidth = theImage.naturalWidth;

            // Get the width of the cropping image
            var $jQcropImage = $croppingPanel.find('.jcrop-holder');
            var newWidth = $jQcropImage.width();

            var resizingRatio = originalWidth / newWidth;

            return resizingRatio > 1 ? resizingRatio : 1;
        };

        var setCoordinates = function (coordinatesData) {
            // This is run from the cropping API
            coordinateX1 = coordinatesData.x;
            coordinateX2 = coordinatesData.x2;
            coordinateY1 = coordinatesData.y;
            coordinateY2 = coordinatesData.y2;
        };

        var clearAllFlashMessages = function () {
            $('.nexus-flash-messages').hide();
        };

        var showCroppingPanel = function () {
            // When an image is uploaded to the temp location, the cropping should be visible.
            // Setting source of the croppingImage tag downloads the temp image
            // It also initializes Jcrop
            $croppingPanel.show();
            $croppingInfo.show();
            $croppingImage.attr('src', '');
            if (nexus.currentUserAccountName == undefined) {
                setUPCurrentUserLogin();
                $croppingImage.attr('src', nexus.admintoolapi + "user/" + nexus.currentUserAccountName + "/picture-temp");
            }
            else
                $croppingImage.attr('src', nexus.admintoolapi + "user/" + nexus.currentUserAccountName + "/picture-temp");

            $croppingImage.load(function () {
                var minSize = getMinimumWidthOrHeight($croppingImage, $smallImageMessage, $largeImageMessage);

                $croppingImage.Jcrop({
                    setSelect: [96, 96, 0, 0],
                    minSize: [minSize, minSize],
                    aspectRatio: 1,
                    boxWidth: 800, //Maximum Height for your bigger images
                    boxHeight: 600,
                    //trueSize: [$croppingImage.naturalWidth, $croppingImage.naturalHeight],
                    onSelect: setCoordinates
                }, function () {
                    jcrop_api = this;
                });

            });
        };

        $editButton.on('click', function () {
            $editPanel.show();
            $uploadPanel.show();
            $cancelButton.show();
            $editButton.hide();
        });

        $cancelButton.on('click', function () {
            // Cancel just reloads the page, I could do things manually here, like hiding the panels and clearing the data
            // but it seems not worth it. This will cause less errors, even though the user has to wait for page reload
            location.reload();
        });

        $cropAndSaveButton.on('click', function () {
            // This happens when a user clicks to crop and save
            // It calculates the coordinates and then sends them to the service
            // And then reloads the page
            if (!coordinateX2) {
                return;
            }
            var resizeRatio = 1;
            //When we use the boxWidth for scaling or resizing the large images, the resize ratio should only be applied for Chrome not for IE
            var isChrome = /Chrome/i.test(navigator.appVersion);
            if (!window.chrome && !isChrome) {
                resizeRatio = 1;
            } else {
                resizeRatio = calculateResizeRatio();//alert("you are using google chrome");
            }

            var x1 = Math.floor(coordinateX1 * resizeRatio);
            var x2 = Math.floor(coordinateX2 * resizeRatio);
            var y1 = Math.floor(coordinateY1 * resizeRatio);
            var y2 = Math.floor(coordinateY2 * resizeRatio);

            var requestUrl = "user/picture/crop-and-enable/" + x1 + "/" + y1 + "/" + x2 + "/" + y2;

            nexus.admintoolRequest(requestUrl, 'PUT')
                .then(reloadPage);
        });

        // This sets up the file upload input
        // forceIframeTransport makes sure that an ifram is used, which is needed in IE9
        // I can't have this functionality in webservice.js, since it has to do with the file input
        var isBrowserIE9orLess = false;
        isBrowserIE9orLess = detectIE();
        $('#fileupload').fileupload({
            forceIframeTransport: isBrowserIE9orLess,
            url: nexus.admintoolapi + 'user/picture',
            // This following option is to make it show the chosen file in the input field
            replaceFileInput: false,
            // The regular expression for allowed file types, matches
            // against either file type or file name:
            acceptFileTypes: /(\.|\/)(jpe?g|png)$/i,
            crossDomain : true,
            beforeSend: function (xhr, data) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + bearertoken);
            },
            //onSend: function(e, options) {
            //    options.headers = {
            //        'Authorization': 'Bearer ' + bearertoken
            //    };
            //},
            success: function (e, data) {
                $uploadPanel.hide();
                showCroppingPanel();
            },
            fail: function (e, data) {
                nexus.log(jsclient.loglevel, e);
                nexus.log(jsclient.loglevel, data);
            },
            done: function (e, data) {
                nexus.log(jsclient.loglevel, data);
            }
        }).on('fileuploadprocessalways', function (e, data) {
            var currentFile = data.files[data.index];
            if (data.files.error && currentFile.error) {
                // there was an error, do something about it
                nexus.log(jsclient.loglevel, currentFile.error);
                $wrongFileMessage.show();
            }
        });

        // This reditect the POST to a html file, needed for the iframe, and perhaps for the CORS support
        $('#fileupload').fileupload('option',
            'redirect',
            _spPageContextInfo.webAbsoluteUrl + '/layouts/15/Nexus/fileUploadTemplate/result.html?%s'
        );
    };

    // ---  Welcome Popup ------------------------------------------------------------
    //nexus.getPopUpInfo(function (data) {
    //    nexus.IsOldNexusUser = data.IsOldExtranetUser;
    //    if (data.ShowPopUp == true) {

    //        nexus.showWelcomeDialog('Welcome', "<p>Welcome to MAN Diesel &amp; Turbo&rsquo;s customer portal, Nexus, which provides you with the full overview of your content and easy access to your contact persons. </p>"
    //                                        + "<p>We encourage you to watch the <a target=\"_blank\" href=\"https://youtu.be/8oS5KyRGCjk\">Nexus video</a>, which provides you with a quick overview of the Customer Portal of MAN Diesel &amp; Turbo.&#160;</p>"
    //                                        + "<p>If you have trouble using the site, please visit our <a target=\"_blank\" href=\"/help/Pages/Default.aspx\">Help Center</a> or refer to your MAN Diesel &amp; Turbo contact person for assistance.</p>"
    //                                        + "<p>Sincerely,  Nexus Admin  </p>" );
                                            
                                           
                                           
                                          
            


    //        nexus.clearPopup();
    //    }
    //    if (!nexus.IsOldNexusUser) {
    //        $('#nexusOldUserPanel').closest("[id^='MSOZoneCell_']").hide();
    //    }
    //    else
    //    {
    //        $('#nexusOldUserPanel').show();
    //    }
    //});


    // clear text from search box
    function clearSearchbox() {

        if ($("input[id*='_csr_sbox']").length >= 3) {

            $("input[id*='_csr_sbox']").each(function () {
                var value = $(this).val();
                if (value.indexOf('(contentclass:STS_ListItem_DocumentLibrary  ContentType:document  FileExtension:pdf OR  FileExtension:doc OR   FileExtension:docx  OR   FileExtension:txt OR FileExtension:ppt  OR FileExtension:pptx)') != -1) {
                    $(this).val('');
                }
            });
        }

        else {
            setTimeout(clearSearchbox, 500);
        }

    }
    clearSearchbox();

    // clear text from search box in Project search page
    function clearProjectSearchbox() {
        if ($("input[id*='_csr_sbox']").length >= 3) {

            $("input[id*='_csr_sbox']").each(function () {
                var value = $(this).val();
                if (value.indexOf('(mdtsiteinfositetype:project)') != -1) {
                    $(this).val('');
                }
            });
        }

        else {
            setTimeout(clearProjectSearchbox, 500);
        }

    }
    clearProjectSearchbox();


    ///Here we run the javascript only afer angular.js is loaded
    ExecuteOrDelayUntilScriptLoaded(window.executeAfterAngularJSloaded(), 'angular.js');

    // Here is where we add event listeners
    // Depending on the name of the event listeners, it will correspond to a specific angular app
    // the name is defined in the web part GUI, as well as here. So alla added event listeners here
    // will run once the widget with that specified name is done
    AppLoad.addEventListener('PersonalInfowidget', onLoadFunctionsForMyProfile);
    AppLoad.addEventListener('AboutMeWidget', aboutMeInfoWidgetPostLoad);
    AppLoad.addEventListener('MyContactsWidget', applyUserPictureUrl_MyContact);
    AppLoad.addEventListener('ProjectMembersWidget', applyUserPictureUrl_ProjectMembers);
    AppLoad.addEventListener('MycolleaguesWidget', applyUserPictureUrl_Mycolleague);
    AppLoad.addEventListener('MyEquipmentWidget', applyScrollButtons_MyEquipment);

   window.formatDate = function(date){
          var dateOut = new Date(date,'dd-MM-yyyy');
          return dateOut;
    };
});

//preselect contact, used in angular app
function preSelectContact() {
    var contacts = $('.nexus-my-contacts-person')
    if (contacts.length > 0) {
        var currentlySelectedContact = contacts[0];
        // slide in new details
        $("#nexus-my-contacts-details").animate({ opacity: 0, top: "300" }, 300, function () {
            // read details from data-* attributes and copy to html
            $("#nexus-my-contacts-details-description").text($(currentlySelectedContact).data("description"));
            $("#nexus-my-contacts-details-tel a").text($(currentlySelectedContact).data("tel"));
            $("#nexus-my-contacts-details-tel a").attr("href", "tel:" + $(currentlySelectedContact).data("tel"));
            $("#nexus-my-contacts-details-mail a").text($(currentlySelectedContact).data("mail"));
            $("#nexus-my-contacts-details-mail a").attr("href", "mailto:" + $(currentlySelectedContact).data("mail"));
            $("#nexus-my-contacts-details-comment textarea").val($(currentlySelectedContact).data("comment"));
            $("#nexus-my-contacts-details-comment textarea").attr("name", $(currentlySelectedContact).data("id"));
            $(this).css("top", "-200px");

            var myContactsParentHeight = $(".nexus-my-contacts-filler").parent().parent().height();
            var myContactsSiblingHeight = 0;
            $(".nexus-my-contacts-filler").siblings().each(function () {
                myContactsSiblingHeight += $(this).outerHeight();
            });
            if (myContactsParentHeight > myContactsSiblingHeight) {
                $(".nexus-my-contacts-filler").height((myContactsParentHeight - myContactsSiblingHeight) + "px");
            }

        }).stop(true, true).animate({ opacity: 1, top: "0" }, 300);

        $(".nexus-my-contacts-person").removeClass("nexus-selected");
        $(currentlySelectedContact).addClass("nexus-selected");
    }
}

var nexus = nexus || {};

jQuery(document).ready(function () {
    "use strict";

    var $ = jQuery;

    nexus.getBearerTokenHeader = function () {
        var isDevEnvironment = false;
        if (isDevEnvironment) {
            return null;
        }

        return { 'Authorization': 'Bearer ' + bearertoken };
    };

    nexus.admintoolRequest = function (url, type) {
        $.support.cors = true;
        return $.ajax({
            type: type,
            url: nexus.admintoolapi +url,
            headers: nexus.getBearerTokenHeader(),
            dataType: "json"
        }).then(function (data) {
            return data;
        }, function (xhr, statusText, errorThrown) {
            console.log("Error: " + errorThrown);
            return xhr;
        });
    };

    // -- Notifications -------------------------------------------------------

    // call server to get notifications for current user
    nexus.getNotifications = function (callback) {

        // if on dev machine, just return mockup data since the webservice server is not available
        //if (location.hostname === "dev") {

        //}
        ////if (typeof bearertoken === "undefined") return;
        //// make webservice call
        $.support.cors = true;
        $.ajax({

            type: "GET",
            url: nexus.admintoolapi + "notification",
            headers: nexus.getBearerTokenHeader(),
            success: function (data) { callback(data); },
            error: function (xhr, statusText, errorThrown) { console.log("Error: " + errorThrown); },
            dataType: "json"
        });
    }


    // call server to clear notifications that the user has viewed
    nexus.clearNotifications = function () {
        //if (typeof bearertoken === "undefined") return;

        $.support.cors = true;
        $.ajax({

            type: "PUT",
            url: nexus.admintoolapi + "notification/clear",
            headers: nexus.getBearerTokenHeader(),
            success: function (data) { callback(data); },
            error: function (xhr, statusText, errorThrown) { console.log("Error: " + errorThrown); },
            dataType: "json"
        });
    }



    // -- My Contacts Comments ------------------------------------------------

    nexus.saveMyContactsComment = function () {
        //if (typeof bearertoken === "undefined") return;
        var user = $("#nexus-my-contacts-details-comment textarea").attr("name");
        var dataput = $("#nexus-my-contacts-details-comment textarea").val();
        $('.nexus-my-contacts-person[data-id=' + user + ']').data("comment", dataput);

        if (location.hostname === "dev") {
            console.log("Comment saved: " + dataput);
            return;
        }

        $.support.cors = true;
        $.ajax({
            type: "PUT",
            url: nexus.admintoolapi + "user/contact/" + user,
            headers: nexus.getBearerTokenHeader(),
            data: dataput,
            success: function (result) { console.log("Comment saved successfully!"); },
            error: function (xhr, statusText, errorThrown) { console.log("Could not save comment: " + errorThrown); },
            dataType: "json"
        });
    }

    // -- Callout Comments ------------------------------------------------

    nexus.saveCalloutComment = function (itemId, comment) {
        //if (typeof bearertoken === "undefined") return;
        //if (location.hostname === "dev") {
        //console.log("Click event called Callout comment saved: itemId=" + itemId + "  comment=" + comment);
        //return;
        //}

        $.support.cors = true;
        $.ajax({
            type: "PUT",
            url: nexus.admintoolapi + "user/comment/" + itemId,
            headers: nexus.getBearerTokenHeader(),
            data: comment,
            success: function (result) { console.log("Comment saved successfully!"); },
            error: function (xhr, statusText, errorThrown) { console.log("Could not save comment: " + errorThrown); },
            dataType: "json"
        });
    }

    // -- Main Menu -----------------------------------------------------------

    nexus.getMainMenu = function (callback) {
        //if (typeof bearertoken === "undefined") return;
        $.support.cors = true;
        $.ajax({

            type: "GET",
            url: nexus.admintoolapi + "navigation",
            headers: nexus.getBearerTokenHeader(),
            success: function (data) { callback(data); },
            error: function (xhr, statusText, errorThrown) { console.log("Error: " + errorThrown); },
            dataType: "json"
        });

    }

    // -- project  Menu -----------------------------------------------------------

    nexus.getMainMenu2 = function (callback) {
        //if (typeof bearertoken === "undefined") return;
        $.support.cors = true;
        $.ajax({

            type: "GET",
            url: nexus.admintoolapi + "user/app/projects",
            headers: nexus.getBearerTokenHeader(),
            success: function (data) {
            callback(data); },
            error: function (xhr, statusText, errorThrown) {
            console.log("Error: " +errorThrown);
        },
        dataType: "json"
    });

}


    nexus.loadComment = function (control, itemid) {
        //if (typeof bearertoken === "undefined") return;
        $.support.cors = true;
        $.ajax({

            type: "GET",
            url: nexus.admintoolapi + "user/comment/" + itemid,
            headers: nexus.getBearerTokenHeader(),
            success: function (result) { if (result != null) { control.val(result.Text) } else { control.val('') }; },
            error: function (xhr, statusText, errorThrown) { console.log("Error: " + errorThrown); },
            dataType: "json"
        });

    }

    // -- InfoBar Content -------------------------------------------------------

    nexus.getInfobarData = function (callback) {
        //if (typeof bearertoken === "undefined") return;
        // if on dev machine, just return mockup data since the webservice server is not available
        //if (location.hostname === "dev") {

        //}

        // make webservice call.
        $.support.cors = true;
        $.ajax({

            type: "GET",
            url: nexus.admintoolapi + "user/infobar",
            headers: nexus.getBearerTokenHeader(),
            success: function (data) { callback(data); },
            error: function (xhr, statusText, errorThrown) { console.log("Error: " + errorThrown); },
            dataType: "json"
        });
    }

    // -- News Content ------------------------------------
    nexus.getNewsData = function (callback) {
        //if (typeof bearertoken === "undefined") return;
        $.support.cors = true;
        $.ajax({

            type: "GET",
            url: nexus.admintoolapi + "user/news",
            headers: nexus.getBearerTokenHeader(),
            success: function (data) { callback(data); },
            error: function (xhr, statusText, errorThrown) { console.log("Error: " + errorThrown); },
            dataType: "json"
        });
    }

    // -- Update/Save Personal Info ------------------------------------------------

    nexus.getMyProfile = function (isDescription,isInternaluser) {
        //if (typeof bearertoken === "undefined") return;
        $.support.cors = true;
        $.ajax({

            type: "GET",
            url: nexus.admintoolapi + "user",
            headers: nexus.getBearerTokenHeader(),
            success: function (result) { if (isDescription) { updateAboutMeDescLabels(result); } else { updatePersonalInfoLabels(result, isInternaluser); } },
            error: function (xhr, statusText, errorThrown) { console.log("Error: " + errorThrown); },
            dataType: "json"
        });
    }

    nexus.getMyCompanyInfo = function () {
        //if (typeof bearertoken === "undefined") return;
        $.support.cors = true;
        $.ajax({

            type: "GET",
            url: nexus.admintoolapi + "user",
            headers: nexus.getBearerTokenHeader(),
            success: function (result) { updateCompanyInfoLabels(result); },
            error: function (xhr, statusText, errorThrown) { console.log("Error: " + errorThrown); },
            dataType: "json"
        });
    }

    nexus.UpdatePersonalInfo = function (userFormData) {
        //if (typeof bearertoken === "undefined") return;
        $.support.cors = true;        
        $.ajax({
            type: "PUT",
            url: nexus.admintoolapi + "user/personalinfo?" + userFormData,
            //contenttype: "application/json;charset=utf-8",
            headers: nexus.getBearerTokenHeader(),
            //data: userFormData,
            success: function (result) { nexus.getMyProfile(false, false); nexus.showDialog('Information', "Personal information saved successfully!"); console.log("Personal info saved successfully!"); },
            error: function (xhr, statusText, errorThrown) { nexus.showDialog('Alert', 'Failed to save your details, Please contact administrator.'); console.log("Could not save personal info: " + errorThrown); }

        });       
    }

    nexus.UpdatePersonalInfoInternalUser = function (userFormData) {
        $.support.cors = true;
        $.ajax({
            type: "PUT",
            url: nexus.admintoolapi + "user/internal",
            contenttype: "application/json;charset=utf-8",
            headers: nexus.getBearerTokenHeader(),
            data: userFormData,
            success: function (result) { nexus.getMyProfile(false, true); nexus.showDialog('Information', "Personal information saved successfully!"); console.log("Personal info saved successfully!"); },
            error: function (xhr, statusText, errorThrown) { nexus.showDialog('Alert', 'Failed to save your details, Please contact administrator.'); console.log("Could not save personal info: " + errorThrown); }

        });
    }

    nexus.UpdateAboutMedescription = function (aboutMeData, isInternaluser) {

        $.support.cors = true;
        $.ajax({
            type: "PUT",
            url: nexus.admintoolapi + "user/description?" + aboutMeData,
            //contenttype: "application/json;charset=utf-8",
            headers: nexus.getBearerTokenHeader(),
            //data: userFormData,
            success: function (result) { nexus.getMyProfile(true, isInternaluser); nexus.showDialog('Information', "Description information saved successfully!"); console.log("About me description info saved successfully!"); },
            error: function (xhr, statusText, errorThrown) { nexus.showDialog('Alert', 'Failed to save your details, Please contact administrator.'); console.log("Could not save personal info: " + errorThrown); }

        });
    }
    
    nexus.UpdateMyProfilePicture = function (PictureFormData) {
        $.support.cors = true;
        $.ajax({
            type: "POST",
            url: nexus.admintoolapi + "user/picture",
            headers: nexus.getBearerTokenHeader(),
            //enctype: 'multipart/form-data',
            processData: false,
            contentType: false,
            data: PictureFormData,
            success: function (result) {
                ProfileImageUpdateSuccess(result);
                console.log("Picture saved successfully");
            },
            error: function (xhr, statusText, errorThrown) {                
                ProfileImageUpdateFailure(result); console.log("Could not save picture: " +errorThrown);
        }
        });
    }
    
    nexus.UpdateUserInterests = function (userIntrstData) {
        //if (typeof bearertoken === "undefined") return;
        console.log(userIntrstData);
        //var jdata = userIntrstData.substring(1, userIntrstData.length - 1);
        //jdata = "[" + jdata + "]"; //[{"ID": 2,"Name": "Events","Status": 2},{"ID":6,"Name":"Gas Turbines","Status":2}]
        // console.log(jdata);       

        $.support.cors = true;
        $.ajax({
            type: "PUT",
            url: nexus.admintoolapi + "user/interest",
            contentType: "application/json",
            headers: nexus.getBearerTokenHeader(),
            data: userIntrstData,//[{"ID": 2,"Name": "Events","Status": 2},{"ID":6,"Name":"Gas Turbines","Status":2}],
            success: function (result) { $('#txtnewInterest').val(''); nexus.showDialog('Information', "Personal interests info saved successfully!"); console.log("Personal interests info saved successfully!"); },
            error: function (xhr, statusText, errorThrown) { nexus.showDialog('Alert', 'Failed to save your details, Please contact administrator.'); console.log("Could not save Interest: " + errorThrown); }
            //dataType: "json"
        });
    }

    nexus.UpdateUserEquipments = function (userShipsData) {
        //if (typeof bearertoken === "undefined") return;
        console.log(userShipsData);            

        $.support.cors = true;
        $.ajax({
            type: "PUT",
            url: nexus.admintoolapi + "user/masterdata",
            contentType: "application/json",
            headers: nexus.getBearerTokenHeader(),
            data: userShipsData,//[{"ID": 2,"Name": "Events","Status": 2},{"ID":6,"Name":"Gas Turbines","Status":2}],
            success: function (result) { nexus.showDialog('Information', "Equipment suggestions submitted successfully!"); console.log("Equipment suggestions submitted successfully!"); },
            error: function (xhr, statusText, errorThrown) { nexus.showDialog('Alert', 'Failed to save Equipments - Ships details, Please contact administrator.'); console.log("Could not save Equipments - Ships: " + errorThrown); }
            //dataType: "json"
        });
    }
    
    nexus.UpdateCompanyInfo=function (userCompanyInfoData) {
        //if (typeof bearertoken === "undefined") return;
        $.support.cors = true;
        $.ajax({
            type: "PUT",
            url: nexus.admintoolapi + "user/companyinfo" ,
            contenttype: "application/json;charset=utf-8",
            headers: nexus.getBearerTokenHeader(),
            data: userCompanyInfoData,
            success: function (result) { nexus.getMyCompanyInfo(); console.log("Company info saved successfully!"); },
            error: function (xhr, statusText, errorThrown) { nexus.showDialog('Alert', 'Failed to save your details, Please contact administrator.'); console.log("Could not save company info suggestions: " + errorThrown); }

        });
    }
    
    nexus.SuggestNewUserInterests = function (userIntrstData) {
        //if (typeof bearertoken === "undefined") return;
        $.support.cors = true;
        $.ajax({
            type: "PUT",
            url: nexus.admintoolapi + "user/interest",
            contentType: "application/json",
            headers: nexus.getBearerTokenHeader(),
            data: JSON.stringify(userIntrstData),
            success: function (result) { nexus.showDialog('Information', "New interests suggestion added successfully!"); console.log("New interests suggestion added successfully!"); },
            error: function (xhr, statusText, errorThrown) { nexus.showDialog('Alert','Failed to save your details, Please contact administrator.'); console.log("Could not save Interest: " + errorThrown); }
            //dataType: "json"
        });
    }

    nexus.loadUserIntrests = function () {
        //if (typeof bearertoken === "undefined") return;
        $.support.cors = true;
        $.ajax({
            type: "GET",
            url: nexus.admintoolapi + "user/Interest",
            headers: nexus.getBearerTokenHeader(),
            success: function (result) { window.userinterests = result; nexus.loadAllInterests(result); },
            error: function (xhr, statusText, errorThrown) { console.log("Error: " + errorThrown); },
            dataType: "json"
        });

    }

    nexus.loadAllInterests = function (userSelected) {
        //if (typeof bearertoken === "undefined") return;
        $.support.cors = true;
        $.ajax({
            type: "GET",
            url: nexus.admintoolapi + "list/Interest",
            headers: nexus.getBearerTokenHeader(),
            success: function (result) {
                window.AllInterests = result;
                bindPQSelectDropdowns('#dvInterests', result, userSelected);
            },
            error: function (xhr, statusText, errorThrown) { console.log("Error: " + errorThrown); },
            dataType: "json"
        });

    }
    
    ///////For Equipments (Ships)
    nexus.loadUserShipsEquipments = function () {
        //if (typeof bearertoken === "undefined") return;
        $.support.cors = true;
        $.ajax({
            type: "GET",
            url: nexus.admintoolapi + "user",
          headers: nexus.getBearerTokenHeader(),
            success: function (result) {
                //debugger;
                if (result.Equipment){                    
                    if (result.hasOwnProperty("Equipment")) {
                        if (result.HasAssignedMasterData.Ship) {
                window.userEquipShips = result.Equipment[0].Children;
                            nexus.loadAllEquipShips(window.userEquipShips);
                        }
                        if (result.HasAssignedMasterData.Engine) {
                window.userEquipEngines = result.Equipment[2].Children;
                            nexus.loadAllEquipEngines(window.userEquipEngines);
                        }
                        //For powerPlants
                        if (result.HasAssignedMasterData.Plant) {
                            window.userPowerPlants = result.Equipment[1].Children;
                            nexus.loadAllPowerPlants(window.userPowerPlants);
                        }
                        //For turbochargers
                        if (result.HasAssignedMasterData.Turbocharger) {
                            window.userTurbochargers = result.Equipment[3].Children;
                            nexus.loadAllTurboChargers(window.userTurbochargers);
                        }
                    }
                }
            },
            error: function (xhr, statusText, errorThrown) { console.log("Error: " + errorThrown); },
            dataType: "json"
        });

    }

    
    nexus.loadAllEquipShips = function (userSelectedShips) {
        //if (typeof bearertoken === "undefined") return;
        $.support.cors = true;
        $.ajax({
            type: "GET",
            url: nexus.admintoolapi + "user/availablemasterdata/ship",
            headers: nexus.getBearerTokenHeader(),
            success: function (result) {
                //debugger
                window.AllEquipShips = result;
                bindPQSelectDropdowns('#dvEquipmntShips', result, userSelectedShips);
            },
            error: function (xhr, statusText, errorThrown) { console.log("Error: " + errorThrown); },
            dataType: "json"
        });

    }
    nexus.loadAllEquipEngines = function (userSelectedEngines) {
        //if (typeof bearertoken === "undefined") return;
        $.support.cors = true;
        $.ajax({
            type: "GET",
            url: nexus.admintoolapi + "user/availablemasterdata/engine",
            headers: nexus.getBearerTokenHeader(),
            success: function (result) {
                window.AllEquipEngines = result;
                bindPQSelectDropdowns('#dvEquipmntEngTypes', result, userSelectedEngines);
            },
            error: function (xhr, statusText, errorThrown) { console.log("Error: " + errorThrown); },
            dataType: "json"
        });

    }
    //For powerPlants
    nexus.loadAllPowerPlants = function (userSelectedPowerPlants) {
        //if (typeof bearertoken === "undefined") return;
        $.support.cors = true;
        $.ajax({
            type: "GET",
            url: nexus.admintoolapi + "user/availablemasterdata/plant",
            headers: nexus.getBearerTokenHeader(),
            success: function (result) {
                window.AllPlants = result;
                bindPQSelectDropdowns('#dvPowerplants', result, userSelectedPowerPlants);
            },
            error: function (xhr, statusText, errorThrown) { console.log("Error: " + errorThrown); },
            dataType: "json"
        });

    }

    //For turbochargers
    nexus.loadAllTurboChargers = function (userSelectedTurbochargers) {
        //if (typeof bearertoken === "undefined") return;
        $.support.cors = true;
        $.ajax({
            type: "GET",
            url: nexus.admintoolapi + "user/availablemasterdata/turbocharger",
            headers: nexus.getBearerTokenHeader(),
            success: function (result) {
                window.AllTurbochargers = result;
                bindPQSelectDropdowns('#dvTurbochargers', result, userSelectedTurbochargers);
            },
            error: function (xhr, statusText, errorThrown) { console.log("Error: " + errorThrown); },
            dataType: "json"
        });

    }

    function bindPQSelectDropdowns(selctCtrl,AllAvailableItems, userSelectedItems) {
        //debugger
        $(selctCtrl).empty();
        $.each(AllAvailableItems, function (key, value) {
            var data = $.grep(userSelectedItems, function (e) { return (e.ID == value.ID); });
            if (data.length == 1) {
                $(selctCtrl)
                    .append($("<option></option>")
                    .attr("value", value.ID)
                    .text(value.Name)
                    .attr('selected', true)
                    );
            } else {
                $(selctCtrl)
                   .append($("<option></option>")
                   .attr("value", value.ID)
                   .text(value.Name)
                   );
            }
        });
        var odata = [];
        var userSelectedIds = [];
        var allinterestsIds = [];
        $.grep(userSelectedItems, function (ele) {
            userSelectedIds.push(ele.ID);
        });
        $.grep(AllAvailableItems, function (ele) {
            allinterestsIds.push(ele.ID);
        });
        //debugger
        $.grep(userSelectedIds, function (el) {
            //debugger
            if ($.inArray(el, allinterestsIds) == -1) {
                //debugger
                var objSuggests = $.grep(userSelectedItems, function (e) { return (e.ID == el); })[0];
                odata.push(objSuggests);
                //window.userinterests.push(objSuggests);
            }
        });
        console.log(odata);
        //debugger
        if (odata.length >= 1) {
            $.each(odata, function (key, value) {
                $(selctCtrl)
                    .append($("<option></option>")
                    .attr("value", value.ID)
                    .text(value.Name)
                    .attr('selected', true)
                    );
            });
        }

        $(selctCtrl).pqSelect("refreshData");
    }
    /////////////////////////////

    function updatePersonalInfoLabels(userFormData, isInternaluser) {

        //reset/update the  ng-model form edit with latest values
        $('#selTitle').val(userFormData.Gender);
        $('#PrsnlInfoFirstName').val(userFormData.FirstName);
        $('#PrsnlInfoLastName').val(userFormData.LastName);
        $('#PrsnlInfoMiddleName').val(userFormData.MiddleName);
        $('#N_PrsnlInfoPhone').val(userFormData.Phone);
        $('#N_PrsnlInfoMobilePhone').val(userFormData.MobilePhone);
        $('#PrsnlInfoJobTitle').val(userFormData.JobTitle);
        $('#PrsnlInfoEmail').val(userFormData.Email);
        if (isInternaluser) {
            $('#dvInternalDeputy').val(userFormData.Deputy);
            $('#PrsnlInfoAbsentFrom').val(getProperDateFormat(userFormData.AbsentFrom));
            $('#PrsnlInfoAbsentTo').val(getProperDateFormat(userFormData.AbsentTo));
            $('#spInternalDeputy').html(userFormData.DeputyName);
            $('#spAbsentFrom').html(userFormData.AbsentFromAsString);
            $('#spAbsentTo').html(userFormData.AbsentToAsString);

            nexus.loadDeputies(userFormData.Deputy);
        }
        //reset/update the  ng-model form display with latest values
        $('#spFirstName').html(userFormData.FirstName);
        $('#spLastName').html(userFormData.LastName);
        $('#spMiddleName').html(userFormData.MiddleName);
        $('#spPhone').html(userFormData.Phone);
        $('#spMobilePhone').html(userFormData.MobilePhone);
        $('#spJobTitle').html(userFormData.JobTitle);
        $('#spEmail').html(userFormData.Email);
        $('#spTitle').html(userFormData.Gender);
        //$('#nexus-PersonalInfo-Cancel').click();
        nexus.togglePersonalInfoButtons();
    }
    
    function getProperDateFormat(actualdateString) {
        var actualDate = new Date(actualdateString);
        var requiredDateString = '';
        var actMonth = actualDate.getMonth()+ 1;
        var strMonth = actMonth < 10 ? '-0':'-';
        requiredDateString = requiredDateString + actualDate.getFullYear() + strMonth +  actMonth.toString() + '-' + actualDate.getDate();
        return requiredDateString;
    }

    function updateCompanyInfoLabels(UsercompanyInfo) {

        //reset/update the  ng-model form edit with latest values        
        $('#CompInfoCompanyName').val(UsercompanyInfo.CompanyData.Company);
        $('#CompInfoAddress').val(UsercompanyInfo.CompanyData.Address);
        $('#CompInfoPostCode').val(UsercompanyInfo.CompanyData.PostCode);
        $('#CompInfoCity').val(UsercompanyInfo.CompanyData.City);
        $('#dvCompnyCountries').val(UsercompanyInfo.CompanyData.Country);
        $('#CompInfoSupplierID').val(UsercompanyInfo.CompanyData.SupplierID);
        $('#CompInfoCustomerID').val(UsercompanyInfo.CompanyData.CustomerID);
        $('#CompInfoCompanyPhone').val(UsercompanyInfo.CompanyData.CompanyPhone);
        $('#CompInfoWeb').val(UsercompanyInfo.CompanyData.Web);
        //reset/update the  ng-model form display with latest values
        //$('#spCompinfoPendingCount').html(UsercompanyInfo.CompanyInfoPending);
        
        $('#spCompanyAddress').html(UsercompanyInfo.CompanyData.Address);
        $('#spCompanyPostCode').html(UsercompanyInfo.CompanyData.PostCode);
        $('#spCompanyCity').html(UsercompanyInfo.CompanyData.City);
        $('#spCompanyCountry').html(UsercompanyInfo.CompanyData.Country);
        $('#spCompSupplierID').html(UsercompanyInfo.CompanyData.SupplierID);
        $('#spCompCustomerID').html(UsercompanyInfo.CompanyData.CustomerID);
        $('#spCompanyPhone').html(UsercompanyInfo.CompanyData.CompanyPhone);
        $('#spCompanyEmail').html(UsercompanyInfo.CompanyData.Web);
        $('#spCompanyName').html(UsercompanyInfo.CompanyData.Company);
        //$('#nexus-PersonalInfo-Cancel').click();
        nexus.toggleCompanyInfoButtons();
    }

    function updateAboutMeDescLabels(aboutMeData) {
        $('#spAboutMeDesc').html(aboutMeData.Description);
        $('#txtAreaDescription').val(aboutMeData.Description);

        $('#divProfileAboutMe').toggleClass("ng-hide");
        $('#divProfileAboutMeEdit').toggleClass("ng-hide");
        $('#nexus-AboutMe-Edit').toggleClass('ng-hide');
        $('#nexus-AboutMe-cancel').toggleClass('ng-hide');
        $('#nexus-AboutMe-save').toggleClass('ng-hide');
    }
    function ProfileImageUpdateSuccess(successData) {
        $('#btnEditProfPicture').removeClass("ng-hide");
        $('#btnProfEditCancel').addClass("ng-hide");
        $('#profilePicUpload').addClass("ng-hide");
        $('#btnSaveCropped').addClass("ng-hide");

        window.ClearCoordinates();
    }
    
    function ProfileImageUpdateFailure(FailedData) {
        window.ClearCurrenCanvas();
        nexus.showDialog('Alert','Failed to save the new picture, contact administrator');
        
        $('#btnEditProfPicture').toggleClass("ng-hide");
        $('#btnProfEditCancel').toggleClass("ng-hide");
        //$('#btnCropPicture').toggleClass("ng-hide");
        $('#profilePicUpload').toggleClass("ng-hide");
        $('#btnSaveCropped').toggleClass("ng-hide");
        window.drawProfilePicture();
    }
    
    nexus.togglePersonalInfoButtons = function () {
            $('#divPersonalInfoEditform').toggleClass("ng-hide");
            $('#divPersonalInfoDisplayform').toggleClass("ng-hide");

            $('#nexus-Personalinfo-edit').toggleClass('ng-hide');
            $('#nexus-Personalinfo-cancel').toggleClass('ng-hide');
            $('#nexus-Personalinfo-save').toggleClass('ng-hide');
    }

    nexus.toggleInterestButtons = function () {
        $('#nexus-Get-Interests').toggleClass('ng-hide');
        $('#nexus-PersonalInterests-save').toggleClass('ng-hide');
        $('#nexus-Cancel-Interests').toggleClass('ng-hide');
        $('#dvAddIntersts').toggleClass('ng-hide');
    }
    
    nexus.toggleCompanyInfoButtons = function () {
        $('#divPersCmpInfoDisplayform').toggleClass("ng-hide");
        $('#divPersCmpInfoEditform').toggleClass("ng-hide");
        $('#nexus-PersCompinfo-suggest').toggleClass('ng-hide');
        $('#nexus-PersCompinfo-cancel').toggleClass('ng-hide');
        $('#nexus-PersCompinfo-save').toggleClass('ng-hide');
    }

    nexus.toggleEquipmentInfoButtons = function () {
        $('#dvAddEquipmentShips').toggleClass('ng-hide');
        $('#dvAddEquipmentEngines').toggleClass('ng-hide');
        //For powerPlant
        $('#dvAddPowerPlants').toggleClass('ng-hide');
        //For turbocharger
        $('#dvAddTurbochargers').toggleClass('ng-hide');
        $('#nexus-EquipmentInfo-suggest').toggleClass('ng-hide');
        $('#nexus-EquipmentInfo-save').toggleClass('ng-hide');
        $('#nexus-EquipmentInfo-cancel').toggleClass('ng-hide');
    }

    nexus.loadCountries = function (selectedcountry) {
        //if (typeof bearertoken === "undefined") return;
        $.support.cors = true;
        $.ajax({
            type: "GET",
            url: nexus.admintoolapi + "list/country",
            headers: nexus.getBearerTokenHeader(),
            success: function (result) { bindCountries(result, selectedcountry); },
            error: function (xhr, statusText, errorThrown) { console.log("Error - fetching countries: " + errorThrown); },
            dataType: "json"
        });

    }

    nexus.loadDeputies = function (selectedDeputy) {
        //if (typeof bearertoken === "undefined") return;
        $.support.cors = true;
        $.ajax({
            type: "GET",
            url: nexus.admintoolapi + "user/admin",
            headers: nexus.getBearerTokenHeader(),
            success: function (result) { bindDeputies(result, selectedDeputy); },
            error: function (xhr, statusText, errorThrown) { console.log("Error - fetching deputies: " + errorThrown); },
            dataType: "json"
        });

    }

    function bindDeputies(availDeputies, selectedDeputy) {
            $('#dvInternalDeputy').empty();
            $.each(availDeputies, function (key, value) {
                if (selectedDeputy == value.ID) {
                    $('#dvInternalDeputy')
                        .append($("<option></option>")
                        .attr("value", value.ID)
                        .text(value.Name)
                        .attr('selected', true)
                        );
                } else {
                    $('#dvInternalDeputy')
                       .append($("<option></option>")
                       .attr("value", value.ID)
                       .text(value.Name)
                       );
                }
            });
        }

    nexus.logOnServer = function (level, text, errorCode, successCallback, failureCallback) {
        console.log("Error: " + text + errorCode);
        
        if (level != '' && level != null
            && text != '' && text != null) {
            $.support.cors = true;
            $.ajax({
                type: "POST",
                url: nexus.admintoolapi + "log/Client/" + level,
                data: text,
                headers: nexus.getBearerTokenHeader(),
                success: function (result) { successCallback(result); },
                error: function (xhr, statusText, errorThrown) { console.log("Error while logging on server: " + errorThrown); },
                dataType: "json"
            });
        }
    }

    //nexus.getPopUpInfo = function (callback) {
    //    //if (typeof bearertoken === "undefined") return;
    //    $.support.cors = true;
    //    $.ajax({

    //        type: "GET",
    //        url: nexus.admintoolapi + "user",
    //        headers: nexus.getBearerTokenHeader(),
    //        success: function (result) {
    //            callback(result);
    //        },
    //        error: function (xhr, statusText, errorThrown) { console.log("Error: " + errorThrown); },
    //        dataType: "json"
    //    });
    //}

    // -- clearn popup  Menu --------------------------------------------------

    //nexus.clearPopup = function () {
    //    //if (typeof bearertoken === "undefined") return;

    //    $.support.cors = true;
    //    $.ajax({

    //        type: "PUT",
    //        url: nexus.admintoolapi + "user/removepopup",
    //        headers: nexus.getBearerTokenHeader(),
    //        success: function (data) { },
    //        error: function (xhr, statusText, errorThrown) { console.log("Error: " + errorThrown); },
    //        dataType: "json"
    //    });
    //}


    function bindCountries(allCountries, selectedcountry) {
        $('#dvCompnyCountries').empty();
        $.each(allCountries, function (key, value) {            
            if (selectedcountry == value.Name) {
                $('#dvCompnyCountries')
                    .append($("<option></option>")
                    .attr("value", value.Name)
                    .text(value.Name)
                    .attr('selected', true)
                    );
            } else {
                $('#dvCompnyCountries')
                   .append($("<option></option>")
                   .attr("value", value.Name)
                   .text(value.Name)
                   );
            }
        });
        
        $('#divPersCmpInfoDisplayform').toggleClass("ng-hide");
        $('#divPersCmpInfoEditform').toggleClass("ng-hide");
        $('#nexus-PersCompinfo-suggest').toggleClass('ng-hide');
        $('#nexus-PersCompinfo-cancel').toggleClass('ng-hide');
        $('#nexus-PersCompinfo-save').toggleClass('ng-hide');
    }

});