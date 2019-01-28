
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

