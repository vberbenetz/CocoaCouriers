'use strict';

function mainCtrl($scope, $window, appService, stService) {

    $scope.account = {
        email: '',
        stId: ''
    };

    // --------------------------------------
    // Retrieve user account details
    appService.user.get(function (data) {
        $scope.account.email = data.email;
        $scope.account.stId = data.stId;

        // -----------------------------------------
        // Retrieve St customer info
        stService.customer.get(function (data) {
            $scope.customer = data;
        }, function (error) {
        });

    }, function (error) {
    });

    $scope.logout = function() {
        appService.logout.save(function(data, status, headers, config) {
            $window.location.href = '/';
        }, function(data, status, headers, config) {});
    }

}

function membershipCtrl($scope, appService) {

    $scope.formData = {};
    $scope.passwordData = {
        currentPassword: '',
        newPassword: '',
        newPasswordConfirm: ''
    };

    $scope.changePassword = function () {

        $scope.validationErrors = {};

        var validationFailed = false;

        // Password validation
        if (typeof $scope.passwordData.newPassword === 'undefined') {
            $scope.validationErrors.newPassword = 'Please enter a new password';
            validationFailed = true;
        }
        else if ( ($scope.passwordData.newPassword.length == 0) || ($scope.passwordData.newPassword === '') ) {
            $scope.validationErrors.newPassword = 'Please enter a new password';
            validationFailed = true;
        }
        else if ( ($scope.passwordData.newPassword.length < 6) || ($scope.passwordData.newPassword.length > 254) ) {
            $scope.validationErrors.password = 'Please use a password that is 6 to 200 characters';
            validationFailed = true;
        }

        // Password confirmation verification
        if (!validationFailed) {
            if (typeof $scope.passwordData.newPasswordConfirm === 'undefined') {
                $scope.validationErrors.newPassword = 'Passwords do not match';
                $scope.validationErrors.newPasswordConfirm = 'Passwords do not match';
                validationFailed = true;
            }
            else if ($scope.passwordData.newPassword !== $scope.passwordData.newPasswordConfirm) {
                $scope.validationErrors.newPassword = 'Passwords do not match';
                $scope.validationErrors.newPasswordConfirm = 'Passwords do not match';
                validationFailed = true;
            }
        }

        if (!validationFailed) {
            var payload = {
                newPass: $scope.passwordData.newPassword,
                currentPass: $scope.passwordData.currentPassword
            };

            appService.user.updatePassword(payload, function(data) {
                // Reset vars
                $scope.validationErrors = {};
                $scope.passwordData = {};

            }, function(err) {
                if (err.data === 'invalid_new_password') {
                    $scope.validationErrors.newPassword = 'Password must contain at least 8 characters long, 1 uppercase letter, 1 lowercase letter and 1 number';
                    $scope.validationErrors.newPasswordConfirm = 'Password must contain at least 8 characters long, 1 uppercase letter, 1 lowercase letter and 1 number';
                }
                else if (err.data === 'incorrect_password') {
                    $scope.validationErrors.currentPassword = 'Your password is incorrect';
                }
                else {
                    $scope.validationErrors.newPassword = 'Something went wrong with changing your password. Please try again';
                    $scope.validationErrors.newPasswordConfirm = ' ';
                }
            });
        }
    }

}

