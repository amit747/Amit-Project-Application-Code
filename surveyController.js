function executeSurvey() {
    var angularConfig = {
        url: "",
        method: "GET",
        dataType: "json",
        crossDomain: true,
        //for staticdata please comment Accept and Authorization
        headers:
            {
                "accept": "application/json;odata=verbose",
                "content-type": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            }
    };

    var id = document.getElementById("surveyApp"),
        qData = null;
    var surveyApp = angular.module('surveyApp', []);

    surveyApp.controller('surveyController', [
                        "$scope",
                        "$http",
                        "$q",
                        function ($scope, $http, $q) {
        function allDone(promises, callback) {

            if (!angular.isArray(promises)) {
                throw Error("$q.allComplete only accepts an array.");
            }

            // var deferred = new Deferred();
            var passed = 0;
            var failed = 0;
            var responses = [];

            angular.forEach(promises, function (promise, index) {
                $q.when(promise)
                  .then(function (result) {
                      passed++;
                      responses.push(result);
                  })
                  .catch(function (result) {
                      //console.error('err', result);
                      failed++;
                      responses.push(result);
                  })
                  .finally(function () {
                      if ((passed + failed) == promises.length) {
                          callback(responses);
                     }
                  })
                ;
            });
        }

        function list(name, url, listUrl) {
            this.name = name;
            this.url = url;
            this.listUrl = listUrl;
        }

        waitForInfobarData();
        waitForRecords();
        function waitForRecords() {
            if (!!qData
                && $('#nexus-welcome-banner-container ul li').length > 0) {
                if ($('#nexus-welcome-banner-container ul li').length > 1)
                    $('#nexus-welcome-banner-container').unslider();
                else {
                    $('#nexus-welcome-banner-container').removeAttr('style');
                    var height = $('#nexus-welcome-banner-container ul li').height() + 35;
                    $("#nexus-infobar-welcome .nexus-infobar-content-container").css({ 'height': height });
                    $('#nexus-welcome-banner-container').unslider(1);
                }
            }
            else {
                setTimeout(waitForRecords, 500);
            }
        }
        function waitForInfobarData() {
            if (!!infobarData
                && !!currentUserId) {

                var listNames = new Array(),
                    serviceNames = new Array(), serviceName, i = 0,
                    apiList = new Array();
                $.support.cors = true;

                
                if (infobarData.Surveys.length > 0) {
                    $.each(infobarData.Surveys, function (current, item) {

                        serviceName = 'itemSurvey'
                        serviceName += i;
                        var listUrl = "/content/surveys";
                       //listUrl =  "http://dtdkcphas0935/sites/surveys";
                        var webUrl = listUrl + "/_api/lists/getbytitle('" + item.Name.replace("'", "''") + "')/items?filter=AuthorId eq " + currentUserId;

                        var thisList = new list(item.Name, webUrl, listUrl);
                        listNames.push(thisList);

                        var angularConfig = {
                            url: webUrl,
                            method: "GET",
                            dataType: "json",
                            crossDomain: true,
                            //for staticdata please comment Accept and Authorization
                            headers:
                                {
                                    "accept": "application/json;odata=verbose",
                                    "content-type": "application/json;odata=verbose",
                                    "X-RequestDigest": $("#__REQUESTDIGEST").val()
                                }
                        };
                        apiList.push(angularConfig);
                        //serviceName = $http(angularConfig);
                        serviceNames.push(serviceName);
                        i++;
                    });

                    var responseData = new Array(), l = 0,
                        userResponded = false;

                    allDone(apiList.map(function (header) {
                        return $http(header);
                    }),
                        function (values) {
                            if (!!values) {
                                if (values.length > 0) {
                                    $.each(values, function (p, value) {
                                        if (value.statusText.toLowerCase() === 'ok') {
                                            if (value.data.d.results.length > 0) {
                                                $.each(value.data.d.results, function (p, response) {
                                                    if (response.AuthorId === currentUserId) {
                                                        userResponded = true;
                                                        //var results = listNames.filter(function (entry) { return entry.url == value.config.url; });
                                                        //value.data.d.results["ListName"] = results[0].name;
                                                        //value.data.d.results["ListUrl"] = results[0].listUrl;
                                                        //responseData.push(value);
                                                    }
                                                });
                                                if (!userResponded) {
                                                    var results = listNames.filter(function (entry) { return entry.url == value.config.url; });
                                                    value.data.d.results["ListName"] = results[0].name;
                                                    value.data.d.results["ListUrl"] = results[0].listUrl;
                                                    responseData.push(value);
                                                }
                                            }
                                        }
                                        l++;
                                    });
                                }
                            }
                            
                            if (!!responseData) {// there is/are some lists(s) for which user hasn't responded, so fetch the question/options
                                if (responseData.length > 0) {
                                    getQuestionsAndChoices(responseData);
                                }
                                else {
                                    $('#surveyApp').hide();
                                    $("#nexus-infobar-welcome .nexus-infobar-content-container").html(infobarData.WelcomeText);
                                    }
                            }
                            else {
                                $('#surveyApp').hide();
                                $("#nexus-infobar-welcome .nexus-infobar-content-container").html(infobarData.WelcomeText);
                                }
                        });
                }
                else {
                    $('#surveyApp').hide();
                    $("#nexus-infobar-welcome .nexus-infobar-content-container").html(infobarData.WelcomeText);
                    }
            }
            else {
                setTimeout(waitForInfobarData, 500);
            }
        }


        $scope.submitResponse = function (context) {
            var userChoice = $('input[type="radio"][name="' + context.record.Title + '"]:checked').val();
            var questionId = context.record.InternalName;
            var listName = context.record.DefaultValue;
            var listUrl = context.record.ListUrl;
            nexus.submitSurveyResponse(userChoice, listName, questionId, listUrl);
        }

        function getQuestionsAndChoices(responseData) {
            var rCount = 0,
                lCount = 0,
                surveyData = new Array();
            var listNames = new Array(),
                serviceNames = new Array(), serviceName, i = 0,
                apiList = new Array();

            if (!!responseData) { // there is/are some survey(s) to which the user has not responded yet
                var qCount = 0;
                $.support.cors = true;
                $.each(responseData, function (l, item) {
                    serviceName = 'fieldSurvey'
                    serviceName += i;
                  // item.data.d.results.ListUrl = "http://dtdkcphas0935/sites/surveys";
                   var listUrl = item.data.d.results.ListUrl + "/_api/lists/getbytitle('" + item.data.d.results.ListName.replace("'", "''") + "')/fields"; //= "http://dtdkcphas0935/sites/surveys" + "/_api/lists/getbytitle('" + item.data.d.results.ListName.replace("'", "''") + "')/fields";

                   var thisList = new list(item.data.d.results.ListName, listUrl, item.data.d.results.ListUrl);
                    listNames.push(thisList);

                    var angularConfig = {
                        url: listUrl,
                        method: "GET",
                        dataType: "json",
                        crossDomain: true,
                        //for staticdata please comment Accept and Authorization
                        headers:
                            {
                                "accept": "application/json;odata=verbose",
                                "content-type": "application/json;odata=verbose",
                                "X-RequestDigest": $("#__REQUESTDIGEST").val()
                            }
                    };
                    apiList.push(angularConfig);
                    serviceNames.push(serviceName);
                    i++;
                });

                responseData.length = 0;
                var l = 0;
                //$q.all([serviceNames[0], serviceNames[1]]).then(function (values) {
                allDone(apiList.map(function (header) {
                    return $http(header);
                }), 
                function (values) {
                        if (!!values) {
                            for (var i = 0; i < values.length; i++) {
                                if (!!values[i]) {
                                    if (values[i].statusText.toLowerCase() === 'ok') {
                                        for (var j = 0; j < values[i].data.d.results.length; j++) {
                                            if (values[i].data.d.results[j].FieldTypeKind == 6) {
                                                var temp = values[i].data.d.results[j];
                                                var results = listNames.filter(function (entry) { return entry.url == values[i].config.url; });
                                                temp.DefaultValue = results[0].name;
                                                temp.ListUrl = results[0].listUrl;
                                                surveyData.push(temp);
                                            }
                                        }
                                    }
                                }
                                l++;
                            }
                        }
                        if (!!surveyData && surveyData.length > 0) {
                            $('#nexus-survey-wait-message').hide();
                            $('#surveyApp').show();
                            $scope.Records = surveyData;
                            $scope.Records = surveyData;
                            $scope.Records = surveyData;
                            $scope.Records = surveyData;
                            qData = surveyData;
                        }
                        else
                            $("#nexus-infobar-welcome .nexus-infobar-content-container").html(infobarData.WelcomeText);
             });
           }
                // show welcome text
            else {
                $("#nexus-infobar-welcome .nexus-infobar-content-container").html(infobarData.WelcomeText);
            }
        }

        // This method saves the response of a survey question
        nexus.submitSurveyResponse = function (userChoice, surveyListName, hdnQuestionId, listUrl) {
            if (undefined === userChoice) {
                nexus.showDialog('Alert', 'Please select any response');
                return;
            }
            var context = new SP.ClientContext(listUrl);
            var web = context.get_web();
            var list = web.get_lists().getByTitle(surveyListName);

            var itemCreateInfo = new SP.ListItemCreationInformation();
            var listItem = list.addItem(itemCreateInfo);
            var response = userChoice;
            var questionId = hdnQuestionId;
            /* Set fields in the item. */
            listItem.set_item(questionId, response);
            listItem.update();


            // Create callback handlers
            var success = Function.createDelegate(this, onSuccessSurveySubmit);
            var failure = Function.createDelegate(this, nexus.onFailureSurveySubmit);
            // Execute an async query
            context.executeQueryAsync(success, failure);
        }

        // Async query succeeded.
        function onSuccessSurveySubmit(sender, args) {
            if (!!currentUserId) {
                waitForInfobarData();
                qData = null;
                $scope.Records = null;
                $('#nexus-welcome-banner-container ul').removeAttr('style');
                waitForRecords();
            }
            nexus.showDialog('Alert', 'Thanks for responding Survey !');
       }

        // Async query failed.
        nexus.onFailureSurveySubmit = function (sender, args) {
            nexus.log(jsclient.loglevel, args.get_message());
        }
    }]);

    angular.bootstrap(id, ['surveyApp'], {
        strictDi: true
    });
}

