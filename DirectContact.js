var feedManagerEndpoint;
var xhrs = [];
window.blog = [];
var figdata = "";
var currentUser;
var currindex = 3,
    showContactsDD = true,
    adminToolReplyCount = 0,
    portalReplyCount = 0;

function initiateWidget() {
    showContactsDD = true,
    adminToolReplyCount = 0,
    portalReplyCount = 0;
    figdata = "<a href='#'><img src='" + nexus.admintoolapi + "user/" + nexus.currentUserAccountName + "/picture' alt='Image Alternate Description' title='Image Title'></a>";
    loadTargetSites();
    loadPostAndReplies();
}

//nexus.admintoolapi = "http://etdkcphas004.mdt-ext-test.biz:82/";
var targetUsersService = nexus.admintoolapi + "user/contact";
$(document).ready(function () {
    if(!!$('#nexus-widget-project-social-feed')) {
        if ($('#nexus-widget-project-social-feed header h2 a').text() === 'Project social feed') {
            var regexp = /\//g;
            var url = window.location.pathname;
            var match, matches = [];

            while ((match = regexp.exec(url)) != null) {
                matches.push(match.index);
            }
            //console.log(foo.slice(0, matches[2]));
            targetUsersService = nexus.admintoolapi + "list/projectmember/" + url.slice(0, matches[2]);
        }
    }

    initiateWidget();
});
function loadTargetSites() {
    var targetSites = [];
    //$(".nexus-feed-new-message-form .nexus-dropdown-list").empty();
    var targetSites = '<ul>',
        j = 0;
    targetSites += '<li data-key="0" data-identifier="directcont" id="selectDirCont">--- select target ---</li>';
    //$(".nexus-feed-new-message-form .nexus-dropdown-list").append(targetSites);
    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/search/query?querytext=%27ContentType:Post%27&trimduplicates=true&selectproperties=%27SPSiteURL%27&collapsespecification=%27SPSiteURL%27",
        success: function (targetsitesresult) {

            var results = ConvertSPSearchResult(targetsitesresult);



            $.each(results, function (i, value) {
                if (value.SPSiteURL.indexOf("personal") == -1) {

                    targetSites += '<li data-identifier="directcont" data-key="' + (j) + '">' + value.SPSiteURL + '</li>';
                    j++;
                    //$(".nexus-feed-new-message-form .nexus-dropdown-list").append(optionhtml);
                }
            });
        },
        cache: true,
        error: function (xhr, ajaxOptions, thrownError) {
            nexus.log(nexus.errorLevels.error, xhr.responseText, xhr.status);
        },
        headers: {
            "accept": "application/json;odata=verbose"

        }
    }).
    done(

                $.ajax({
                    type: 'GET',
                    url: targetUsersService,
                    headers: nexus.getBearerTokenHeader(),
                    success: function (data) {


                        $.each(data, function (i, value) {
                            targetSites += '<li data-identifier="directcont" data-userid="' + value.ID + '" data-key="' + (j) + '">' + value.Name + ', ' + value.ID + '</li>';
                            j++;
                        });
                        targetSites += '</ul>';

                        // there are no values in the dropdown, hide the widget
                        if (j === 0) {
                            showContactsDD = false;
                            //$(".nexus-feed-new-message-form .nexus-dropdown-list").attr('disabled', true);
                            $(".nexus-feed-new-message-form .nexus-dropdown-list").closest("[id^='MSOZoneCell_']").hide();
                            $('#nexus-dropdown-direct-contact-user-name').closest("[id^='MSOZoneCell_']").hide();
                        }
                        else {
                            $(".nexus-feed-new-message-form .nexus-dropdown-list").html(targetSites);

                            $('.nexus-dropdown .nexus-dropdown-list ul li').on('click', function () {
                                var identifier = $(this).data('identifier');
                                if (identifier === 'directcont')
                                    $('#nexus-dropdown-direct-contact-user-name').text($(this).text());
                            });

                            var items = $(".nexus-dropdown-list li");
                            var i, max = $(".nexus-dropdown-selected-value").outerWidth(true);
                            //$.each($(".nexus-dropdown-list li"), function () {
                            //    max = Math.max(max, $(this).outerWidth(true));
                            //});

                            //for (i = 0; i < items.length; i++) {
                            //    $(".nexus-dropdown-selected-value").text($(items[i]).text());
                            //    max = Math.max(max, $(".nexus-dropdown-selected-value").outerWidth(true));
                            //}

                            max = Math.max(max, $(".nexus-dropdown-list").outerWidth(true));

                            var buttonWidth = $(".nexus-dropdown-button").outerWidth(true);
                            var margin = 10;
                            $(".nexus-dropdown-selected-value").width(max + margin + buttonWidth);

                        }
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        nexus.log(nexus.errorLevels.error, xhr.responseText, xhr.status);
                    },
                    headers: {
                        "accept": "application/json;odata=verbose",
                        "Authorization": "Bearer " + bearertoken
                    }
                })

        )

}