function updatePaymentCtrl ($scope, stService) {

    $scope.formOptions = {
        provinces: [
            { id: 'AB', name: 'Alberta' },
            { id: 'ON', name: 'Ontario' }
        ],
        countries: [
            {id: 'CA', name: 'Canada'}
        ],
        ccExp: {
            month: [
                { id: 1, name: 'January - 01' },
                { id: 2, name: 'February - 02' },
                { id: 3, name: 'March - 03' },
                { id: 4, name: 'April - 04' },
                { id: 5, name: 'May - 05' },
                { id: 6, name: 'June - 06' },
                { id: 7, name: 'July - 07' },
                { id: 8, name: 'August - 08' },
                { id: 9, name: 'September - 09' },
                { id: 10, name: 'October - 10' },
                { id: 11, name: 'November - 11' },
                { id: 12, name: 'December - 12' }
            ]
        }
    };
    // Populate the expiry years for the form
    var currentYear = new Date().getFullYear();
    var expiryYears = [];
    for (var i = 0; i < 26; i++) {
        expiryYears.push(currentYear + i);
    }
    $scope.formOptions.ccExp.year = expiryYears;


    var customer = $scope.$parent.customer;
    var source = customer.sources.data[0];

    $scope.userInfo = {
        name: customer.shipping.name,
        address: customer.shipping.address,
        source: {
            object: 'card',
            exp_month: source.exp_month,
            exp_year: source.exp_year,
            number: '**** **** **** ' + source.last4,
            cvc: '',
            name: source.name,
            address_zip: source.address_zip
        }
    };

    // Pre-populate province, country, and exp_month on form from existing values
    prePopulateShippingForm();
    prePopulatePaymentForm();



    $scope.updateShipping = function() {

        if (validateAddressInfo()) {
            var payload = {
                item: 'shipping',
                data: {
                    name: $scope.userInfo.name,
                    address: $scope.userInfo.address
                },
                customerId: $scope.$parent.customer.id
            };

            stService.customer.update(payload, function(data) {
                $scope.$parent.customer.shipping = data.shipping;
                prePopulateShippingForm();
            }, function(err) {
                prePopulateShippingForm();
            });


        }
    };

    $scope.updatePayment = function() {
        validateUserPayment(function (result, token) {
            if (result) {
                var payload = {
                    item: 'source',
                    data: token,
                    customerId: $scope.$parent.customer.id
                };

                stService.customer.update(payload, function(data) {
                    $scope.$parent.customer.sources = data.sources;
                    $scope.userInfo.source.number = '**** **** **** ' + data.sources.data[0].last4;
                    $scope.userInfo.source.cvc = '';
                    prePopulatePaymentForm();
                }, function(err) {
                    translateStCCErr( handleStCCErr(err.data) );
                    prePopulatePaymentForm();
                });

            }
        })
    };


    // Pre-populate province and country on form from existing values
    function prePopulateShippingForm() {
        var stateList = $scope.formOptions.provinces;
        for (var j = 0; j < stateList.length; j++) {
            if (stateList[j].id === $scope.userInfo.address.state) {
                $scope.userInfo.address.state = stateList[j];
            }
        }
        var countryList = $scope.formOptions.countries;
        for (var k = 0; k < countryList.length; k++) {
            if (countryList[k].id === $scope.userInfo.address.country) {
                $scope.userInfo.address.country = countryList[k];
            }
        }
    }

    // Pre-populate exp_month on form from existing values
    function prePopulatePaymentForm() {
        var ccMonExpList = $scope.formOptions.ccExp.month;
        for (var l = 0; l < ccMonExpList.length; l++) {
            if (ccMonExpList[l].id === $scope.userInfo.source.exp_month) {
                $scope.userInfo.source.exp_month = ccMonExpList[l];
            }
        }
    }

    // Validate user's address
    function validateAddressInfo() {

        // Reset validation objects
        var validationFailed = false;
        $scope.validationErrors = {
            address: {}
        };

        // Upper and lower case letters, numbers, and spaces
        var alphaSpaceRegex = /^[a-zA-Z ]+$/i;

        // Name validation
        if (typeof $scope.userInfo.name === 'undefined') {
            $scope.validationErrors.name = 'Please enter your full name';
            validationFailed = true;
        }
        else if ( ($scope.userInfo.name.length == 0) || ($scope.userInfo.name === '') ) {
            $scope.validationErrors.name = 'Please enter your full name';
            validationFailed = true;
        }
        else if ( !alphaSpaceRegex.test($scope.userInfo.name) ) {
            $scope.validationErrors.name = 'Please use only letters and spaces for your full name';
            validationFailed = true;
        }
        else if ( $scope.userInfo.name.length > 254 ) {
            $scope.validationErrors.name = 'Name is too long. Please enter a valid name';
            validationFailed = true;
        }

        // Address validation
        if (typeof $scope.userInfo.address.line1 === 'undefined') {
            $scope.validationErrors.address.line1 = 'Please enter your address';
            validationFailed = true;
        }
        else if ( ($scope.userInfo.address.line1.length == 0) || ($scope.userInfo.address.line1 === '') ) {
            $scope.validationErrors.address.line1 = 'Please enter your address';
            validationFailed = true;
        }
        else if ( $scope.userInfo.address.line1.length > 1024 ) {
            $scope.validationErrors.address.line1 = 'Address is too long. Please enter a valid address';
            validationFailed = true;
        }
        if ($scope.userInfo.address.line2.length > 1024) {
            $scope.validationErrors.address.line2 = 'Address line 2 is too long. Please enter a valid address for line 2';
            validationFailed = true;
        }

        // City validation
        if (typeof $scope.userInfo.address.city === 'undefined') {
            $scope.validationErrors.address.city = 'Please enter your city';
            validationFailed = true;
        }
        else if ( ($scope.userInfo.address.city.length == 0) || ($scope.userInfo.address.city === '') ) {
            $scope.validationErrors.address.city = 'Please enter your city';
            validationFailed = true;
        }
        else if ( $scope.userInfo.address.city.length > 1024 ) {
            $scope.validationErrors.address.city = 'City is too long. Please enter a valid city';
            validationFailed = true;
        }

        // State validation
        if (typeof $scope.userInfo.address.state === 'undefined') {
            $scope.validationErrors.address.state = 'Please select a province/state';
            validationFailed = true;
        }
        else if ( ($scope.userInfo.address.state.length == 0) || ($scope.userInfo.address.state === '') ) {
            $scope.validationErrors.address.state = 'Please select a province/state';
            validationFailed = true;
        }
        // Set province to ISO value
        else {
            $scope.userInfo.address.state = $scope.userInfo.address.state.id;
        }

        // Country validation
        if (typeof $scope.userInfo.address.country === 'undefined') {
            $scope.validationErrors.address.country = 'Please select a country';
            validationFailed = true;
        }
        else if ( ($scope.userInfo.address.country.length == 0) || ($scope.userInfo.address.country === '') ) {
            $scope.validationErrors.address.country = 'Please select a country';
            validationFailed = true;
        }
        // Set country to ISO value
        else {
            $scope.userInfo.address.country = $scope.userInfo.address.country.id;
        }

        // Postal Code validation
        if (typeof $scope.userInfo.address.postal_code === 'undefined') {
            $scope.validationErrors.address.postal_code = 'Please enter your postal / zip code';
            validationFailed = true;
        }
        else if ( ($scope.userInfo.address.postal_code.length == 0) || ($scope.userInfo.address.postal_code === '') ) {
            $scope.validationErrors.address.postal_code = 'Please enter your postal / zip code';
            validationFailed = true;
        }
        else if ( $scope.userInfo.address.postal_code.length > 1024 ) {
            $scope.validationErrors.address.postal_code = 'Postal / Zip code is too long. Please enter a valid postal / zip code';
            validationFailed = true;
        }

        return !validationFailed;

    }


    // Validate payment info
    function validateUserPayment (callback) {

        // Reset validation objects
        var validationFailed = false;
        $scope.validationErrors = {
            source: {}
        };

        // Upper and lower case letters, numbers, and spaces
        var alphaSpaceRegex = /^[a-zA-Z ]+$/i;

        // CC Number basic validation
        var numSpaceDashRegex = /^[0-9 -]+$/i;
        var creditCardRegex = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/;
        var cvvRegex = /^[0-9]{3,4}$/;

        // Name validation
        if (typeof $scope.userInfo.source.name === 'undefined') {
            $scope.validationErrors.source.name = 'Please enter your full name';
            validationFailed = true;
        }
        else if ( ($scope.userInfo.source.name.length == 0) || ($scope.userInfo.source.name === '') ) {
            $scope.validationErrors.source.name = 'Please enter your full name';
            validationFailed = true;
        }
        else if ( !alphaSpaceRegex.test($scope.userInfo.source.name) ) {
            $scope.validationErrors.source.name = 'Please use only letters and spaces for your full name';
            validationFailed = true;
        }
        else if ( $scope.userInfo.source.name.length > 254 ) {
            $scope.validationErrors.source.name = 'Name is too long. Please enter a valid name';
            validationFailed = true;
        }

        // Basic Card Number Validation
        if (typeof $scope.userInfo.source.number === 'undefined') {
            $scope.validationErrors.source.number = 'Please enter your credit card number';
            validationFailed = true;
        }
        else if ( ($scope.userInfo.source.number.length == 0) || ($scope.userInfo.source.number === '') ) {
            $scope.validationErrors.source.number = 'Please enter your credit card number';
            validationFailed = true;
        }
        else if ( !numSpaceDashRegex.test($scope.userInfo.source.number) ) {
            $scope.validationErrors.source.number = 'Please enter a valid number. You can use dashes or spaces to separate blocks of numbers if you choose';
            validationFailed = true;
        }
        else if ( !creditCardRegex.test($scope.userInfo.source.number.replace(/\D/g,'')) ) {
            $scope.validationErrors.source.number = 'Please enter a valid number. You can use dashes or spaces to separate blocks of numbers if you choose';
            validationFailed = true;
        }

        // Expiry Validation
        if (typeof $scope.userInfo.source.exp_month === 'undefined') {
            $scope.validationErrors.source.exp_month = 'Please select an expiration month';
            validationFailed = true;
        }
        else if ( ($scope.userInfo.source.exp_month.length == 0) || ($scope.userInfo.source.exp_month === '') ) {
            $scope.validationErrors.source.exp_month = 'Please select an expiration month';
            validationFailed = true;
        }
        else {      // Set card month expiry to number value
            $scope.userInfo.source.exp_month = $scope.userInfo.source.exp_month.id;
        }
        if (typeof $scope.userInfo.source.exp_year === 'undefined') {
            $scope.validationErrors.source.exp_year = 'Please select an expiration year';
            validationFailed = true;
        }
        else if ( ($scope.userInfo.source.exp_year.length == 0) || ($scope.userInfo.source.exp_year === '') ) {
            $scope.validationErrors.source.exp_year = 'Please select an expiration year';
            validationFailed = true;
        }

        // CVV validation
        if (typeof $scope.userInfo.source.cvc === 'undefined') {
            $scope.validationErrors.source.cvc = 'Please enter the verification number on the back of your card';
            validationFailed = true;
        }
        else if ( ($scope.userInfo.source.cvc == 0) || ($scope.userInfo.source.cvc === '') ) {
            $scope.validationErrors.source.cvc = 'Please enter the verification number on the back of your card';
            validationFailed = true;
        }
        else if ( (!cvvRegex.test($scope.userInfo.source.cvc.toString())) ) {
            $scope.validationErrors.source.cvc = 'Please enter a valid verification number';
            validationFailed = true;
        }

        // Use postal code of card holder
        if (typeof $scope.userInfo.source.address_zip === 'undefined') {
            $scope.validationErrors.source.address_zip = 'Please enter the zip / postal code associated with your card';
            validationFailed = true;
        }
        else if ( ($scope.userInfo.source.address_zip.length == 0) || ($scope.userInfo.source.address_zip === '') ) {
            $scope.validationErrors.source.address_zip = 'Please enter the zip / postal code associated with your card';
            validationFailed = true;
        }
        else if ($scope.userInfo.source.address_zip.length > 255) {
            $scope.validationErrors.source.address_zip = 'Please enter a valid zip / postal code';
            validationFailed = true;
        }

        // Attempt to generate token
        if (!validationFailed) {
            stService.token.save($scope.userInfo.source, function(data, status, headers, config) {
                return callback(true, data.id);

            }, function(err, status, headers, config) {
                translateStCCErr( handleStCCErr(err.data) );
                return callback(false, null);
            });

        }

        else {
            callback(false, null);
        }

    }

    $scope.identifyCardType = function() {
        var number = $scope.userInfo.source.number;
        number = number.toString();

        // Visa 4XXX
        if ( (number.length >= 1) && (number[0] === '4') ) {
            return 'visa';
        }

        // Mastercard 51XX 52XX 53XX 54XX 55XX
        if ( (number.length >=2) && (number[0] === '5') &&
            ( (number[1] === '1') || (number[1] === '2') || (number[1] === '3') || (number[1] === '4') || (number[1] === '5') ) ) {
            return 'mastercard';
        }

        // AMEX 34XX 37XX
        if ( (number.length >= 2) && (number[0] === '3') && ( (number[1] === '4') || (number[1] === '7') ) ) {
            return 'amex';
        }

        // Diners club 36XX 38XX 39XX
        if ( (number.length >= 2) && (number[0] === '3') && ( (number[1] === '6') || (number[1] === '8') || (number[1] === '9') ) ) {
            return 'diners-club';
        }
        // 300X 301X 302X 303X 304X 305X 309X
        else if ( (number.length >=3) && (number[0] === '3') && (number[1] === '0') &&
            ( (number[2] === '0') || (number[2] === '1') || (number[2] === '2') || (number[2] === '3') || (number[2] === '4') ||
            (number[2] === '5') || (number[2]) === '9' ) ) {
            return 'diners-club';
        }

        // Discover 65XX
        if ( (number.length >= 6) && (number[0] === '5') ) {
            return 'discover';
        }
        // 644X 645X 646X 647X 648X 649X
        else if ( (number.length >=3) && (number[0] === '6') && (number[1] === '4') &&
            ( (number[2] === '4') || (number[2] === '5') || (number[2] === '6') || (number[2] === '7') || (number[2] === '8') ||
            (number[2] === '9') ) ) {
            return 'discover';
        }
        // 6011
        else if ( (number.length >= 4) && (number[0] === '6') && (number[1] === '0') && (number[2] === '1') && (number[3] === '1') ) {
            return 'discover';
        }

        // JCB 352X 353X 354X 355X 356X 357X 358X
        if ( (number.length >=3) && (number[0] === '3') && (number[1] === '5') &&
            ( (number[2] === '2') || (number[2] === '3') || (number[2] === '4') || (number[2] === '5') || (number[2] === '6') ||
            (number[2] === '7') || (number[2]) === '8' ) ) {
            return 'jcb';
        }

        return null;
    };

    // Handle payment cc error codes
    function translateStCCErr(err) {
        switch (err.variable) {
            case 'number':
                $scope.validationErrors.source.number = err.msg;
                break;
            case 'exp_month':
                $scope.validationErrors.source.exp_month = err.msg;
                break;
            case 'exp_year':
                $scope.validationErrors.source.exp_year = err.msg;
                break;
            case 'cvc':
                $scope.validationErrors.source.cvc = err.msg;
                break;
            case 'address_zip':
                $scope.validationErrors.source.address_zip = err.msg;
                break;
            default:
                $scope.validationErrors.source.number = err.msg;
                break;
        }
    }

}

