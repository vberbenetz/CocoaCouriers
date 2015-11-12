'use strict';

angular.module('domerbox', [])

.controller('signupCtrl', function ($scope, $http, $window) {

        // ------------- DATA INITIALIZATIONS ------------- //
        $scope.formPage = 1;

        // Get plan list
        $scope.formPlans = [];
        $http({
                url: '/api/plan/list',
                method: 'GET'
            }).success(function (plans) {
                $scope.formPlans = plans.data;
            }).error(function (err) {
        });

        $scope.formOptions = {
            provinces: [
                { id: 'AB', name: 'Alberta' }
            ],
            countries: [
                {id: 'CA', name: 'Canada'}
            ],
            ccExp: {
                month: [
                    '01',
                    '02',
                    '03',
                    '04',
                    '05',
                    '06',
                    '07',
                    '08',
                    '09',
                    '10',
                    '11',
                    '12'
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



        // -------------- MODELS -------------- //
        $scope.userInfo = {
            BOX_TYPE: 'domerbox',
            name: '',
            email: '',
            password: '',

            subscription: {
                planId: '',
                size: '',
                material: '',
                brand: '',
                couponCode: ''
            },

            address: {
                line1: '',
                line2: '',
                city: '',
                state: '',
                country: '',
                postal_code: ''
            },
            source: {
                object: 'card',
                exp_month: '',
                exp_year: '',
                number: '',
                cvc: '',
                name: '',
                postal_code: ''
            }
        };
        $scope.validationErrors = {};




        // Select a plan
        $scope.selectPlan = function(planId) {
            $scope.userInfo.subscription.planId = planId;
            $scope.formPage = 2;
        };

        // Select a size
        $scope.selectSize = function (size) {
            $scope.userInfo.subscription.size = size;
            $scope.formPage = 3;

        };

        // Select the material
        $scope.selectMaterial = function (material) {
            $scope.userInfo.subscription.material = material;
            $scope.formPage = 4;
        };

        // Select brand
        $scope.selectBrand = function (brand) {
            $scope.userInfo.subscription.brand = brand;
            $scope.formPage = 5;
        };

        $scope.goBack = function(formPage) {
            $scope.formPage = formPage;
        };

        $scope.next = function(nextSection) {
            switch (nextSection) {
                case 6:
                    if ($scope.validateAddressInfo()) {
                        $scope.validateNewAccount(function(result) {
                            if (result) {
                                $scope.formPage = 6;
                            }
                        });
                    }
                    break;
                case 7:
                    $scope.validateUserPayment(function(result) {
                        if (result) {
                            $scope.formPage = 7;
                        }
                    });
                    break;
                default:
                    break;
            }
        };

        // After validation and CC token generation, register the user and create the customer in Stripe
        $scope.createAccount = function() {
/*
            // Create Customer Account
            $http({
                url: '/signup',
                method: 'POST',
                data: {
                    email: $scope.userInfo.email,
                    password: $scope.userInfo.password
                }
            }).success(function(newUser) {

                // Create Customer On Stripe (No subscription for now to deal with tax rate)
                $http({
                    url: '/api/customer',
                    method: 'POST',
                    data: {
                        email: newUser.email,
                        name: $scope.userInfo.name,
                        address: $scope.userInfo.address,
                        source: $scope.userInfo.token,
                        size: $scope.userInfo.subscription.size,
                        material: $scope.userInfo.subscription.material,
                        brand: $scope.userInfo.subscription.brand,
                        coupon: $scope.userInfo.subscription.couponCode,
                        plan: $scope.userInfo.subscription.planId,
                        BOX_TYPE: $scope.userInfo.BOX_TYPE
                    }
                }).success(function(newCustomer) {
                    $window.location.href = '/';

                }).error(function(error) {

                })

            }).error(function(error) {
                $scope.validationErrors.email = 'Email already in use';
                return callback(false);
            });
*/
        };

        // Validate new account creation
        $scope.validateNewAccount = function(callback) {

            // Reset validation objects
            var validationFailed = false;
            var validateEmailFailed = false;
            $scope.validationErrors = {};

            // Email format
            var emailRegex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

            // Min 8 characters
            // 1 Uppercase
            // 1 Lowercase
            // 1 Number
            var passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

            // Check if email is valid
            if (typeof $scope.userInfo.email === 'undefined') {
                $scope.validationErrors.email = 'Please enter your email';
                validationFailed = true;
                validateEmailFailed = true;
            }
            else if ( ($scope.userInfo.email.length == 0) || ($scope.userInfo.email === '') ) {
                $scope.validationErrors.email = 'Please enter your email';
                validationFailed = true;
                validateEmailFailed = true;
            }
            else if ( $scope.userInfo.email.length > 254 ) {
                $scope.validationErrors.email = 'Email is invalid because it is too long';
                validationFailed = true;
                validateEmailFailed = true;
            }
            else if ( !emailRegex.test($scope.userInfo.email) ) {
                $scope.validationErrors.email = 'Please enter a valid email';
                validationFailed = true;
                validateEmailFailed = true;
            }

            // Password validation
            if (typeof $scope.userInfo.password === 'undefined') {
                $scope.validationErrors.password = 'Please enter your password';
                validationFailed = true;
            }
            else if ( ($scope.userInfo.password.length == 0) || ($scope.userInfo.password === '') ) {
                $scope.validationErrors.password = 'Please enter your password';
                validationFailed = true;
            }
            else if ( $scope.userInfo.password.length > 254 ) {
                $scope.validationErrors.password = 'Please limit password to 250 characters';
                validationFailed = true;
            }
            else if ( !passwordRegex.test($scope.userInfo.password) ) {
                $scope.validationErrors.password = 'Password must contain at least 8 characters long, 1 uppercase letter, 1 lowercase letter and 1 number';
                validationFailed = true;
            }

            // Check if email exists
            if (!validateEmailFailed) {
                $http({
                    url: '/api/emailexists',
                    method: 'GET',
                    params: {
                        email: $scope.userInfo.email
                    }
                }).success(function(result) {

                    // Email exists validation
                    if (result.exists) {
                        $scope.validationErrors.email = 'Email already in use';
                        validationFailed = true;
                    }
                    else {
                        return callback(true);
                    }

                }).error(function(error) {
                    $scope.validationErrors.email = 'Email already in use';
                    return callback(false);
                });
            }

            else {
                callback(false);
            }
        };

        // Validate user's address
        $scope.validateAddressInfo = function() {

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

        };

        // Validate payment info
        $scope.validateUserPayment = function(callback) {

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

            // Use postal code of card holder if different from shipping
            var ccPostalCodeVerification = $scope.userInfo.address.postal_code;
            if ( (typeof $scope.userInfo.source.postal_code !== 'undefined') && ($scope.userInfo.source.postal_code.length != 0) ) {
                ccPostalCodeVerification = $scope.userInfo.source.postal_code;
            }

            // Attempt to generate token
            if (!validationFailed) {
                $http({
                    url: '/api/token',
                    method: 'POST',
                    data: {
                        name: $scope.userInfo.source.name,
                        number: $scope.userInfo.source.number,
                        exp_month: $scope.userInfo.source.exp_month,
                        exp_year: $scope.userInfo.source.exp_year,
                        cvc: $scope.userInfo.source.cvc,
                        address_zip: ccPostalCodeVerification
                    }
                }).success(function(token) {
                    $scope.userInfo.token = token.id;
                    return callback(true);

                }).error(function(error) {
                    switch (error) {
                        case 'invalid_number':
                            $scope.validationErrors.source.number = 'Please enter a valid number. You can use dashes or spaces to separate blocks of numbers if you choose';
                            validationFailed = true;
                            break;
                        case 'incorrect_number':
                            $scope.validationErrors.source.number = 'Please enter a correct number. You can use dashes or spaces to separate blocks of numbers if you choose';
                            validationFailed = true;
                            break;
                        case 'card_declined':
                            $scope.validationErrors.source.number = 'Your card has been declined. Please try another card.';
                            validationFailed = true;
                            break;
                        case 'processing_error':
                            $scope.validationErrors.source.number = 'There was an issue processing your payment. Please try again or contact our support team';
                            validationFailed = true;
                            break;
                        case 'expired_card':
                            $scope.validationErrors.source.number = 'This card has expired. Please use a different card';
                            validationFailed = true;
                            break;
                        case 'invalid_expiry_month':
                            $scope.validationErrors.source.exp_month = 'Please enter a valid expiry month';
                            validationFailed = true;
                            break;
                        case 'invalid_expiry_year':
                            $scope.validationErrors.source.exp_month = 'Please enter a valid expiry year';
                            validationFailed = true;
                            break;
                        case 'invalid_cvc':
                            $scope.validationErrors.source.cvc = 'Please enter a valid CVV';
                            validationFailed = true;
                            break;
                        case 'incorrect_cvc':
                            $scope.validationErrors.source.cvc = 'Please enter a correct CVV';
                            validationFailed = true;
                            break;
                        case 'incorrect_zip':
                            $scope.validationErrors.source.address_zip = 'Please enter the postal code / zip relating to your credit card';
                            validationFailed = true;
                            break;
                        default:
                            $scope.validationErrors.source.number = 'There was an issue processing your payment. Please try again or contact our support team';
                            validationFailed = true;
                            break;
                    }

                    return callback(false);
                });
            }

            else {
                callback(false);
            }

        }

})

.controller('loginCtrl', function ($scope, $http, $window, $location) {

        $scope.loginForm = {
            email: '',
            password: ''
        };

        $scope.login = function() {
            $http({
                url: '/login',
                method: 'POST',
                data: $scope.loginForm
            }).success(function(result) {
                $window.location.href = '/My-Account/';
            }).error(function(err) {
                $scope.loginError = 'Email or password is incorrect';
            });
        }
});


