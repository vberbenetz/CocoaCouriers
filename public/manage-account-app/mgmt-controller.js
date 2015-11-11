'use strict';

function mgmtCtrl($scope, $http, $window) {

    $scope.account = {
        email: '',
        stripeId: ''
    };

    // Retrieve user account details
    $http({
        url: '/user-info',
        method: 'GET'
    }).success(function(result) {
        $scope.account.email = result.email;
        $scope.account.stripeId = result.stripeId;
    }).error(function(err) {
    });


};

angular
    .module('mgmt')
    .controller('mgmtCtrl', mgmtCtrl);