var feedManagerEndpoint;
var xhrs = [];
window.blog = [];
var figdata = "";
var currentUser;
var currindex = 3,
    showContactsDD = true,
    adminToolReplyCount = 0,
    portalReplyCount = 0;
var targetUsersService = '';

function initiateDirectContactWidget() {
    if (!!$('#nexus-widget-project-social-feed')) {
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
        else
            targetUsersService = nexus.admintoolapi + "user/contact";
    }
    else
        targetUsersService = nexus.admintoolapi + "user/contact";
    
    showContactsDD = true,
    adminToolReplyCount = 0,
    portalReplyCount = 0;
    figdata = "<a href='#'><img src='" + nexus.admintoolapi + "user/" + nexus.currentUserAccountName + "/picture' alt='Image Alternate Description' title='Image Title'></a>";
    
    loadTargetSites();
    loadPostAndReplies();
}

//nexus.admintoolapi = "http://etdkcphas004.mdt-ext-test.biz:82/";

$(document).ready(function () {
    
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

            var results = ConvertSPSearchResult_DirectContact(targetsitesresult);



            $.each(results, function (i, value) {
                if (value.SPSiteURL.indexOf("personal") == -1) {

                    targetSites += '<li data-identifier="directcont" data-key="' + (j + 1) + '">' + value.SPSiteURL + '</li>';
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
                            targetSites += '<li data-identifier="directcont" data-userid="' + value.ID + '" data-key="' + (j + 1) + '">' + value.Name + ', ' + value.ID + '</li>';
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
                            $(".nexus-feed-new-message-form .nexus-dropdown-list").closest("[id^='MSOZoneCell_']").show();
                            $('#nexus-dropdown-direct-contact-user-name').closest("[id^='MSOZoneCell_']").show();
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
                            $("#nexus-dropdown-direct-contact").each(function () {
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

                            $("nexus-dropdown-direct-contact").each(function () {

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

                            max = Math.max(max, $(".nexus-dropdown-list").outerWidth(true));

                            var buttonWidth = $(".nexus-dropdown-button").outerWidth(true);
                            var margin = 10;

                            // set the width of 'TO' dropdown to that of 'Message' input box
                            $(".nexus-dropdown-selected-value:not(#nexus-project-status-selected-value)").width($('.nexus-feed-new-message-form-input').width());

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
            var searchResult = ConvertSPSearchResult_DirectContact(data);
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
   var ID = control.id;
    if (oKeyEvent.keyCode == 13) {

        $.ajax({
            url: $(control).attr("source") + "/_api/social.feed/post/reply",
            type: "POST",
            beforeSend: function () {
                $("#wait").show();
            },
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
                $("#wait").hide();
                var html = $(control).parent().prev().length === 0 ? $(control).parent() : $(control).parent().prev();
                html.before("<li><figure>" + figdata + "</figure><div><h4>" + nexus.currentUserName + "</h4>" + document.getElementById(control.id).value + "</div></li>");
               
               
                document.getElementById(control.id).value = "";
            },
            error: function (xhr, ajaxOptions, thrownError) {
                $("#wait").hide();
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
function ConvertSPSearchResult_DirectContact(data) {
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
                if (isNaN(timestamp.getTime())) {
                    var parts = value.LastModified.match(/\d+/g);
                    var isoTime = Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
                    timestamp = new Date(isoTime);
                }

                //console.log("FT"+FriendlyTime);
                blog.push({
                    ID: value.ID,
                    Post: value.Message,
                    Replies: jQuery.Enumerable.From(value.Replies).ToArray(),
                    PostAuthor: value.UserName,
                    destination: "AdminTool",
                    UserID: value.UserID,
                    Timestamp: timestamp,
                    FriendlyTime: FriendlyTime,
                    ReplyCount: jQuery.Enumerable.From(value.Replies).ToArray().length,
                    tempReplies: jQuery.Enumerable.From(value.Replies).ToArray()
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
        beforeSend: function () {
            $("#wait").css("display", "block");
        },
        success: function (result) {
            $("#wait").css("display", "none");
            var len = $(control).closest('ul').children().length - 2;
            if (len  == 1 ) {
                
                $(control).closest('ul').find('li').eq(0).before("<li><figure>" + figdata + "</figure><div><h4>" + nexus.currentUserName + "</h4>" + message + "<small><span><a href=\"#\">About a second ago</a></span></small></div></li>")
                
            } else {
                
               $(control).closest('ul').find('li').eq(0).before("<li><figure>" +figdata + "</figure><div><h4>" +nexus.currentUserName + "</h4>" +message + "<small><span><a href=\"#\">About a second ago</a></span></small></div></li>")
            }
            
            $('div input[id=' + control.id + ']').val('');
            $('div input[id=' + control.id + ']').text('');

        },
        error: function (xhr, statusText, errorThrown) {
            $("#wait").css("display", "none");
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
            nexus.showDialog('Alert', "Please Select Target....");
            return;
        }
        if (message === 'What\'s on your mind?'
            || message == '')
        {
            nexus.showDialog('Alert', "Please type a message.");
            return;
        }
        $("#txtdcMessage").val('');
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
        if (!!blog && blog.length > 0) {
            var data = jQuery.Enumerable.From(blog).OrderByDescending("$.Timestamp").ToArray();
            var firstThreeblogs = jQuery.Enumerable.From(data).Take(3).ToArray();
            var firstThreeblogs_blogsCount = firstThreeblogs.length < 3 ? firstThreeblogs.length : 3;
            for (var i = 0; i < firstThreeblogs_blogsCount; i++) {
                firstThreeblogs[i].tempReplies = jQuery.Enumerable.From(firstThreeblogs[i].Replies).Take(3).ToArray();
            }
            $("#contactTemplate").tmpl(firstThreeblogs).appendTo("#nexus-feed");
            $("#loading").html("");
            var allBlogs = jQuery.Enumerable.From(blog).ToArray();
            for (var i = 0; i < allBlogs.length; i++) {
                if (allBlogs[i].ReplyCount > 2) {
                    $("#nexus-direct-contact-blog-more-replies-button-" + allBlogs[i].ID).show();
                }
                else {
                    $("#nexus-direct-contact-blog-more-replies-button-" + allBlogs[i].ID).hide();
                }


                if (!!data) {
                    if (data.length <= 0) {
                        $('a.nexus-button-white').removeAttr('onclick').css('cursor', 'default');
                        if (!showContactsDD) {
                            $(".nexus-feed-new-message-form .nexus-dropdown-list").addClass('nexus-widget-no-data-hide');
                        }
                    }
                }
                else {
                    if (!showContactsDD) {
                        $(".nexus-feed-new-message-form .nexus-dropdown-list").addClass('nexus-widget-no-data-hide');
                    }

                }
            }
        }
        else {
            $("#loading").html("");
        }
    });
}





function RepyToPostOnclick(control, oKeyEvent) {
    
        var destination = $(control).attr("destination");
        switch (destination) {
            case "AdminTool":

                ReplyToAdminTool(control, $(control).prev().val());
                break;
            case "Portal":
                Reply(control, oKeyEvent);
                break;

        
    }

      
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


function loadMoreReplies(blogid) {
    //var repliesindex = jQuery.Enumerable.From(blog).Where("$.ID == " + blogid).ToArray()[0].Replies.ReplyCount;
    var totlaReplies = jQuery.Enumerable.From(blog).Where("$.ID == " + blogid).ToArray()[0].Replies.length;
    var currentBlogReplies = jQuery.Enumerable.From(blog).Where("$.ID == " + blogid).ToArray()[0].Replies;
    jQuery.Enumerable.From(blog).Where("$.ID == " + blogid).ToArray()[0].ReplyCount = jQuery.Enumerable.From(blog).Where("$.ID == " + blogid).ToArray()[0].ReplyCount - 3;
    //var repliesindex = jQuery.Enumerable.From(blog).Where("$.ID == " + blogid).ToArray()[0].Replies.ReplyCount;
    var remainingRecords = jQuery.Enumerable.From(blog).Where("$.ID == " + blogid).ToArray()[0].ReplyCount;
    if (remainingRecords <= 0) {
        nexus.showDialog('Alert', "No More Records to Show");
    }
    else if (remainingRecords >= 3) {
        var repliesToShow = jQuery.Enumerable.From(currentBlogReplies).Skip(totlaReplies - remainingRecords).Take(3).ToArray();
        var html = '<ul>';
        for (var i = 0; i < repliesToShow.length; i++) {
            html += '<li>' +
                   '<figure>' +
                       '<a href="#">' +
                           '<img src="' + nexus.admintoolapi + 'user/' + repliesToShow[i].UserID + '/picture" alt="Image Alternate Description" title="Image Title">' +
                       '</a>' +
                   '</figure>' +
                   '<div>' +
                       '<h4>' + repliesToShow[i].UserName + '</h4>' +
                        repliesToShow[i].Message +
                       '<small><span><a href="#">' + SP.DateTimeUtil.SPRelativeDateTime.getRelativeDateTimeString(new Date(repliesToShow[i].Timestamp), true, SP.DateTimeUtil.SPCalendarType.none, false) + '</a></span></small>' +
                   '</div>' +
               '</li>'
        }
        html += '</ul>';
        $("div#" + blogid).append(html);
    }

    else {
        var repliesToShow = jQuery.Enumerable.From(currentBlogReplies).Skip(totlaReplies - remainingRecords).Take(remainingRecords).ToArray();
        var html = '<ul>';
        for (var i = 0; i < repliesToShow.length; i++) {
            html += '<li>' +
                   '<figure>' +
                       '<a href="#">' +
                           '<img src="' + nexus.admintoolapi + 'user/' + repliesToShow[i].UserID + '/picture" alt="Image Alternate Description" title="Image Title">' +
                       '</a>' +
                   '</figure>' +
                   '<div>' +
                       '<h4>' + repliesToShow[i].UserName + '</h4>' +
                        repliesToShow[i].Message +
                       '<small><span><a href="#">' + SP.DateTimeUtil.SPRelativeDateTime.getRelativeDateTimeString(new Date(repliesToShow[i].Timestamp), true, SP.DateTimeUtil.SPCalendarType.none, false) + '</a></span></small>' +
                   '</div>' +
               '</li>'
        }
        html += '</ul>';
        $("div#" + blogid).append(html);
    }

}

function showMore() {
    var remainingRecords = blog.length - currindex;
    if (blog.length <= 0)
    {
        nexus.showDialog('Alert', "No More Records to Show");
        return;
    }
    if (remainingRecords <= 0) {
        nexus.showDialog('Alert', "No More Records to Show");
        return;
    }
    else if (remainingRecords >= 3) {
        currindex = currindex + 3;
    }
    else {
        currindex = currindex + remainingRecords;
    }

    var blogs = jQuery.Enumerable.From(blog).Skip(currindex).Take(3).ToArray();
    if (!!blogs && blogs.length) {
        var firstThreeblogs_blogsCount = blogs.length < 3 ? blogs.length : 3;
        for (var i = 0; i < firstThreeblogs_blogsCount; i++) {
            var replies = jQuery.Enumerable.From(blogs[i].Replies).Take(3).ToArray();
            blogs[i].tempReplies = replies;
        }
        $("#contactTemplate").tmpl(blogs).appendTo("#nexus-feed");

        var allBlogs = jQuery.Enumerable.From(blog).ToArray();
        for (var i = 0; i < allBlogs.length; i++) {
            if (allBlogs[i].ReplyCount > 2) {
                $("#nexus-direct-contact-blog-more-replies-button-" + allBlogs[i].ID).show();
            }
            else {
                $("#nexus-direct-contact-blog-more-replies-button-" + allBlogs[i].ID).hide();
            }
        }
    }
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
