'use strict';

function mainCtrl ($scope, $cookies, appService) {

    $scope.basePath = '/assets/media';

    $scope.userRegion = 'CA';

    $scope.cart = [];

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

function productCtrl ($scope, $state, $stateParams, $cookies, appService) {

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

    $scope.userRegion = $scope.$parent.userRegion;

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
            if ($scope.userRegion === 'US') {
                priceOfItem = cart[s].product.usPrice;
            }

            subtotal += parseFloat( (Math.round(cart[s].quantity * priceOfItem *100) / 100).toFixed(2) );
        }

        $scope.subtotal = Math.round(subtotal*100)/100;

        $scope.updateCartCookie();

        return subtotal.toFixed(2);
    };

    $scope.applyDiscount = function() {

    };

}

function checkoutCtrl ($scope) {

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

angular
    .module('storeapp')
    .controller('mainCtrl', mainCtrl)
    .controller('storeCtrl', storeCtrl)
    .controller('productCtrl', productCtrl)
    .controller('cartCtrl', cartCtrl)
    .controller('checkoutCtrl', checkoutCtrl);