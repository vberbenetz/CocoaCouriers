'use strict';

function mainCtrl ($scope, $cookies, appService) {

    $scope.basePath = '/assets/media';

    $scope.userCountry = 'CA';

    $scope.cart = [];

    $scope.customer = null;
    $scope.altShippingAddresses = [];
    $scope.sources = [];

    $scope.fullyLoggedIn = false;

    $scope.loaded = {};

    // Retrieve cart from cookie
    var cartPidQs = $cookies.getObject('cartPidQs');
    if ( (typeof cartPidQs !== 'undefined') && (cartPidQs.length > 0) ) {
        appService.productList.queryByIds({productIds: cartPidQs}, function(products) {

            for (var i = 0; i < products.length; i++) {
                for (var j = 0; j < cartPidQs.length; j++) {
                    if (products[i].id === cartPidQs[j].pid) {
                        var obj = {
                            quantity: cartPidQs[j].quantity,
                            product: products[i]
                        };
                        $scope.cart.push(obj);
                    }
                }
            }

        });
    }

    // Retrieve user object (check if logged in)
    appService.user.get(function(user) {

        $scope.user = user;

        // Retrieve customer and billing address
        appService.customer.get(function(customer) {
            $scope.customer = customer;
            $scope.fullyLoggedIn = true;
            $scope.loaded.customer = true;
            $scope.loaded.billingAddr = true;
        }, function (err) {
            $scope.loaded.customer = true;
            $scope.loaded.billingAddr = true;
        });

        // Retrieve sources
        appService.source.query(function(sources) {
            if (sources) {
                $scope.sources = sources;
                $scope.loaded.sources = true;
            }
        }, function (err) {
            $scope.loaded.sources = true;
        });

        // Retrieve alt shipping addrs
        appService.altShippingAddress.query(function(altShippingAddrs) {
            if (altShippingAddrs) {
                $scope.altShippingAddresses = altShippingAddrs;
                $scope.loaded.altShippingAddrs = true;
            }
        }, function (err) {
            $scope.loaded.altShippingAddrs = true;
        });

    }, function(err) {
        $scope.user = null;
        $scope.loaded.customer = true;
        $scope.loaded.billingAddr = true;
        $scope.loaded.sources = true;
        $scope.loaded.altShippingAddrs = true;
    });

    $scope.updateCartCookie = function() {
        var pidQs = [];
        var cart = $scope.cart;
        for (var z = 0; z < cart.length; z++) {
            pidQs.push({
                pid: cart[z].product.id,
                quantity: cart[z].quantity
            });
        }
        $cookies.putObject('cartPidQs', pidQs);
    };

    $scope.updateCart = function(product) {
        var cart = $scope.cart;

        // Not in cart
        if (findProductInCart(cart, product.id) === null) {
            $scope.cart.push({
                product: product,
                quantity: 1
            });
            $scope.updateCartCookie();
        }
    }

}

function storeCtrl ($scope, $state, appService) {

    if (typeof $scope.$parent.products === 'undefined') {
        appService.productList.query(function(products) {
            $scope.$parent.products = products;
        }, function(err) {
        });
    }

    $scope.goToProduct = function (product) {
        $state.go('product', {productId: product.id});
    };

    $scope.addToCart = function(product) {
        $scope.$parent.updateCart(product);
        $state.go('cart');
    };
}

function productCtrl ($scope, $state, $stateParams, appService) {

    // Flag indicating successful product retrieval
    $scope.productLoadFlag = null;
    $scope.uncloak = false;

    // Process all other items on page after product has completed loading
    $scope.loadPage = function() {

        // Load links to product images
        $scope.productImages = generateListOfProductImgLinks($scope.$parent.basePath, $scope.product.id, $scope.product.numberOfImages);
        $scope.activeImageIndex = 0;

        $scope.uncloak = true;
    };

    // Watch for when product data is loaded
    $scope.$watch('productLoadFlag', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            if (newVal === true) {
                $scope.loadPage();
            }
        }
    });

    $scope.addToCart = function(product) {
        $scope.$parent.updateCart(product);
        $state.go('cart');
    };


