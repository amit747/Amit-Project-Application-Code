function executeStatus() {
    var id = document.getElementById("statusApp");
    var statusApp = angular.module('statusApp', []);

    statusApp.controller('statusController', [
                        "$scope",
                        "$http",
                        "$q",
     function ($scope, $http, $q) {
         var colors = ["#fff", "#313d4a", "#e3e3e3"];

         getProjectSnapshotData();

         // this method gets the list of project(s) applicable to the logged-in user
         function getProjectSnapshotData() {
             var statusConfig = new serviceHandler("/_api/search/query?querytext='MDTSiteInfoSiteType:project'&trimduplicates=false&selectproperties='spsiteurl%2cMDTSiteInfoSiteType%2cTitle%2cMDTSiteInfoTitle%2cMDTSiteInfoDescription%2cMDTSiteInfoProjectStart%2cMDTSiteInfoProjectEnd%2cMDTSiteInfoProjectStatus%2cMDTSiteInfoProjectShowInfo%2cMDTSiteInfoProjectTimeplan%2cMDTSiteInfoProjectCompleted%2cModifiedOWSDate'&clienttype='ContentSearchRegular'", "GET", "", "");
             statusConfig.processServiceRequest($http, $scope, false,
                 function (result) {
                     $scope.searchResult = ConvertSPSearchResult_Status(result.data);
                     mapProperties();
                     if ($scope.searchResult.length > 0) {
                         for (var i = 0; i < $scope.searchResult.length; i++) {
                            if (!!$scope.searchResult[i].MDTProjectTitle) {
                                 $scope.searchResult[i].Title = $scope.searchResult[i].MDTProjectTitle;
                            }
                        }

                         // sort projects based on modified date
                         $scope.searchResult.sort(function (a, b) { return new Date(a.ModifiedOWSDATE) < new Date(b.ModifiedOWSDATE) });
                         $scope.Lists = $scope.searchResult;
                         $scope.selectedList = $scope.Lists[0]; // this is to show the 1st project on load

                         $("#nexus-project-status-selected-value").width($("#nexus-project-status-selected-value").width() + 30);
                         getRelevantProjectDocuments($scope.selectedList);
                     }

                         // hide the widget if it is empty i.e. No Projects
                     else {
                         $('#statusApp').closest("[id^='MSOZoneCell_']").hide();
                         return;
                     }
                 },
             function (error) {
                 nexus.log(nexus.errorLevels.error, error.data.error.message.value, error.status + " " + error.data.error.code)
             });
         }

         $scope.submitResponse = function (context) {
             // check if the user has made the same choice
             if (!!$scope.selectedList) {
                 if ($scope.selectedList.spsiteurl === context.list.spsiteurl)
                     return;
             }
             $scope.selectedList = context.list;
             var selectedLibs = [];
             if (!!$scope.selectedList) {
                 getRelevantProjectDocuments($scope.selectedList);
             }
         }

         $scope.openProjectPage = function (url) {
             window.open(url, '_blank');
         }

         // This is a helper method to conver SP search results into a JS object
         function ConvertSPSearchResult_Status(data) {
             var tempResults = [];
             var cellValues = [];
             var tempColumns = [];

             if (!!data) {
                 var queryResults = data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results;

                 var propertiesToShow = ['Title', 'Filename', 'OriginalPath', 'Path', 'spsiteurl', 'ModifiedOWSDate', 'Sitetitle', 'MDTProjectTitle', 'MDTProjectDescription', 'MDTProjectStartDate', 'MDTProjectEndDate', 'MDTProjectStatus', 'MDTProjectShowStatusInformation', 'MDTProjectTimeplan', 
                                            'MDTSiteInfoTitle',
                                            'MDTSiteInfoDescription',
                                            'MDTSiteInfoProjectStatus',
                                            'MDTSiteInfoProjectTimeplan',
                                            'MDTSiteInfoProjectStart',
                                            'MDTSiteInfoProjectEnd',
                                            'MDTSiteInfoProjectCompleted',
                                            'MDTSiteInfoProjectShowInfo',
                                            'MDTSiteInfoSiteType',
                                            'MDTSiteInfoTemplateName',
                                        ];

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
             }
             return tempResults;
         }

         var mapProperties = function ()
         {
             for (var i = 0; i < $scope.searchResult.length; i++) {
                 //'spsiteurl', 'ModifiedOWSDate', 'Sitetitle', 'MDTProjectTitle', 'MDTProjectDescription', 'MDTProjectStartDate', 'MDTProjectEndDate', 'MDTProjectStatus', 'MDTProjectShowStatusInformation', 'MDTProjectTimeplan'
                 $scope.searchResult[i].MDTProjectTitle = $scope.searchResult[i].MDTSiteInfoTitle;
                 $scope.searchResult[i].MDTProjectDescription = $scope.searchResult[i].MDTSiteInfoDescription;
                 $scope.searchResult[i].MDTProjectStatus = $scope.searchResult[i].MDTSiteInfoProjectStatus;
                 $scope.searchResult[i].MDTProjectTimeplan = $scope.searchResult[i].MDTSiteInfoProjectTimeplan;
                 $scope.searchResult[i].MDTProjectStartDate = $scope.searchResult[i].MDTSiteInfoProjectStart;
                 $scope.searchResult[i].MDTProjectEndDate = $scope.searchResult[i].MDTSiteInfoProjectEnd;
                 $scope.searchResult[i].MDTProjectCompleted = $scope.searchResult[i].MDTSiteInfoProjectCompleted;
                 $scope.searchResult[i].MDTProjectShowStatusInformation = $scope.searchResult[i].MDTSiteInfoProjectShowInfo;
             }
         }

         // this method gets the relevant documents for the given project site
         var getRelevantProjectDocuments = function (siteSearchData) {
             if (!!siteSearchData) {
                 if (!!siteSearchData.spsiteurl) {
                     var statusConfig = new serviceHandler("/_api/search/query?querytext='path:\"" + siteSearchData.spsiteurl + "\" (IsDocument:\"True\" OR contentclass:\"STS_ListItem\") contentclass:STS_ListItem_DocumentLibrary'&trimduplicates=false&rowlimit=40&selectproperties='Path,Title,Filename'&clienttype='ContentSearchRegular'", "GET", "", "");
                     statusConfig.processServiceRequest($http, $scope, false,
                        function (result) {
                            $scope.searchResult = ConvertSPSearchResult_Status(result.data);

                            // we only need to show upto 4 documents
                            if (!!$scope.searchResult) {
                                // sort projects based on modified date
                                $scope.searchResult.sort(function (a, b) { return new Date(a.ModifiedOWSDATE) < new Date(b.ModifiedOWSDATE) });
                                var libs = [];
                                if ($scope.searchResult.length > 4) {
                                    for (var i = 0; i < 4; i++) {
                                        libs[i] = $scope.searchResult[i];
                                        libs[i].Title = $scope.searchResult[i].Filename;
                                    }
                                }
                                else {
                                    libs = $scope.searchResult;
                                    for (var i = 0; i < libs.length; i++) {
                                        libs[i].Title = $scope.searchResult[i].Filename;
                                    }
                                }
                            }

                            if (!!libs) {
                                if (libs.length <= 0) {
                                    $scope.noLib = 'No document found!';
                                }
                                else {
                                    for (var j = 0; j < libs.length; j++) {
                                        libs[j].iconPath = setIconImagePath(libs[j].OriginalPath);
                                    }
                                    $scope.noLib = '';
                                }
                            }
                            else {
                                for (var j = 0; j < libs.length; j++) {
                                    libs[j].iconPath = setIconImagePath(libs[j].OriginalPath);
                                }
                                $scope.noLib = '';
                            }

                            $scope.selectedLibs = libs;
                            $scope.DocumentTitle = 'Recent documents';
                            
                            if (!!$scope.selectedList.MDTProjectShowStatusInformation
                                && $scope.selectedList.MDTProjectShowStatusInformation.toLowerCase() === "true") {

                                    if (!$scope.selectedList.MDTProjectStartDate
                                        || !$scope.selectedList.MDTProjectEndDate
                                        || !$scope.selectedList.MDTProjectStatus) {
                                        hideStatusInfo();
                                        return;
                                    }
                                    $scope.selectedList.showStatusInfo = true;
                                    var percentageCompletion = Math.round(100 * (getDiffDates($scope.selectedList.MDTProjectStartDate, new Date()) / getDiffDates($scope.selectedList.MDTProjectStartDate, $scope.selectedList.MDTProjectEndDate)));
                                    $scope.selectedList['MDT-Projectpercentage'] = percentageCompletion > 100 ? 100 : percentageCompletion;
                                    $scope.projectStatus = $scope.selectedList.MDTProjectStatus;
                                    $scope.selectedList.daysLeft = new Date() > new Date($scope.selectedList.MDTProjectEndDate) ? 0 : getDiffDates(new Date(), $scope.selectedList.MDTProjectEndDate);

                                    // Create circles so as to show percentage of completion of the project
                                    // This is only applicable if 'MDTShowStatusInformation' is true
                                    Circles.create({
                                        id: 'chart1',
                                        radius: 40,
                                        value: $scope.selectedList['MDT-Projectpercentage'],
                                        maxValue: 100,
                                        width: 20,
                                        border: 2,
                                        text: '',
                                        duration: 20,
                                        colors: colors,
                                        wrpClass: 'circles-wrp',
                                        textClass: 'circles-text',
                                        styleWrapper: true,
                                        styleText: true
                                    });
                                }                          
                            else {
                                hideStatusInfo();
                            }
                      });
                 }
             }
         }

         // Helper method to get difference between two dates(in number of days)
         var getDiffDates = function (startDate, endDate) {
             if (!startDate || !endDate) {
                 return null;
             }
             var date1 = new Date(startDate),
                    date2 = new Date(endDate);
             if (!date1 || !date2) {
                 if (startDate.indexOf('T') != -1)
                     date1 = new Date(startDate.split('T')[0]);
                 if (endDate.indexOf('T') != -1)
                     date2 = new Date(endDate.split('T')[0]);
             }

             var timeDiff = Math.abs(date2.getTime() - date1.getTime());
             var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
             return diffDays;
         }

         // This method is used to hide status informatoin on snapshot widget
         var hideStatusInfo = function () {
             $scope.projectStatus = '';
             $scope.selectedList.showStatusInfo = false;
         }

         // Helper function which sets icon image path based upon extension
         var setIconImagePath = function (url) {
             var extension = url.substr(url.lastIndexOf('.') + 1);
             var path = '';
             switch (extension) {
                 case 'pdf':
                     path = '/_layouts/15/images/ICPDF.png';
                     break;
                 case 'ppt':
                     path = '/_layouts/15/images/ICPPT.png';
                     break;
                 case 'pptx':
                     path = '/_layouts/15/images/ICPPTX.png';
                     break;
                 case 'doc':
                     path = '/_layouts/15/images/ICDOC.png';
                     break;
                 case 'docx':
                     path = '/_layouts/15/images/ICDOCX.png';
                     break;
                 case 'xls':
                     path = '/_layouts/15/images/XLS16.png';
                     break;
                 case 'xlsx':
                     path = '/_layouts/15/images/XLS16.png';
                     break;
                 case 'jpg':
                 case 'jpeg':
                 case 'gif':
                 case 'png':
                     path = '/_layouts/15/images/ICJPEG.gif';
                     break;

                 default:
                     path = '/_layouts/15/images/TXT16.gif';
             }
             return path;
         }
     }]);

    angular.bootstrap(id, ['statusApp'], {
        strictDi: true
    });
}