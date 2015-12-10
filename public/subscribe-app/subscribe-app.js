'use strict';

angular.module('subscribe', [])

.controller('signupCtrl', function ($scope, $http, $window, $location) {

        // Set gift tab active if user selects gift
        var param = $location.absUrl().split('?');
        if (param.length > 1) {
            if (param[1].indexOf('gift') > -1) {
                $scope.activeTab = 2;
            }
            else {
                $scope.activeTab = 1;
            }
        }
        else {
            $scope.activeTab = 1;
        }


        // ------------- DATA INITIALIZATIONS ------------- //

        $scope.templateUrl = '/subscribe-app/views/signup.html';

        $scope.localUser = null;
        $scope.customer = null;

        // Get plan list
        $scope.plans = [];
        $scope.formPlans = [];
        $scope.doneFormLoad = false;    // Flag to indicate form loading has completed

        // Start on plan selection page
        $scope.formPage = 1;


        // ------------- RETRIEVE PLANS ------------- //
        $http({
            url: '/api/plan',
            method: 'GET'
        }).success(function (plans) {
            plans = plans.data;
            $scope.formPlans = [];
            $scope.formGifts = [];

            $scope.plans = plans;

            // Filter out duplicate plan in other currency
            for (var i = 0; i < plans.length; i++) {

                // Recurring Plans
                if ( (typeof plans[i].metadata.is_gift !== 'undefined') && (plans[i].metadata.is_gift === 'false') ) {
                    if (plans[i].currency === 'cad') {
                        $scope.formPlans.push(plans[i]);
                    }
                }

                // Gifts
                else {
                    if (plans[i].currency === 'cad') {
                        $scope.formGifts.push(plans[i]);
                    }
                }
            }

            // Sort recurring plans by ascending monthly price
            $scope.formPlans.sort(function(a, b) {
                if ( (a.amount/a.interval_count) > (b.amount/b.interval_count) ) {
                    return 1;
                }
                if ( (a.amount/a.interval_count) < (b.amount/b.interval_count) ) {
                    return -1;
                }
                return 0;
            });

            // Sort gifts by ascending monthly price
            $scope.formGifts.sort(function(a, b) {
                if ( (a.amount/a.interval_count) > (b.amount/b.interval_count) ) {
                    return 1;
                }
                if ( (a.amount/a.interval_count) < (b.amount/b.interval_count) ) {
                    return -1;
                }
                return 0;
            });

            $scope.doneFormLoad = true;

        }).error(function (err) {
        });


        // ----------------- FORM SETUP ------------------ //

        $scope.formOptions = {
            provinces: [],
            countries: [
                {id: 'CA', name: 'Canada'},
                {id: 'US', name: 'United States'}
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
        $scope.provincesAndStates = {
            caProvinces: [
                { id: 'AB', name: 'Alberta' },
                { id: 'BC', name: 'British Columbia' },
                { id: 'MB', name: 'Manitoba' },
                { id: 'NB', name: 'New Brunswick' },
                { id: 'NL', name: 'Newfoundland and Labrador' },
                { id: 'NS', name: 'Nova Scotia' },
                { id: 'ON', name: 'Ontario' },
                { id: 'PE', name: 'Prince Edward Island' },
                { id: 'QC', name: 'Quebec' },
                { id: 'SK', name: 'Saskatchewan' },
                { id: 'NT', name: 'Northwest Territories' },
                { id: 'NU', name: 'Nunavut' },
                { id: 'YT', name: 'Yukon' }
            ],
            usStates: [
                { id: 'AL', name: 'Alabama' },
                { id: 'AR', name: 'Arkansas' },
                { id: 'AZ', name: 'Arizona' },
                { id: 'CA', name: 'California' },
                { id: 'CO', name: 'Colorado' },
                { id: 'CT', name: 'Connecticut' },
                { id: 'DE', name: 'Delaware' },
                { id: 'FL', name: 'Florida' },
                { id: 'GA', name: 'Georgia' },
                { id: 'HI', name: 'Hawaii' },
                { id: 'ID', name: 'Idaho' },
                { id: 'IL', name: 'Illinois' },
                { id: 'IA', name: 'Indiana' },
                { id: 'KS', name: 'Kansas' },
                { id: 'KY', name: 'Kentucky' },
                { id: 'LA', name: 'Louisiana' },
                { id: 'ME', name: 'Maine' },
                { id: 'MD', name: 'Maryland' },
                { id: 'MA', name: 'Massachusetts' },
                { id: 'MI', name: 'Michigan' },
                { id: 'MN', name: 'Minnesota' },
                { id: 'MS', name: 'Mississippi' },
                { id: 'MO', name: 'Missouri' },
                { id: 'MT', name: 'Montana' },
                { id: 'NE', name: 'Nebraska' },
                { id: 'NV', name: 'Nevada' },
                { id: 'NH', name: 'New Hampshire' },
                { id: 'NJ', name: 'New Jersey' },
                { id: 'NM', name: 'New Mexico' },
                { id: 'NY', name: 'New York' },
                { id: 'NC', name: 'North Carolina' },
                { id: 'ND', name: 'North Dakota' },
                { id: 'OH', name: 'Ohio' },
                { id: 'OK', name: 'Oklahoma' },
                { id: 'OR', name: 'Oregon' },
                { id: 'PA', name: 'Pennsylvania' },
                { id: 'RI', name: 'Rhode Island' },
                { id: 'SC', name: 'South Carolina' },
                { id: 'SD', name: 'South Dakota' },
                { id: 'TN', name: 'Tennessee' },
                { id: 'TX', name: 'Texas' },
                { id: 'UT', name: 'Utah' },
                { id: 'VT', name: 'Vermont' },
                { id: 'VA', name: 'Virginia' },
                { id: 'WA', name: 'Washington' },
                { id: 'WV', name: 'West Virginia' },
                { id: 'WI', name: 'Wisconsin' },
                { id: 'WY', name: 'Wyoming' },
                { id: 'DC', name: 'District of Columbia' }
            ]
        };

        // Populate the expiry years for the form
        var currentYear = new Date().getFullYear();
        var expiryYears = [];
        for (var i = 0; i < 26; i++) {
            expiryYears.push(currentYear + i);
        }
        $scope.formOptions.ccExp.year = expiryYears;

        $scope.validationErrors = {};

        // Global validation flag for alert
        $scope.globalValidationFailed = false;


        // -------------- MODELS -------------- //

        $scope.userInfo = {
            name: '',
            email: '',
            password: '',

            subscription: {
                planId: '',
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
                address_zip: ''
            }
        };

        $scope.tax = {
            rate: 0,
            desc: ''
        };

        $scope.misc = {
            discount: 0,
            shippingCharge: 0,
            testCouponCode: ''
        };


        // ---------------- WATCHERS ----------------- //

        // Wait for plans to get loaded
        $scope.$watch(function() {return $scope.doneFormLoad}, function(newVal, oldVal) {
            if (newVal !== oldVal) {
                if ( (typeof oldVal !== 'undefined') && (newVal) ) {
                    loadUser();
                }
            }
        });

        // Load form provinces or states on country selection
        $scope.$watch('userInfo.address.country', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                if (newVal.id === 'CA') {
                    $scope.formOptions.provinces = $scope.provincesAndStates.caProvinces;
                }
                else if (newVal.id === 'US') {
                    $scope.formOptions.provinces = $scope.provincesAndStates.usStates;
                }
            }
        });

        // Calculate the user's tax rate for view
        $scope.$watch('userInfo.address.state', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                calculateTaxRate();
            }
        });


        // --------------------------------------------------------- //
        // ------------------- SCOPE METHODS ----------------------- //

        // Check if user is logged in. If true, load the local user and st customer
        function loadUser () {

            // Check if user is logged in
            $http({
                url: '/isloggedin',
                method: 'GET'
            }).success(function(result) {
                if (result) {
                    $scope.loggedIn = true;

                    // Get local user
                    $http({
                        url: '/api/user',
                        method: 'GET'
                    }).success(function(user) {
                        $scope.localUser = user;
                    }).error(function(error) {
                    });

                    // Get st info
                    $http({
                        url: '/api/customer',
                        method: 'GET'
                    }).success(function(customer) {
                        $scope.customer = customer;
                        markPlanAsSelected(customer.subscriptions.data);

                        // Populate userInfo model with customer obj data
                        $scope.userInfo.name = customer.shipping.name;
                        $scope.userInfo.address = customer.shipping.address;
                        $scope.userInfo.source = customer.sources.data[0];

                    }).error(function(error) {
                    });
                }
                else {
                    $scope.loggedIn = false;
                }
            }).error(function(error) {
                $scope.loggedIn = false;
            });
        }

        // Mark off one the plan which the user has selected as subscribed to
        function markPlanAsSelected(customerSubscriptions) {

            // Get plan subscription id which the user is subscribed to
            var recurringPlanId = null;
            for (var i = 0; i < customerSubscriptions.length; i++) {
                if ( (typeof customerSubscriptions[i].plan.metadata.is_gift !== 'undefined') && (customerSubscriptions[i].plan.metadata.is_gift === 'false') ) {
                    recurringPlanId = customerSubscriptions[i].plan.id;
                    break;
                }
            }
            $scope.cleanActivePlanId = recurringPlanId.split('_')[0];
        }

        // Select a plan
        $scope.selectPlan = function(planId) {

            // Check if plans have been loaded yet
            if ($scope.plans.length > 0) {
                $scope.userInfo.subscription.planId = planId;
                $scope.formPage = 2;

                for (var i = 0; i < $scope.plans.length; i++) {
                    if ($scope.plans[i].id === planId) {
                        $scope.chosenPlan = $scope.plans[i];
                        $scope.chosenPlan.cleanName = $scope.chosenPlan.name.split('_')[0];
                    }
                }
            }
        };

        $scope.goBack = function(formPage) {
            $scope.formPage = formPage;
        };


        // After CC token generation, register the user and create the customer in Stripe
        $scope.completeRegistration = function() {

            $scope.globalValidationFailed = false;
            $scope.processingReg = true;

            if ($scope.validateAddressInfo()) {

                $scope.validateUserPayment(function(result) {
                    if (result) {

                        $scope.validateNewAccount(function(result) {

                            if (result) {

                                // Gift recurring plan OR one-time purchase
                                if ( (typeof $scope.chosenPlan !== 'undefined') && (typeof $scope.chosenPlan.metadata.is_gift !== 'undefined') && ($scope.chosenPlan.metadata.is_gift === 'true') ) {

                                    // One time gift
                                    if ( ($scope.chosenPlan.interval === 'month') && ($scope.chosenPlan.interval_count === 1) ) {
                                        createOneTimeGift(function(result) {
                                            if (!result) {
                                                prePopulateShippingForm();
                                                prePopulatePaymentForm();
                                                $scope.processingReg = false;
                                                $scope.globalValidationFailed = true;
                                            }
                                        });
                                    }

                                    // Recurring gift
                                    else {
                                        createRecurringGift(function(result) {
                                            if (!result) {
                                                prePopulateShippingForm();
                                                prePopulatePaymentForm();
                                                $scope.processingReg = false;
                                                $scope.globalValidationFailed = true;
                                            }
                                        });
                                    }
                                }

                                // Recurring monthly plan
                                else {
                                    createRecurringPlan(function(result) {
                                        if (!result) {
                                            prePopulateShippingForm();
                                            prePopulatePaymentForm();
                                            $scope.processingReg = false;
                                            $scope.globalValidationFailed = true;
                                        }
                                    });
                                }

                            }
                            else {
                                prePopulateShippingForm();
                                prePopulatePaymentForm();
                                $scope.processingReg = false;
                                $scope.globalValidationFailed = true;
                            }
                        });

                    }
                    else {
                        prePopulateShippingForm();
                        prePopulatePaymentForm();
                        $scope.processingReg = false;
                        $scope.globalValidationFailed = true;
                    }
                });

            }
            else {
                prePopulateShippingForm();
                $scope.processingReg = false;
                $scope.globalValidationFailed = true;
            }
        };

        // Validate new account creation
        $scope.validateNewAccount = function(callback) {

            if ($scope.loggedIn) {
                return callback(true);
            }

            // Reset validation objects
            var validationFailed = false;
            var validateEmailFailed = false;
            $scope.validationErrors = {};

            // Email format
            var emailRegex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

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
            else if ( ($scope.userInfo.password.length < 6) || ($scope.userInfo.password.length > 254) ) {
                $scope.validationErrors.password = 'Please use a password that is 6 to 200 characters';
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
                        $scope.validationErrors.email = 'Email already in use. If this is your email, please login to your account.';
                        validationFailed = true;
                        return callback(false);
                    }
                    else {
                        return callback(true);
                    }

                }).error(function(error) {
                    $scope.validationErrors.email = 'Email already in use. If this is your email, please login to your account.';
                    return callback(false);
                });
            }

            else {
                callback(false);
            }
        };

        // Validate user's address
        $scope.validateAddressInfo = function() {

            if ($scope.loggedIn) {
                return true;
            }

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
            // Remove all whitespace from postal code
            else {
                $scope.userInfo.address.postal_code = $scope.userInfo.address.postal_code.replace(/\s+/g, '');
            }

            return !validationFailed;

        };

        // Validate payment info
        $scope.validateUserPayment = function(callback) {

            if ($scope.loggedIn) {
                return callback(true);
            }

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
            var cvvRegex = /^[0-9]{3,6}$/;

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
            else if (typeof $scope.userInfo.source.exp_month.id === 'undefined') {
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
                $http({
                    url: '/api/token',
                    method: 'POST',
                    data: $scope.userInfo.source
                }).success(function(token) {
                    $scope.userInfo.token = token.id;
                    return callback(true);

                }).error(function(err) {
                    handleStCCErr(err);
                    return callback(false);
                });
            }

            else {
                callback(false);
            }

        };

        $scope.applyCoupon = function() {
            var couponCode = $scope.misc.testCouponCode;

            delete $scope.validationErrors.couponCode;

            if ( (typeof couponCode !== 'undefined') && (couponCode !== null) && (couponCode.length !== 0) && (couponCode !== '') ) {

                $http({
                    url: '/api/coupon',
                    method: 'GET',
                    params: {
                        id: couponCode
                    }
                }).success(function(coupon) {
                    if (coupon.amount_off !== null) {
                        $scope.userInfo.subscription.couponCode = couponCode;
                        $scope.misc.discount = (coupon.amount_off/100);
                    }
                    else {
                        $scope.userInfo.subscription.couponCode = couponCode;
                        $scope.misc.discount = parseFloat( ( ($scope.chosenPlan.amount/100) * (coupon.percent_off/100) ).toFixed(2) );
                    }
                }).error(function(err) {
                    $scope.misc.discount = 0;
                    $scope.userInfo.subscription.couponCode = '';
                    $scope.validationErrors.couponCode = 'Coupon code is invalid';
                });

            }
            else {
                $scope.misc.discount = 0;
                $scope.userInfo.subscription.couponCode = '';
                $scope.validationErrors.couponCode = 'Coupon code is invalid';
            }


        };


        function calculateTaxRate () {
            var province = $scope.userInfo.address.state.id;
            var taxPercentage = 0;
            var taxDesc = '';
            switch(province) {
                case 'AB':
                    taxPercentage = 0.05;
                    taxDesc = 'GST (5%)';
                    break;
                case 'BC':
                    taxPercentage = 0.12;
                    taxDesc = 'GST / PST (5% + 7%)';
                    break;
                case 'MB':
                    taxPercentage = 0.13;
                    taxDesc = 'GST / PST (5% + 8%)';
                    break;
                case 'NB':
                    taxPercentage = 0.13;
                    taxDesc = 'HST (13%)';
                    break;
                case 'NL':
                    taxDesc = 'HST (13%)';
                    taxPercentage = 0.13;
                    break;
                case 'NS':
                    taxDesc = 'HST (15%)';
                    taxPercentage = 0.15;
                    break;
                case 'NT':
                    taxDesc = 'GST (5%)';
                    taxPercentage = 0.05;
                    break;
                case 'NU':
                    taxDesc = 'GST (5%)';
                    taxPercentage = 0.05;
                    break;
                case 'ON':
                    taxDesc = 'HST (13%)';
                    taxPercentage = 0.13;
                    break;
                case 'PE':
                    taxDesc = 'HST (14%)';
                    taxPercentage = 0.14;
                    break;
                case 'QC':
                    taxDesc = 'GST / QST (5% + 9.975%)';
                    taxPercentage = 0.1498;
                    break;
                case 'SK':
                    taxDesc = 'GST + PST (5% + 10%)';
                    taxPercentage = 0.15;
                    break;
                case 'YT':
                    taxDesc = 'GST (5%)';
                    taxPercentage = 0.05;
                    break;
                default:
                    taxDesc = '';
                    taxPercentage = 0;
                    break;
            }

            $scope.tax = {rate: taxPercentage, desc: taxDesc};
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


        /**
         * Create a new user and subscribe them to a plan.
         */
        function createRecurringPlan(callback) {

            createUser(function(customer) {

                if (customer) {

                    subscribeToRecurringPlan(function(newSubscription) {

                        if (newSubscription) {
                            $window.location.href = '/My-Account';
                        }
                        else {
                            return callback(false);
                        }
                    });
                }
                else {
                    return callback(false);
                }
            });

        }

        /**
         * Create a gift item.
         * If a user is already registered, then skip customer registration and add the shipping address meta-data.
         * If user is not registered, then follow the recurring plan steps.
         */
        function createRecurringGift(callback) {
            if ($scope.loggedIn) {
                $scope.userInfo.subscription.metadata = $scope.userInfo.address;
                $scope.userInfo.subscription.metadata.name = $scope.userInfo.name;

                subscribeToRecurringPlan(function(newSubscription) {
                    if (newSubscription) {
                        $window.location.href = '/My-Account';
                    }
                    else {
                        return callback(false);
                    }
                });
            }

            else {
                createRecurringPlan();
            }
        }

        /**
         * Charge user for one-time gift
         * @param callback
         */
        function createOneTimeGift(callback) {

            createUser(function(customer) {

                if (customer) {
                    $http({
                        url: '/api/charge/onetime',
                        method: 'POST',
                        data: {
                            tr: customer.metadata.taxRate,
                            coupon: $scope.userInfo.subscription.couponCode,
                            plan: $scope.userInfo.subscription.planId
                        }
                    }).success(function(successfulCharge) {
                        $window.location.href = '/My-Account';
                    }).error(function(err) {
                        handleStCCErr(err);
                        return callback(false);
                    });
                }
                else {
                    return callback(false);
                }
            });
        }

        /**
         * Create subscription to recurring plan
         * @param callback
         */
        function subscribeToRecurringPlan(callback) {
            $http({
                url: '/api/subscription',
                method: 'POST',
                data: {
                    coupon: $scope.userInfo.subscription.couponCode,
                    plan: $scope.userInfo.subscription.planId
                }
            }).success(function(newSubscription) {
                return callback(newSubscription);
            }).error(function(err) {
                handleStCCErr(err);
                $scope.subErr = true;
                return callback(false);
            });
        }

        /**
         * Creates both a local user and st customer
         * @param callback
         */
        function createUser (callback) {

            // Need local registration and st registration
            if (!$scope.loggedIn && ($scope.customer === null) ) {
                registerCustomerLocally( function(newUser) {

                    if (newUser) {
                        $scope.isLoggedIn = true;
                        $scope.localUser = newUser;

                        createStCustomer(newUser.email, function(customer) {

                            if (customer) {
                                $scope.customer = customer;
                                return callback(customer);
                            }
                            else {
                                return callback(false);
                            }
                        });
                    }
                    else {
                        return callback(false);
                    }
                });
            }

            // Need st reg
            else if ($scope.customer === null) {
                createStCustomer($scope.localUser.email, function (customer) {

                    if (customer) {
                        $scope.customer = customer;
                        return callback(customer);
                    }
                    else {
                        return callback(false);
                    }
                });
            }

            // User already created and logged in
            else {
                return callback(true);
            }

        }

        function registerCustomerLocally (callback) {

            // Create Customer Account Locally
            $http({
                url: '/signup',
                method: 'POST',
                data: {
                    email: $scope.userInfo.email,
                    password: $scope.userInfo.password
                }
            }).success(function(newUser) {

                if (typeof newUser !== 'undefined') {
                    if (typeof newUser.password !== 'undefined') {
                        delete newUser.password;
                    }
                }
                return callback(newUser);

            }).error(function(error) {
                $scope.validationErrors.email = 'Email already in use';
                $scope.processingReg = false;
                return callback(false);
            });

        }

        function createStCustomer(newUserEmail, callback) {
            $http({
                url: '/api/customer',
                method: 'POST',
                data: {
                    email: newUserEmail,
                    name: $scope.userInfo.name,
                    address: $scope.userInfo.address,
                    source: $scope.userInfo.token
                }
            }).success(function(newCustomer) {
                return callback(newCustomer);
            }).error(function(err) {
                handleStCCErr(err);
                $scope.processingReg = false;
                return callback(false);
            });
        }


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

        // Handle payment cc error codes
        function handleStCCErr(errCode) {
            // Reset validation objects
            $scope.validationErrors = {
                source: {}
            };

            switch (errCode) {
                case 'invalid_number':
                    $scope.validationErrors.source.number = 'Please enter a valid number. You can use dashes or spaces to separate blocks of numbers if you choose';
                    break;
                case 'incorrect_number':
                    $scope.validationErrors.source.number = 'Please enter a correct number. You can use dashes or spaces to separate blocks of numbers if you choose';
                    break;
                case 'card_declined':
                    $scope.validationErrors.source.number = 'Your card has been declined.';
                    break;
                case 'processing_error':
                    $scope.validationErrors.source.number = 'There was an issue processing your payment. Please try again or contact our support team';
                    break;
                case 'expired_card':
                    $scope.validationErrors.source.number = 'This card has expired. Please use a different card';
                    break;
                case 'invalid_expiry_month':
                    $scope.validationErrors.source.exp_month = 'Please enter a valid expiry month';
                    break;
                case 'invalid_expiry_year':
                    $scope.validationErrors.source.exp_month = 'Please enter a valid expiry year';
                    break;
                case 'invalid_cvc':
                    $scope.validationErrors.source.cvc = 'Please enter a valid CVV';
                    break;
                case 'incorrect_cvc':
                    $scope.validationErrors.source.cvc = 'Please enter a correct CVV';
                    break;
                case 'incorrect_zip':
                    $scope.validationErrors.source.address_zip = 'Invalid postal code for this card.';
                    break;
                default:
                    $scope.validationErrors.source.number = 'There was an issue processing your payment. Please try again or contact our support team';
                    break;
            }
        }

        // Expose parse float function to view
        $scope.parseFloat = function(str) {
            return parseFloat(str);
        };

        // Expose indexOf function to view
        $scope.indexOf = function(str, subStr) {
            return str.indexOf(subStr);
        };

});