function updatePlanCtrl($scope, stService) {

    if (typeof $scope.$parent.customer.subscriptions.data[0] !== 'undefined') {
        $scope.currentPlan = $scope.$parent.customer.subscriptions.data[0].plan;
    }

    $scope.selectPlan = function(planId) {
        $scope.selectedPlan = planId;
    };

    $scope.updatePlan = function() {

        var payload = {
            plan: $scope.selectedPlan,
            coupon: $scope.couponCode
        };

        // Subscribe to a new plan because the user was not subscribed or was removed because of a card charge issue
        if (typeof $scope.currentPlan === 'undefined') {
            stService.subscription.save(payload, function(newSubscription) {
                if (typeof newSubscription.data[0] !== 'undefined') {
                    $scope.currentPlan = newSubscription.data[0].plan;
                }
            }, function(err) {
                var result = handleStCCErr(err.data);
                $scope.$parent.customer.metadata.card_error_code = result.msg;
                $scope.cardError = result.msg;
            });
        }
        // Change existing subscription
        else {
            stService.subscription.updatePlan(payload, function(newSubscription) {
                $scope.currentPlan = newSubscription.data[0].plan;
            }, function(err) {
                var result = handleStCCErr(err.data);
                $scope.$parent.customer.metadata.card_error_code = result.msg;
                $scope.cardError = result.msg;
            });
        }
    }

}

