'use strict';

function mainCtrl ($scope, $rootScope, $state, appService) {
    appService.productList.query(function(products) {
        $scope.products = products;
    }, function(err) {

    });
}

function storeCtrl ($scope, $rootScope, $state, appService) {

    $scope.goToProduct = function (product) {
        $rootScope.activeProduct = product;
        $state.go('product', {productUrl: product.urlName, id: product.id});
    }
}

function productCtrl ($scope, $rootScope, $state, $stateParams, appService) {
    if (typeof $scope.$parent.products === 'undefined') {
        $state.go('home');
    }
    else {
        $scope.uncloak = true;
    }

    $scope.productId = $stateParams.id;

    $scope.product = findProductInList($scope.$parent.products, $scope.productId);

    if ($scope.product === null) {
        appService.product.get(function(product) {
            $scope.product = product;
        })
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

angular
    .module('storeapp')
    .controller('mainCtrl', mainCtrl)
    .controller('storeCtrl', storeCtrl)
    .controller('productCtrl', productCtrl);