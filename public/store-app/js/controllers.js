'use strict';

function mainCtrl ($scope, $rootScope, $state, appService) {

    $scope.basePath = '/assets/product_imgs';
}

function storeCtrl ($scope, $rootScope, $state, appService) {

    if (typeof $scope.$parent.products === 'undefined') {
        appService.productList.query(function(products) {
            $scope.$parent.products = products;
        }, function(err) {
        });
    }

    $scope.goToProduct = function (product) {
        $rootScope.activeProduct = product;
        $state.go('product', {productId: product.id});
    }
}

function productCtrl ($scope, $rootScope, $state, $stateParams, appService) {

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

function findProductInList(list, productId) {
    for (var i = 0; i < list.length; i++) {
        if (list[i].id === productId) {
            return list[i];
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
    .controller('productCtrl', productCtrl);