function getRepliesFromPortal() {
    var UserID = nexus.currentUserWithDomainName;

    var xhrportalpost = $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/search/query?querytext=%27ContentType:Post%20AND%20PostAuthor:" + UserID + "%20OR%20MDTeMailSubscriber:" + UserID + "%27&selectproperties=%27eMailSubscriber,PostAuthor,Post,PostReply,Title,RootPostOwnerID,FullPostBody,RootPostUniqueID,RootPostID,ListItemID,DefinitionIdOWSINTG,ReplyCount,LastModifiedTime,MDTDCReplies%27",
        cache: true,
        success: function (data) {
            var searchResult = ConvertSPSearchResult(data);
            var count = 0;
            $.each(searchResult, function (i, value) {

                var myString = value.PostAuthor;
                var windowsUserRegex = /([a-z]+[-][a-z]+)[\\]([a-z]+)/g;
                var match = windowsUserRegex.exec(myString);


                var LastModifiedTime = new Date(value.LastModifiedTime.split('.')[0] + "Z");

                // a fix for IE9. IE9 fails on milliseconds with digit counts other than 3, gives "Invalid Date".
                if (isNaN(LastModifiedTime.getTime())) {
                    var parts = (value.LastModifiedTime.split('.')[0] + "Z").match(/\d+/g);
                    var isoTime = Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
                    LastModifiedTime = new Date(isoTime);
                }

                var FriendlyTime = SP.DateTimeUtil.SPRelativeDateTime.getRelativeDateTimeString(LastModifiedTime, true, SP.DateTimeUtil.SPCalendarType.none, false);
                blog.push({
                    ID: value.RootPostOwnerID + "." + value.RootPostUniqueID + "." + value.ListItemID + "." + value.ListItemID + ".1",
                    Post: value.FullPostBody,
                    Replies: JSON.parse(value.MDTDCReplies),
                    PostAuthor: value.Title,

                    Timestamp: new Date(LastModifiedTime),
                    destination: "Portal",
                    UserID: nexus.currentUserAccountName,
                    FriendlyTime: FriendlyTime
            });
                count++;
            });
            if (count === 0) {
                portalReplyCount = 0;
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            nexus.log(nexus.errorLevels.error, xhr.responseText, xhr.status);
        },
        headers: {
            "accept": "application/json;odata=verbose"
        }
    })
    xhrs.push(xhrportalpost);

}
function Reply(control, oKeyEvent) {
    //alert(ID);

    var ID = control.id;
    if (oKeyEvent.keyCode == 13) {

        $.ajax({
            url: $(control).attr("source") + "/_api/social.feed/post/reply",
            type: "POST",
            data: JSON.stringify({
                'restCreationData': {
                    '__metadata': {
                        'type': 'SP.Social.SocialRestPostCreationData'
                    },
                    'ID': ID,
                    'creationData': {
                        '__metadata': {
                            'type': 'SP.Social.SocialPostCreationData'
                        },
                        'ContentText': control.value,
                        'UpdateStatusText': false
                    }
                }
            }),
            headers: {
                "accept": "application/json;odata=verbose",
                "content-type": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function () {
                var html = $(control).parent().prev().length === 0 ? $(control).parent() : $(control).parent().prev();
                html.before("<li><figure>" + figdata + "</figure><div><h4>" + currentUserName + "</h4>" + document.getElementById(control.id).value + "</div></li>");
                document.getElementById(control.id).value = "";
            },
            error: function (xhr, ajaxOptions, thrownError) {
                nexus.log(nexus.errorLevels.error, xhr.responseText, xhr.status);
            }
        });
    }
}
function postToMyFeed(destination, message) {
    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/social.feed/actor(item=@av)/feed/post/?@av='" + destination + "/newsfeed.aspx'",
        type: "POST",
        data: JSON.stringify({
            'restCreationData': {
                '__metadata': {
                    'type': 'SP.Social.SocialRestPostCreationData'
                },
                'ID': null,
                'creationData': {
                    '__metadata': {
                        'type': 'SP.Social.SocialPostCreationData'
                    },
                    'ContentText': message,
                    'UpdateStatusText': false
                }
            }
        }),
        headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function () {
            //console.log("success to post ");
            $("#txtdcMessage").val("");
            loadPostAndReplies();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            nexus.log(nexus.errorLevels.error, xhr.responseText, xhr.status);
        }
    });
}
function ConvertSPSearchResult(data) {
    var queryResults = data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results;
    var tempResults = [];
    var cellValues = [];
    var tempColumns = [];

    var propertiesToShow = ['Title', 'Author', 'ReplyCount', 'FileExtension', 'LastModifiedTime', 'OriginalPath', 'SPSiteURL', 'RootPostOwnerID', 'FullPostBody', 'DefinitionIdOWSINTG', 'RootPostUniqueID', 'RootPostID', 'ListItemID', 'DefinationID', 'MDTDCReplies', 'PostAuthor'];

    for (var i = 0; i < queryResults.length; i++) {
        var item = [];

        for (var h = 0; h < queryResults[i].Cells.results.length; h++) {

            var key = queryResults[i].Cells.results[h].Key;
            var value = queryResults[i].Cells.results[h].Value;
            if (propertiesToShow.indexOf(key) !== -1) {
                item[key] = value;
            }
        }

        tempResults.push(item);
    }

    results = tempResults;
    return tempResults;
}