// --------------- INITIAL LOAD UP OF PRODUCT --------------- //

    // Load product if parent list was not populated
    if (typeof $scope.$parent.products === 'undefined') {
        appService.product.get({productId: $stateParams.productId}, function(product) {
            $scope.product = product;

            $scope.productLoadFlag = true;

        }, function(err) {
            $state.go('home');
        });
    }
    // Fetch from parent list cache since it was loaded
    else {
        $scope.product = findProductInList($scope.$parent.products, $stateParams.productId);

        // Not in parent cache
        if ($scope.product === null) {
            appService.product.get({productId: $stateParams.productId}, function(product) {
                $scope.product = product;

                $scope.productLoadFlag = true;

            }, function(err) {
                $state.go('home');
            });
        }
        else {
            $scope.loadPage();
        }
    }

}

function cartCtrl ($scope) {

    $scope.Math = window.Math;

    $scope.userCountry = $scope.$parent.userCountry;

    $scope.subtotal = 0;
    $scope.discount = 0;

    $scope.removeFromCart = function(productId) {
        var cart = $scope.$parent.cart;
        for (var p = 0; p < cart.length; p++) {
            if (cart[p].product.id === productId) {
                cart.splice(p, 1);
                $scope.$parent.cart = cart;
                break;
            }
        }

        $scope.$parent.updateCartCookie();
    };

    $scope.calcSubtotal = function() {
        var cart = $scope.$parent.cart;
        var subtotal = 0;
        for (var s = 0; s < cart.length; s++) {

            var priceOfItem = cart[s].product.cadPrice;
            if ($scope.userCountry === 'US') {
                priceOfItem = cart[s].product.usPrice;
            }

            subtotal += cart[s].quantity * priceOfItem;
        }

        $scope.subtotal = subtotal;

        $scope.updateCartCookie();

        return (subtotal / 100).toFixed(2);
    };

    $scope.applyDiscount = function() {

    };

}

