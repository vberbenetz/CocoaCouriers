'use strict';

function mainCtrl($scope, appService, stService) {

    $scope.account = {
        email: '',
        stId: ''
    };
    $scope.customer = {};

    // --------------------------------------
    // Retrieve user account details
    appService.user.get(function (data) {
        $scope.account.email = data.email;
        $scope.account.stId = data.stId;

        // -----------------------------------------
        // Retrieve Stripe customer info
        stService.customer.get(function (data) {
            $scope.customer = data;
        }, function (error) {
        });

    }, function (error) {
    });

}

function membershipCtrl($scope, appService, stService) {

    $scope.formData = {};

    $scope.changeEmail = function() {

        $scope.validationErrors = {};

        var emailRegex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        var validationFailed = false;

        // Check if email is valid
        if (typeof $scope.formData.email === 'undefined') {
            $scope.validationErrors.newEmail = 'Please enter your email';
            validationFailed = true;
        }
        else if ( ($scope.formData.email.length == 0) || ($scope.formData.email === '') ) {
            $scope.validationErrors.newEmail = 'Please enter your email';
            validationFailed = true;
        }
        else if ( $scope.formData.email.length > 254 ) {
            $scope.validationErrors.newEmail = 'Email is invalid because it is too long';
            validationFailed = true;
        }
        else if ( !emailRegex.test($scope.formData.email) ) {
            $scope.validationErrors.newEmail = 'Please enter a valid email';
            validationFailed = true;
        }

        if (!validationFailed) {
            var payload = {
                newEmail: $scope.formData.email,
                currentPassword: $scope.formData.currentPassword
            };

            appService.user.updateEmail(payload, function(data) {
                // Reset vars
                $scope.validationErrors = {};
                $scope.formData.email = '';
                $scope.formData.currentPassword = '';

                $scope.account.email = data.email;

            }, function(err) {
                if (err.data === 'email_exists') {
                    $scope.validationErrors.newEmail = 'This email is already in use';
                }
                else if (err.data === 'incorrect_password') {
                    $scope.validationErrors.password = 'Your password is incorrect';
                }
                else {
                    $scope.validationErrors.newEmail = 'Something went wrong with changing your email. Please try again';
                    $scope.validationErrors.password = ' ';
                }
            });
        }
    }


}

angular
    .module('account')
    .controller('mainCtrl', mainCtrl)
    .controller('membershipCtrl', membershipCtrl);