function getRepliesFromAdminTool() {
    $.support.cors = true;
    var admintoolblog = $.ajax({
        url: nexus.admintoolapi + "user/communication",
        cache: true,
        type: "GET",
        success: function (data) {

            var count = 0;
            $.each(data, function (i, value) {

                var UTCRegex = /([0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}).(\d)/g;
                var match = UTCRegex.exec(value.LastModified);
                var Time;

                try {
                    if (match === null) {
                        //console.log(value.LastModified);
                        Time = new Date(value.LastModified);
                    }
                    else {
                        //console.log(value.LastModified);
                        Time = new Date(match[1] + "Z");
                    }
                }
                catch (err) {

                }

                var FriendlyTime = SP.DateTimeUtil.SPRelativeDateTime.getRelativeDateTimeString(Time, true, SP.DateTimeUtil.SPCalendarType.none, false);
                var timestamp = new Date(value.LastModified);

                // a fix for IE9. IE9 fails on milliseconds with digit counts other than 3, gives "Invalid Date".
                if (isNaN(timestamp.getTime()))
                {
                    var parts = value.LastModified.match(/\d+/g);
                    var isoTime = Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
                    timestamp = new Date(isoTime);
                }

                //console.log("FT"+FriendlyTime);
                blog.push({
                    ID: value.ID,
                    Post: value.Message,
                    Replies: jQuery.Enumerable.From(value.Replies).Take(2).ToArray(),
                    PostAuthor: value.UserName,
                    destination: "AdminTool",
                    UserID: value.UserID,
                    Timestamp: timestamp,
                    FriendlyTime: FriendlyTime
                });
                count++;
            });
            if (count === 0) {
                adminToolReplyCount = 0;
            }
        },

        error: function (xhr, ajaxOptions, thrownError) {
            nexus.log(nexus.errorLevels.error, xhr.responseText, xhr.status);
        },
        headers: {
            "accept": "application/json;odata=verbose",
            "Authorization": "Bearer " + bearertoken
        }
    });
    xhrs.push(admintoolblog);
}
function PostToAdminTool(control, message) {
    var targetUser = $('#nexus-dropdown-direct-contact-user-name').text().split(',')[1].trim();
    var url = nexus.admintoolapi + "user/communication/new/" + targetUser;
    var dataput = message;

    $.support.cors = true;
    $.ajax({

        type: "POST",
        url: url,
        headers: { 'Authorization': 'Bearer ' + bearertoken },
        data: dataput,
        success: function (result) {
            $(control).val('');
            loadPostAndReplies();
        },
        error: function (xhr, statusText, errorThrown) {
            nexus.log(nexus.errorLevels.error, xhr.responseText, xhr.status);
        },
        dataType: "json"
    });
}