function checkoutCtrl ($scope, $http, appService) {
    $scope.discount = 0;
    $scope.subtotal = 0;

    $scope.Math = window.Math;

    $scope.processingOrder = false;

    $scope.newAltShipping = false;
    $scope.selectedAltShippingAddr = false;

    $scope.calcSubtotal = function() {
        var cart = $scope.$parent.cart;
        var subtotal = 0;
        for (var s = 0; s < cart.length; s++) {

            var priceOfItem = cart[s].product.cadPrice;
            if ($scope.userCountry === 'US') {
                priceOfItem = cart[s].product.usPrice;
            }

            subtotal += (cart[s].quantity * priceOfItem);
        }

        $scope.subtotal = subtotal;

        $scope.updateCartCookie();

        return (subtotal / 100).toFixed(2);
    };

    $scope.billing = {
        address: {},
        source: {}
    };

    $scope.shipping = {
        address: {}
    };

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

    if ($scope.userCountry === 'US') {
        $scope.activeProvinceSelect = $scope.formProvinces.us;
        $scope.billing.address.country = 'US';
    }
    else {
        $scope.activeProvinceSelect = $scope.formProvinces.canada;
        $scope.billing.address.country = 'CA';
    }

    // Populate the expiry years for the form
    var currentYear = new Date().getFullYear();
    var expiryYears = [];
    for (var i = 0; i < 26; i++) {
        expiryYears.push(currentYear + i);
    }
    $scope.ccExpYear = expiryYears;

    $scope.$watch('billing.address.country', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            if (newVal === 'US') {
                $scope.activeProvinceSelect = $scope.formProvinces.us;
            }
            else {
                $scope.activeProvinceSelect = $scope.formProvinces.canada;
            }
        }
    });

    $scope.$watch('shipping.address.country', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            if (newVal === 'US') {
                $scope.activeShippingProvinceSelect = $scope.formProvinces.us;
            }
            else {
                $scope.activeShippingProvinceSelect = $scope.formProvinces.canada;
            }
        }
    });

    $scope.placeOrder = function() {

        $scope.processingOrder = true;

        // Validate billing and shipping address if applies
        var resultBilling = {
            valid: true
        };
        var resultShipping = {
            valid: true
        };
        // Validate billing if not logged in
        if (!$scope.fullyLoggedIn) {
            validateAddress($scope.billing);
        }
        if ($scope.newAltShipping) {
            resultShipping = validateAddress($scope.shipping);
        }

        if (resultBilling.valid && resultShipping.valid) {

            validateAccount(function(result) {
                if (result) {

                    var chargeMetadata = stringifyCartMetadata($scope.$parent.cart);

                    // Case where customer is not yet registered on St or locally
                    if ( (!$scope.$parent.user) || (!$scope.$parent.user.stId) ) {

                        createNewCustomer(function(updatedUser) {
                            if (updatedUser) {

                                $scope.$parent.user = updatedUser;

                                chargeCustomer(chargeMetadata, function(charge) {
                                    if (!charge) {
                                        $scope.validationErrors.source.number = 'There was an issue processing your payment. Please try again or contact our support team';
                                    }
                                });
                            }
                        });
                    }

                    // Customer already logged in
                    else {
                        chargeCustomer(chargeMetadata, function(charge) {
                            if (!charge) {
                                $scope.validationErrors.source.number = 'There was an issue processing your payment. Please try again or contact our support team';
                            }
                        });
                    }
                }
                else {

                }
            });
        }
        else {
            $scope.validationErrors = resultBilling.errors;
            $scope.validationErrors.shipping = resultShipping.errors;
        }

    };

    /**
     * Create charge payload.
     * Determine if an alternate shipping address is required.
     *
     * If required:
     *  - Create a new alternate shipping address and add it to the customer
     *  - Use alternate shipping address that the user has pre-selected
     *
     * Not reuqired:
     *  - Use billing address for shipping (null for altShipping param)
     *
     *
     * @param chargeMetadata
     * @param callback
     */
    function chargeCustomer (chargeMetadata, callback) {
        var payload = {
            cart: [],
            metadata: chargeMetadata
        };

        var detailedCart = $scope.$parent.cart;
        for (var i = 0; i < detailedCart.length; i++) {
            payload.cart.push({
                id: detailedCart[i].product.id,
                quantity: detailedCart[i].quantity
            });
        }

        // Alternate shipping address which the user has not yet used before
        if ($scope.newAltShipping) {

            // Create new altShippingAddress for customer
            appService.altShippingAddress.save($scope.shipping, function(newAltAddr) {
                $scope.$parent.altShippingAddresses.push(newAltAddr);
                $scope.selectedAltShippingAddr = newAltAddr;

                payload.altShipping = newAltAddr;

                // Create charge
                appService.charge.save(payload, function(charge) {
                    return callback(charge);
                }, function(err) {
                    return callback(false);
                });

            }, function(err) {
                return callback(false);
            });
        }

        // Use one of the pre-saved addresses
        else {

            // Use pre-selected saved alternate address
            if ($scope.selectedAltShippingAddr) {
                payload.altShipping = $scope.selectedAltShippingAddr;
            }

            // Create charge
            appService.charge.save(payload, function(charge) {
                return callback(charge);
            }, function(err) {
                return callback(false);
            });
        }

    }

    /**
     * Creates customer related items
     * 1) No user objs created
     * 2) Local login user created, but no stripe or customer obj
     * 3) All already created (return user)
     * @param callback
     */
    function createNewCustomer (callback) {

        validateUserPayment(function(result) {
            if (result) {

                if (!$scope.$parent.user) {
                    registerCustomerLocally(function (localUser) {
                        if (localUser) {
                            $scope.$parent.user = localUser;

                            createStCustomer(function (updatedUser) {
                                if (!updatedUser) {
                                    return callback(false);
                                }
                                else {
                                    return callback(updatedUser);
                                }
                            });
                        }
                    });
                }
                else if (!$scope.$parent.user.stId) {
                    createStCustomer(function (updatedUser) {
                        return callback(updatedUser);
                    });
                }
                else {
                    return callback($scope.$parent.user);
                }
            }
        });

    }

    function registerCustomerLocally (callback) {

        // Create Customer Account Locally
        $http({
            url: '/signup',
            method: 'POST',
            data: {
                email: $scope.billing.email,
                password: 'a'
            }
        }).success(function(newUser) {
            return callback(newUser);

        }).error(function(error) {
            $scope.validationErrors.email = 'Email already in use';
            return callback(false);
        });
    }

    function createStCustomer (callback) {
        $http({
            url: '/api/customer',
            method: 'POST',
            data: {
                billing: {
                    name: $scope.billing.name,
                    address: $scope.billing.address
                },
                source: $scope.billing.token
            }
        }).success(function(user) {
            return callback(user);
        }).error(function(err) {
            handleStCCErr(err);
            return callback(false);
        });
    }

    // Validate new account creation
    function validateAccount(callback) {

        if ( ($scope.$parent.user) && ($scope.$parent.user.email) && ($scope.$parent.user.email === $scope.billing.email) ) {
            return callback(true);
        }

        // Reset validation objects
        var validationFailed = false;
        var validateEmailFailed = false;
        $scope.validationErrors = {};

        // Email format
        var emailRegex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

        // Check if email is valid
        if (!$scope.billing.email) {
            $scope.validationErrors.email = 'Please enter your email';
            validationFailed = true;
            validateEmailFailed = true;
        }
        else if ( $scope.billing.email.length > 254 ) {
            $scope.validationErrors.email = 'Email is invalid because it is too long';
            validationFailed = true;
            validateEmailFailed = true;
        }
        else if ( !emailRegex.test($scope.billing.email) ) {
            $scope.validationErrors.email = 'Please enter a valid email';
            validationFailed = true;
            validateEmailFailed = true;
        }

        // Check if email exists
        if (!validateEmailFailed) {
            $http({
                url: '/api/emailexists',
                method: 'GET',
                params: {
                    email: $scope.billing.email
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
    }

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
            }
            else if (addressInfo.address.postal_code.length > 5) {
                validationErrors.address.postal_code = 'Zip code is invalid (more than 5 digits). Please enter in the form of: 10001';
            }
        }
        else if (addressInfo.address.country === 'CA') {

            // Strip spaces
            addressInfo.address.postal_code = addressInfo.address.postal_code.replace(/\s+/g, '');

            if (!canadianPostalRegex.test(addressInfo.address.postal_code)) {
                validationErrors.address.postal_code = 'Postal code is invalid. Please enter in the form of: A1B 2C3';
            }
            else if (addressInfo.address.postal_code.length > 6) {
                validationErrors.address.postal_code = 'Postal code is invalid (more than 6 characters). Please enter in the form of: A1B 2C3';
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
        //var creditCardRegex = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/;
        var creditCardRegex = /^\d{12,19}$/;
        var cvvRegex = /^[0-9]{3,6}$/;

        // Basic Card Number Validation
        if (!$scope.billing.source.number) {
            $scope.validationErrors.source.number = 'Please enter your credit card number';
            validationFailed = true;
        }
        else if ( !numSpaceDashRegex.test($scope.billing.source.number) ) {
            $scope.validationErrors.source.number = 'Please enter a valid number. You can use dashes or spaces to separate blocks of numbers if you choose';
            validationFailed = true;
        }
        else if ( !creditCardRegex.test($scope.billing.source.number.replace(/\D/g,'')) ) {
            $scope.validationErrors.source.number = 'Please enter a valid number. You can use dashes or spaces to separate blocks of numbers if you choose';
            validationFailed = true;
        }

        // Expiry Validation
        if (!$scope.billing.source.exp_month) {
            $scope.validationErrors.source.exp_month = 'Please select an expiration month';
            validationFailed = true;
        }

        if (!$scope.billing.source.exp_year) {
            $scope.validationErrors.source.exp_year = 'Please select an expiration year';
            validationFailed = true;
        }

        // CVV validation
        if (!$scope.billing.source.cvc) {
            $scope.validationErrors.source.cvc = 'Please enter the verification number on the back of your card';
            validationFailed = true;
        }
        else if ( (!cvvRegex.test($scope.billing.source.cvc.toString())) ) {
            $scope.validationErrors.source.cvc = 'Please enter a valid verification number';
            validationFailed = true;
        }

        // Attempt to generate token
        if (!validationFailed) {
            $http({
                url: '/api/token',
                method: 'POST',
                data: $scope.billing.source
            }).success(function(token) {
                $scope.billing.token = token.id;
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
}


/* ----------------- UTILS -------------------- */

function findProductInList(list, productId) {
    for (var i = 0; i < list.length; i++) {
        if (list[i].id === productId) {
            return list[i];
        }
    }

    return null;
}

function findProductInCart(cart, productId) {
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].product.id === productId) {
            return cart[i];
        }
    }

    return null;
}

function generateListOfProductImgLinks(basePath, productId, numImgs) {

    var imageLinks = [];

    for (var j = 1; j <= numImgs; j++) {
        imageLinks.push(basePath + '/' + productId + '-' + j + '.png');
    }

    return imageLinks;
}

// Create charge details metadata (safety net to verify customer order)
function stringifyCartMetadata(cart) {
    var cartMeta = [];
    for (var i = 0; i < cart.length; i++) {
        cartMeta.push({
            id: cart[i].product.id,
            q: cart[i].quantity
        });
    }

    var cartMetaStr = JSON.stringify(cartMeta);
    var chargeMeta = null;

    switch ( Math.ceil(cartMetaStr.length / 500) ) {
        case (1):
            chargeMeta = {
                cartItems1: cartMetaStr
            };
            break;
        case (2) :
            chargeMeta = {
                cartItems1: cartMetaStr.substring(0, 500),
                cartItems2: cartMetaStr.substring(500, 1000)
            };
            break;
        case (3):
            chargeMeta = {
                cartItems1: cartMetaStr.substring(0, 500),
                cartItems2: cartMetaStr.substring(500, 1000),
                cartItems3: cartMetaStr.substring(1000, 1500)
            };
            break;
        case (4):
            chargeMeta = {
                cartItems1: cartMetaStr.substring(0, 500),
                cartItems2: cartMetaStr.substring(500, 1000),
                cartItems3: cartMetaStr.substring(1000, 1500),
                cartItems4: cartMetaStr.substring(1500, 2000)
            };
            break;
        case (5):
            chargeMeta = {
                cartItems1: cartMetaStr.substring(0, 500),
                cartItems2: cartMetaStr.substring(500, 1000),
                cartItems3: cartMetaStr.substring(1000, 1500),
                cartItems4: cartMetaStr.substring(1500, 2000),
                cartItems5: cartMetaStr.substring(2000, 2500)
            };
            break;
        case (6):
            chargeMeta = {
                cartItems1: cartMetaStr.substring(0, 500),
                cartItems2: cartMetaStr.substring(500, 1000),
                cartItems3: cartMetaStr.substring(1000, 1500),
                cartItems4: cartMetaStr.substring(1500, 2000),
                cartItems5: cartMetaStr.substring(2000, 2500),
                cartItems6: cartMetaStr.substring(2500, 3000)
            };
            break;
        case (7):
            chargeMeta = {
                cartItems1: cartMetaStr.substring(0, 500),
                cartItems2: cartMetaStr.substring(500, 1000),
                cartItems3: cartMetaStr.substring(1000, 1500),
                cartItems4: cartMetaStr.substring(1500, 2000),
                cartItems5: cartMetaStr.substring(2000, 2500),
                cartItems6: cartMetaStr.substring(2500, 3000),
                cartItems7: cartMetaStr.substring(3000, 3500)
            };
            break;
        default:
            chargeMeta = {
                cartItems1: cartMetaStr.substring(0, 500),
                cartItems2: cartMetaStr.substring(500, 1000),
                cartItems3: cartMetaStr.substring(1000, 1500),
                cartItems4: cartMetaStr.substring(1500, 2000),
                cartItems5: cartMetaStr.substring(2000, 2500),
                cartItems6: cartMetaStr.substring(2500, 3000),
                cartItems7: cartMetaStr.substring(3000, 3500),
                cartItems8: cartMetaStr.substring(3500, 4000)
            };
            break;
    }

    return chargeMeta;
}

angular
    .module('storeapp')
    .controller('mainCtrl', mainCtrl)
    .controller('storeCtrl', storeCtrl)
    .controller('productCtrl', productCtrl)
    .controller('cartCtrl', cartCtrl)
    .controller('checkoutCtrl', checkoutCtrl);