'use strict';

function mainCtrl($scope, $rootScope, $window, appService) {

    appService.stPubKey.get(function(data) {
        $rootScope.stPubKey = data.stPubKey;
    }, function(err) {
        $rootScope.stPubKey = '';
    });

    $scope.account = {
        email: '',
        stId: ''
    };

    // --------------------------------------
    // Retrieve user account details
    appService.user.get(function (data) {
        $scope.account.email = data.email;
        $scope.account.stId = data.stId;

        // Retrieve customer and billing address
        appService.customer.get(function(customer) {
            $scope.customer = customer;

            // Retrieve sources and filter out default source
            appService.source.getSourceById({sourceId: customer.defaultSource}, function(source) {
                if (source) {
                    $scope.source = source;
                }
            });

        }, function (err) {
        });

        // Retrieve active subscription
        appService.subscription.get(function(subscription) {
            if (subscription) {
                $scope.customerSubscription = subscription;

                // Retrieve associated shipping address if exists
                appService.subscriptionAltShippingAddress.get({subId: subscription.subscriptionId}, function(altShippingAddr) {
                    if (altShippingAddr.hasOwnProperty('name')) {
                        $scope.altShippingAddr = altShippingAddr;
                    }
                });
            }
        });

    }, function (error) {
    });

    $scope.logout = function() {
        appService.logout.save(function(data, status, headers, config) {
            $window.location.href = '/';
        }, function(data, status, headers, config) {});
    };

}