function ReplyToAdminTool(control, message) {
    var threadId = control.id;
    var url = nexus.admintoolapi + "user/communication/reply/" + threadId;


    $.support.cors = true;
    $.ajax({

        type: "POST",
        url: url,
        headers: { 'Authorization': 'Bearer ' + bearertoken },
        data: message,
        success: function (result) {
            var html = $(control).parent().prev().length === 0 ? $(control).parent() : $(control).parent().prev();
            html.before("<li><figure>" + figdata + "</figure><div><h4>" + currentUserName + "</h4>" + document.getElementById(control.id).value + "</div></li>");
            document.getElementById(control.id).value = "";
        },
        error: function (xhr, statusText, errorThrown) {
            nexus.log(nexus.errorLevels.error, xhr.responseText, xhr.status);
        },
        dataType: "json"
    });
}

function Validate(control, oKeyEvent) {
    if (oKeyEvent.keyCode == 13
        || oKeyEvent.keyCode == 0
        || oKeyEvent.keyCode === undefined) {
        CreatePost(control, oKeyEvent);
    }
    else
        return;
}
function CreatePost(control, oKeyEvent) {

    var selectedValue = $('#nexus-dropdown-direct-contact-user-name').text();

    var destination = selectedValue.indexOf("http") == -1 ? "AdminTool" : "Portal";
    var message = $("#txtdcMessage").val();
    if (oKeyEvent.keyCode == 13
        || oKeyEvent.keyCode == 0
        || oKeyEvent.keyCode === undefined) {
        if ($("#nexus-dropdown-direct-contact-user-name").text() === $(".nexus-dropdown .nexus-dropdown-list ul").find("#selectDirCont").text()) {
            alert("Please Select Target....");
            return;
        }
        if (message === 'What\'s on your mind?'
            || message == '')
        {
            alert('Please type a message.');
            return;
        }
        switch (destination) {
            case "AdminTool":
                PostToAdminTool(control, message);
                break;
            case "Portal":
                postToMyFeed(selectedValue, message)
                break;

        }
    }
}

function loadPostAndReplies() {
    window.blog = [];
    $("#loading").html("Loading Please Wait......");
    $("#nexus-feed").html("");

    getRepliesFromAdminTool();
    getRepliesFromPortal();
    $.when.apply($, xhrs).then(function () {

        var data = jQuery.Enumerable.From(blog).OrderByDescending("$.Timestamp").ToArray()
        $("#contactTemplate").tmpl(jQuery.Enumerable.From(data).Take(3).ToArray()).appendTo("#nexus-feed");
        $("#loading").html("");

        if (!!data) {
            if (data.length <= 0) {
                $('a.nexus-button-white').removeAttr('onclick').css('cursor', 'default');
                if (!showContactsDD)
                {
                    $(".nexus-feed-new-message-form .nexus-dropdown-list").addClass('nexus-widget-no-data-hide');
                }
            }
        }
        else {
            if (!showContactsDD) {
                $(".nexus-feed-new-message-form .nexus-dropdown-list").addClass('nexus-widget-no-data-hide');
            }
        }
    });
}
function RepyToPost(control, oKeyEvent) {
    if (oKeyEvent.keyCode == 13) {
        var destination = $(control).attr("destination");
        switch (destination) {
            case "AdminTool":

                ReplyToAdminTool(control, $(control).val());
                break;
            case "Portal":
                Reply(control, oKeyEvent);
                break;

        }
    }
}
function parseUserID(userid, expression) {
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
function showMore() {
    var remainingRecords = blog.length - currindex;
    if (remainingRecords === 0) {
        alert("No More Records to Show");
    }
    else if (remainingRecords >= 3) {
        currindex = currindex + 3;
    }
    else {
        currindex = currindex + remainingRecords;
    }
    $("#contactTemplate").tmpl(jQuery.Enumerable.From(blog).Skip(currindex).Take(3).ToArray()).appendTo("#nexus-feed");
}
function GetTime(Time) {
    var UTCRegex = /([0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}).(\d)/g;
    var match = UTCRegex.exec(Time);
    try {
        if (match === null) {
            Time = new Date(Time);
        }
        else {

            Time = new Date(match[1] + "Z");
        }
    }
    catch (err) {
    }
    var FriendlyTime = SP.DateTimeUtil.SPRelativeDateTime.getRelativeDateTimeString(Time, true, SP.DateTimeUtil.SPCalendarType.none, false);
    return FriendlyTime;
}
