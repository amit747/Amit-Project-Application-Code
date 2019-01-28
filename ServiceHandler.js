
var localCache = {
    data: {},
    remove: function (url) {
        delete localCache.data[url];
    },
    exist: function (url) {
        return localCache.data.hasOwnProperty(url) && localCache.data[url] !== null;
    },
    get: function (url) {
        console.log('Getting in cache for url' + url);
        return localCache.data[url];
    },
    set: function (url, cachedData, callback, status) {
        localCache.remove(url);
        localCache.data[url] = cachedData;
        if ($.isFunction(callback)) callback(cachedData);
    }
};

/// <signature>
///   <summary>Its a constructor.</summary>
///   <param name="url" type="string">api for which you are making request. </param>
///   <param name="method" type="string">POST/GET/PUT/DELETE by default it is GET</param>
///   <param name="dataType" type="string">The type of data expected from the server. Default: Intelligent Guess (xml, json, script, text, html).</param>
///   <param name="data" type="string">A plain object or string that is sent to the server with the request.</param>
/// </signature>
function serviceHandler(url, method, dataType, data) {

    var iframe = document.createElement("iframe");

    var triggerAppIsDoneEvent = function (appName) {
        // This triggers that an app with  a specific name is done
        // The name is from a web part property and the library AppLoad can
        // be found in the branding package
        if (AppLoad && appName) {
            AppLoad.triggerEvent(appName);
        }
    };

    iframe.style.display = "none";

    this.url = url;
    this.method = method;
    this.dataType = dataType;
    this.crossDomain = true;
    this.data = data;

    /// <signature>
    ///   <summary>It will return you request header for current request.</summary>
    /// </signature>
    this.getRequestHeaders = function () {
        return {
            url: this.url,
            method: this.method === "" ? "GET" : method,
            dataType: this.dataType === "" ? "json" : dataType,
            crossDomain: true,
            headers: { "accept": "application/json;odata=verbose" },
            data: this.data
        }
    }

    /// <signature>
    ///   <summary>It will refresh the token if it got expires by loading an iframe.</summary>
    ///   <param name="$http" type="string">Angular core service for making http request</param>
    /// </signature>
    this.getBearerToken = function (url) {
        var rootwebAbsoluteUrl = _spPageContextInfo.webAbsoluteUrl;
        iframe.src = rootwebAbsoluteUrl + "/_layouts/15/Authenticate.aspx?state=stayonpage";
        var header = document.createAttribute("requestHeader");
        header.value = url;
        iframe.attributes.setNamedItem(header);
        document.body.appendChild(iframe);
        console.info("Getting bearer token" + url);

    }

    /// <signature>
    ///   <summary>It will get the cookie from storage.</summary>
    ///   <param name="$http" type="string">Angular core service for making http request</param>
    ///   <param name="$scope" type="string">Angular core service for making binding the data between controller and view</param>
    ///   <param name="isBearertokenRequired" type="bool">Does http request header required authorization token</param>
    ///   <param name="success" type="string">Callback method for success method</param>
    ///   <param name="error" type="string">Callback method for error method</param>

    /// </signature>
    this.processServiceRequest = function ($http, $scope, isBearertokenRequired, success, error, appName) {
        // The subsriberId here is the name of a channel, given to the PubSub library. It is an id to a channel that will run all its
        // subscribing functions once you publish to the channel. Here we publish to the channel, which makes it run its
        // functions. The subscriber functions are defined in the nexus.js file

        if (error === undefined) {
            error = function (response) {
                console.error("Service Handler Error:" + response.statusText);
            }
        }
        if (!isBearertokenRequired) {
            $http(this.getRequestHeaders()).then(success, error).then(function () {
                triggerAppIsDoneEvent(appName);
            });
        }
        else if (isBearertokenRequired) {
            if (bearertoken === null || IsTokenExpired()) {
                this.getBearerToken(JSON.stringify(this.getRequestHeaders()));
                ///Here after the iframe is loaded we are assigning the token to a bearertoken variable
                $(iframe).load(function () {

                    var header = JSON.parse(this.getAttribute("requestHeader"));
                    if (bearertoken === null) {
                        bearertoken = iframe.contentDocument.body.innerHTML;
                    }

                    header.headers.Authorization = 'Bearer ' + bearertoken;
                    $http(header).then(success, error).then(function () {
                        triggerAppIsDoneEvent(appName);
                    });


                });

            }
            else {
                var responseheader = this.getRequestHeaders();
                responseheader.headers.Authorization = 'Bearer ' + bearertoken;
                $http(responseheader).then(success, error).then(function () {
                    triggerAppIsDoneEvent(appName);
                });
            }
        }
    },


    /// <signature>
    ///   <summary>It will get the cookie from storage.</summary>
    ///   <param name="$q" type="string">Angular core service for bundlingup the http requests</param>
    ///   <param name="$http" type="string">Angular core service for making http request</param>
    ///   <param name="$scope" type="string">Angular core service for making binding the data between controller and view</param>
    ///   <param name="apiList" type="string">Angular core service for making binding the data between controller and view</param>
    ///   <param name="success" type="jsonarray">json array with two parameter url: and isBearertokenRequired</param>
    ///   <param name="error" type="string">Callback method for error method</param>

    /// </signature>
    this.processServiceRequestq = function ($q, $http, $scope, apiList, success, error) {
        console.info("processing bundled requests");
        if (error === undefined) {
            error = function (response) {
                return response;
                console.error("Service Handler Error:" + response.statusText);
            }
        }

        if (bearertoken === null || IsTokenExpired()) {
            var data = this.getBearerToken(JSON.stringify(apiList));
            $(iframe).load(function () {

                if (bearertoken === null) {
                    bearertoken = iframe.contentDocument.body.innerHTML;
                }
                console.info("processServiceRequestq bearerToken" + bearertoken);

                return bundleRequest(apiList, $q, $http, $scope).then(success, error);

            });
        }
        else {

            return bundleRequest(apiList, $q, $http, $scope).then(success).catch(success);
        }
    }
};
function bundleRequest(apiList, $q, $http, $scope) {
    console.info("processing bundling requests");


    return $q.all(apiList.map(function (header) {
        var item = header;
        if (item.isBearertokenRequired) {
            header = {
                method: 'GET',
                url: item.url,
                accept: "application/json;odata=verbose",
                headers: {

                    Authorization: "Bearer " + bearertoken,
                    accept: "application/json;odata=verbose"
                }
            };
        }
        else {
            header = {
                method: 'GET', url: item.url, headers: {

                    accept: "application/json;odata=verbose"
                }
            };
        }
        return $http(header);

    }))
}
/// <signature>
///   <summary>It will get the cookie from storage.</summary>
///   <param name="NameofCookie" type="string">name of the cookie for which you want to fetch the data</param>
/// </signature>
function getCookie(NameOfCookie) {
    if (document.cookie.length > 0) {
        begin = document.cookie.indexOf(NameOfCookie + "=");
        if (begin != -1) {
            begin += NameOfCookie.length + 1;
            end = document.cookie.indexOf(";", begin);
            if (end == -1) end = document.cookie.length;
            return unescape(document.cookie.substring(begin, end));
        }
    }
    return null;
}
/// <signature>
///   <summary>convert sharepoint search result and return an array.</summary>
///   <param name="data" type="jsonarray">data containing result from search result</param>
///   <param name="columnArray" type="array">Name of the columns that need to be parsed.</param>
/// </signature>
function ConvertSPSearchResult(data, columnsArray) {
    var queryResults = data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results;
    var tempResults = [];
    var cellValues = [];
    var tempColumns = [];



    for (var i = 0; i < queryResults.length; i++) {
        var item = [];

        for (var h = 0; h < queryResults[i].Cells.results.length; h++) {

            var key = queryResults[i].Cells.results[h].Key;
            var value = queryResults[i].Cells.results[h].Value;
            if (columnsArray.indexOf(key) !== -1) {
                //cellValues.push({ key:value });
                item[key] = value;
            }
        }

        tempResults.push(item);
    }

    results = tempResults;
    return tempResults;
}

function IsTokenExpired() {
    var expiretime = new Date(parseInt(getCookie('NexusClientTime')));

    if (new Date().getTime() <= expiretime) {
        return false;
    }
    else {
        return true;
    }
}
// Add extra functionality to $q