function membershipCtrl($scope, appService) {

    $scope.formData = {};
    $scope.passwordData = {
        currentPassword: '',
        newPassword: '',
        newPasswordConfirm: ''
    };

    $scope.successfullyChangedPassword = false;

    $scope.changePassword = function () {

        $scope.successfullyChangedPassword = false;

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
                $scope.successfullyChangedPassword = true;

                // Reset vars
                $scope.validationErrors = {};
                $scope.passwordData = {};

            }, function(err) {
                if (err.data === 'invalid_new_password') {
                    $scope.validationErrors.newPassword = 'Password must contain at least 6 characters';
                    $scope.validationErrors.newPasswordConfirm = 'Password must contain at least 6 characters';
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

function updateBillingCtrl ($scope, $rootScope, stripe, appService) {

    $scope.billing = {
        address: {}
    };
    $scope.source = {};
    $scope.sourceToken = null;

    $scope.updateInProgress = false;

    $scope.validationErrors = {};

    $scope.formProvinces = {
        canada: [
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
        us: [
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

    // Set Default to Canada until region loaded
    $scope.billing.address.country = 'CA';
    $scope.activeProvinceSelect = $scope.formProvinces.canada;

    // Update on load user region
    $scope.$watch('$parent.userCountry', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            if ( (newVal) && (newVal === 'US') ) {
                $scope.billing.address.country = 'US';
                $scope.shipping.address.country = 'US';
                $scope.activeProvinceSelect = $scope.formProvinces.us;
            }
        }
    });

    $scope.$watch('billing.address.country', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            if (newVal) {
                if (newVal === 'US') {
                    $scope.activeProvinceSelect = $scope.formProvinces.us;
                }
                else {
                    $scope.activeProvinceSelect = $scope.formProvinces.canada;
                }
            }
        }
    });

    // Populate the expiry years for the form
    var currentYear = new Date().getFullYear();
    var expiryYears = [];
    for (var i = 0; i < 26; i++) {
        expiryYears.push(currentYear + i);
    }
    $scope.ccExpYear = expiryYears;

    $scope.updateBilling = function() {

        $scope.updateInProgress = true;

        var billingAddrValiadtion = validateAddress($scope.billing);

        if (billingAddrValiadtion.valid) {

            validateUserPayment(function(result) {
                if (result) {

                    // Update customer with new billing address
                    appService.customer.update({item: 'shipping', data: $scope.billing}, function(customer) {

                        appService.customer.get(function(customer) {
                            $scope.$parent.customer = customer;
                        }, function(err) {
                        });

                        // Update customer with new card
                        appService.customer.update({item: 'source', data: $scope.sourceToken}, function(customer) {
                            $scope.$parent.source.lastFour = customer.sources.data[0].last4;
                            $scope.$parent.source.brand = customer.sources.data[0].brand;
                            $scope.$parent.source.country = customer.sources.data[0].country;
                            $scope.$parent.source.sourceId = customer.sources.data[0].id;
                            $scope.$parent.customer.defaultSource = customer.sources.data[0].id;
                            $scope.updateInProgress = false;
                            $scope.successfullyUpdated = true;

                            $scope.billing = {
                                address: {}
                            };
                            $scope.source = {};
                            $scope.sourceToken = null;
                        }, function(err) {
                            handleStCCErr(err);
                            $scope.updateInProgress = false;
                            $scope.successfullyUpdated = false;
                        });
                    }, function(err) {
                        $scope.updateInProgress = false;
                        $scope.successfullyUpdated = false;
                    });
                }
                else {
                    $scope.updateInProgress = false;
                    $scope.successfullyUpdated = false;
                }
            });
        }
        else {
            $scope.validationErrors.billing = billingAddrValiadtion.errors;
            $scope.updateInProgress = false;
            $scope.successfullyUpdated = false;
        }
    };

    // Validate shipping address if using another one
    function validateAddress(addressInfo) {

        // Reset validation objects
        var validationFailed = false;
        var validationErrors = {
            address: {}
        };

        var numRegex = /^[0-9]+$/i;
        var canadianPostalRegex = /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ]\d[ABCEGHJKLMNPRSTVWXYZ]\d$/i;

        // Name validation
        if (!addressInfo.name) {
            validationErrors.name = 'Please enter your full name';
            validationFailed = true;
        }
        else if ( addressInfo.name.length > 254 ) {
            validationErrors.name = 'Name is too long. Please enter a valid name';
            validationFailed = true;
        }

        if (addressInfo.company) {
            if (addressInfo.company.length > 254) {
                validationErrors.company = 'Company name is too long. Please limit to 250 characters';
                validationFailed = true;
            }
        }

        // Address validation
        if (!addressInfo.address.line1) {
            validationErrors.address.line1 = 'Please enter your address';
            validationFailed = true;
        }
        else if ( addressInfo.address.line1.length > 1024 ) {
            validationErrors.address.line1 = 'Address is too long. Please enter a valid address';
            validationFailed = true;
        }
        if (addressInfo.address.line2) {
            if (addressInfo.address.line2.length > 1024) {
                validationErrors.address.line2 = 'Address line 2 is too long. Please enter a valid address for line 2';
                validationFailed = true;
            }
        }

        // City validation
        if (!addressInfo.address.city) {
            validationErrors.address.city = 'Please enter your city';
            validationFailed = true;
        }
        else if ( addressInfo.address.city.length > 1024 ) {
            validationErrors.address.city = 'City is too long. Please enter a valid city';
            validationFailed = true;
        }

        // State validation
        if (!addressInfo.address.state) {
            validationErrors.address.state = 'Please select a province/state';
            validationFailed = true;
        }

        // Country validation
        if (!addressInfo.address.country) {
            validationErrors.address.country = 'Please select a country';
            validationFailed = true;
        }

        // Postal Code validation
        if (!addressInfo.address.postal_code) {
            validationErrors.address.postal_code = 'Please enter your postal / zip code';
            validationFailed = true;
        }
        else if (addressInfo.address.country === 'US') {
            if (!numRegex.test(addressInfo.address.postal_code.toString())) {
                validationErrors.address.postal_code = 'Zip code is invalid. Please enter in the form of: 10001';
                validationFailed = true;
            }
            else if (addressInfo.address.postal_code.length > 5) {
                validationErrors.address.postal_code = 'Zip code is invalid (more than 5 digits). Please enter in the form of: 10001';
                validationFailed = true;
            }
        }
        else if (addressInfo.address.country === 'CA') {

            // Strip spaces
            addressInfo.address.postal_code = addressInfo.address.postal_code.replace(/\s+/g, '');

            if (!canadianPostalRegex.test(addressInfo.address.postal_code)) {
                validationErrors.address.postal_code = 'Postal code is invalid. Please enter in the form of: A1B 2C3';
                validationFailed = true;
            }
            else if (addressInfo.address.postal_code.length > 6) {
                validationErrors.address.postal_code = 'Postal code is invalid (more than 6 characters). Please enter in the form of: A1B 2C3';
                validationFailed = true;
            }
        }

        return {valid: !validationFailed, errors: validationErrors};
    }

    // Validate payment info
    function validateUserPayment(callback) {

        // Reset validation objects
        var validationFailed = false;
        $scope.validationErrors = {
            source: {}
        };

        // CC Number basic validation
        var numSpaceDashRegex = /^[0-9 -]+$/i;
        var creditCardRegex = /^\d{12,19}$/;
        var cvvRegex = /^[0-9]{3,6}$/;

        // Basic Card Number Validation
        if (!$scope.source.number) {
            $scope.validationErrors.source.number = 'Please enter your credit card number';
            validationFailed = true;
        }
        else if ( !numSpaceDashRegex.test($scope.source.number) ) {
            $scope.validationErrors.source.number = 'Please enter a valid number. You can use dashes or spaces to separate blocks of numbers if you choose';
            validationFailed = true;
        }
        else if ( !creditCardRegex.test($scope.source.number.replace(/\D/g,'')) ) {
            $scope.validationErrors.source.number = 'Please enter a valid number. You can use dashes or spaces to separate blocks of numbers if you choose';
            validationFailed = true;
        }

        // Expiry Validation
        if (!$scope.source.exp_month) {
            $scope.validationErrors.source.exp_month = 'Please select an expiration month';
            validationFailed = true;
        }

        if (!$scope.source.exp_year) {
            $scope.validationErrors.source.exp_year = 'Please select an expiration year';
            validationFailed = true;
        }

        // CVV validation
        if (!$scope.source.cvc) {
            $scope.validationErrors.source.cvc = 'Please enter the verification number on the back of your card';
            validationFailed = true;
        }
        else if ( (!cvvRegex.test($scope.source.cvc.toString())) ) {
            $scope.validationErrors.source.cvc = 'Please enter a valid verification number';
            validationFailed = true;
        }

        // Attempt to generate token
        if (!validationFailed) {

            // Append name for additional CC verification
            $scope.source.name = $scope.billing.name;

            // Append postal code for additional CC verification
            // (Address line 1 check is currently not used)
            $scope.source.address_zip = $scope.billing.address.postal_code;

            stripe.card.createToken($scope.source, {key: $rootScope.stPubKey})
                .then(function (token) {
                    $scope.sourceToken = token.id;
                    $scope.chargeErr = false;
                    return callback(true);
                }).error(function(err) {
                    handleStCCErr(err);
                    return callback(false);
                });

        }

        else {
            callback(false);
        }

    }

}

function updateSubShippingCtrl ($scope, appService) {

    $scope.shipping = {
        address: {}
    };

    $scope.updateInProgress = false;

    $scope.validationErrors = {};

    $scope.formProvinces = {
        canada: [
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
        us: [
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

    // Set Default to Canada until region loaded
    $scope.shipping.address.country = 'CA';
    $scope.activeProvinceSelect = $scope.formProvinces.canada;

    // Populate the expiry years for the form
    var currentYear = new Date().getFullYear();
    var expiryYears = [];
    for (var i = 0; i < 26; i++) {
        expiryYears.push(currentYear + i);
    }
    $scope.ccExpYear = expiryYears;

    // Update on load user region
    $scope.$watch('$parent.userCountry', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            if ( (newVal) && (newVal === 'US') ) {
                $scope.billing.address.country = 'US';
                $scope.shipping.address.country = 'US';
                $scope.activeProvinceSelect = $scope.formProvinces.us;
                $scope.activeShippingProvinceSelect = $scope.formProvinces.us;
            }
        }
    });

    $scope.$watch('shipping.address.country', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            if (newVal) {
                if (newVal === 'US') {
                    $scope.activeProvinceSelect = $scope.formProvinces.us;
                }
                else {
                    $scope.activeProvinceSelect = $scope.formProvinces.canada;
                }
            }
        }
    });

    $scope.updateShipping = function() {

        $scope.updateInProgress = true;

        var shippingAddrValidation = validateAddress($scope.shipping);

        if (shippingAddrValidation.valid) {

            // Create new shipping address
            appService.altShippingAddress.save({shipping: $scope.shipping}, function(altShippingAddr) {

                // Update subscription with new shipping address
                appService.subscription.updateShippingAddress({
                    subId: $scope.customerSubscription.subscriptionId,
                    altShippingAddrId: altShippingAddr.id
                }, function(result) {
                    $scope.$parent.altShippingAddr = altShippingAddr;
                    $scope.successfullyUpdated = true;
                    $scope.shipping = {
                        address: {}
                    };

                }, function(err) {
                    $scope.updateInProgress = false;
                    $scope.successfullyUpdated = false;
                });

            }, function(err) {
                $scope.updateInProgress = false;
                $scope.successfullyUpdated = false;
            });
        }
        else {
            $scope.validationErrors.shipping = shippingAddrValidation.errors;
            $scope.updateInProgress = false;
            $scope.successfullyUpdated = false;
        }
    };

    // Validate shipping address if using another one
    function validateAddress(addressInfo) {

        // Reset validation objects
        var validationFailed = false;
        var validationErrors = {
            address: {}
        };

        var numRegex = /^[0-9]+$/i;
        var canadianPostalRegex = /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ]\d[ABCEGHJKLMNPRSTVWXYZ]\d$/i;

        // Name validation
        if (!addressInfo.name) {
            validationErrors.name = 'Please enter your full name';
            validationFailed = true;
        }
        else if ( addressInfo.name.length > 254 ) {
            validationErrors.name = 'Name is too long. Please enter a valid name';
            validationFailed = true;
        }

        if (addressInfo.company) {
            if (addressInfo.company.length > 254) {
                validationErrors.company = 'Company name is too long. Please limit to 250 characters';
                validationFailed = true;
            }
        }

        // Address validation
        if (!addressInfo.address.line1) {
            validationErrors.address.line1 = 'Please enter your address';
            validationFailed = true;
        }
        else if ( addressInfo.address.line1.length > 1024 ) {
            validationErrors.address.line1 = 'Address is too long. Please enter a valid address';
            validationFailed = true;
        }
        if (addressInfo.address.line2) {
            if (addressInfo.address.line2.length > 1024) {
                validationErrors.address.line2 = 'Address line 2 is too long. Please enter a valid address for line 2';
                validationFailed = true;
            }
        }

        // City validation
        if (!addressInfo.address.city) {
            validationErrors.address.city = 'Please enter your city';
            validationFailed = true;
        }
        else if ( addressInfo.address.city.length > 1024 ) {
            validationErrors.address.city = 'City is too long. Please enter a valid city';
            validationFailed = true;
        }

        // State validation
        if (!addressInfo.address.state) {
            validationErrors.address.state = 'Please select a province/state';
            validationFailed = true;
        }

        // Country validation
        if (!addressInfo.address.country) {
            validationErrors.address.country = 'Please select a country';
            validationFailed = true;
        }

        // Postal Code validation
        if (!addressInfo.address.postal_code) {
            validationErrors.address.postal_code = 'Please enter your postal / zip code';
            validationFailed = true;
        }
        else if (addressInfo.address.country === 'US') {
            if (!numRegex.test(addressInfo.address.postal_code.toString())) {
                validationErrors.address.postal_code = 'Zip code is invalid. Please enter in the form of: 10001';
                validationFailed = true;
            }
            else if (addressInfo.address.postal_code.length > 5) {
                validationErrors.address.postal_code = 'Zip code is invalid (more than 5 digits). Please enter in the form of: 10001';
                validationFailed = true;
            }
        }
        else if (addressInfo.address.country === 'CA') {

            // Strip spaces
            addressInfo.address.postal_code = addressInfo.address.postal_code.replace(/\s+/g, '');

            if (!canadianPostalRegex.test(addressInfo.address.postal_code)) {
                validationErrors.address.postal_code = 'Postal code is invalid. Please enter in the form of: A1B 2C3';
                validationFailed = true;
            }
            else if (addressInfo.address.postal_code.length > 6) {
                validationErrors.address.postal_code = 'Postal code is invalid (more than 6 characters). Please enter in the form of: A1B 2C3';
                validationFailed = true;
            }
        }

        return {valid: !validationFailed, errors: validationErrors};
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
    .controller('updateBillingCtrl', updateBillingCtrl)
    .controller('updateSubShippingCtrl', updateSubShippingCtrl)
    .controller('updatePlanCtrl', updatePlanCtrl);