function handleStCCErr(errCode) {
    var ret = {
        variable: '',
        msg: ''
    };

    switch (errCode) {
        case 'invalid_number':
            ret.variable = 'number';
            ret.msg = 'Please enter a valid number. You can use dashes or spaces to separate blocks of numbers if you choose';
            break;
        case 'incorrect_number':
            ret.variable = 'number';
            ret.msg = 'Please enter a correct number. You can use dashes or spaces to separate blocks of numbers if you choose';
            break;
        case 'card_declined':
            ret.variable = 'number';
            ret.msg = 'Your card has been declined';
            break;
        case 'processing_error':
            ret.variable = 'number';
            ret.msg = 'There was an issue processing your payment. Please try again or use another card';
            break;
        case 'expired_card':
            ret.variable = 'number';
            ret.msg = 'Your card has expired';
            break;
        case 'invalid_expiry_month':
            ret.variable = 'exp_month';
            ret.msg = 'Expiry month on your card is invalid';
            break;
        case 'invalid_expiry_year':
            ret.variable = 'exp_year';
            ret.msg = 'Expiry year on your card is invalid';
            break;
        case 'invalid_cvc':
            ret.variable = 'cvc';
            ret.msg = 'CVV for your card is invalid';
            break;
        case 'incorrect_cvc':
            ret.variable = 'cvc';
            ret.msg = 'CVV for your card is incorrect';
            break;
        case 'incorrect_zip':
            ret.variable = 'address_zip';
            ret.msg = 'Postal / zip code check failed';
            break;
        default:
            ret.variable = 'number';
            ret.msg = 'There was an issue processing your payment. Please try again or use another card';
            break;
    }

    return ret;
}


angular
    .module('account')
    .controller('mainCtrl', mainCtrl)
    .controller('membershipCtrl', membershipCtrl)
    .controller('updatePaymentCtrl', updatePaymentCtrl)
    .controller('updatePlanCtrl', updatePlanCtrl);