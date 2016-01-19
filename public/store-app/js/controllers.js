'use strict';

function storeCtrl ($scope, $rootScope, $state) {
}

function productCtrl ($scope, $rootScope, $state, $stateParams) {
    $scope.productId = $stateParams.productId;
}

angular
    .module('storeapp')
    .controller('storeCtrl', storeCtrl)
    .controller('productCtrl', productCtrl);