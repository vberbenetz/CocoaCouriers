'use strict';

function config($routeProvider, $locationProvider) {

    $routeProvider

        .when('/', {
            templateUrl: '/manage-account-app/views/main.html'
        })

        .when('/change-email', {
            controller: 'membershipCtrl',
            templateUrl: '/manage-account-app/views/change_email.html'
        })

        .when('/change-password', {
            controller: 'membershipCtrl',
            templateUrl: '/manage-account-app/views/change_password.html'
        })

        .when('/email-preferences', {
            controller: 'contactCtrl',
            templateUrl: '/manage-account-app/views/email_preferences.html'
        })

        .when('/change-plan', {
            controller: 'updatePlanCtrl',
            templateUrl: '/manage-account-app/views/change_plan.html'
        })

        .when('/update-payment', {
            controller: 'updatePaymentCtrl',
            templateUrl: '/manage-account-app/views/update_payment.html'
        })

        .when('/billing-details', {
            controller: 'billingHistoryCtrl',
            templateUrl: '/manage-account-app/views/billing_details.html'
        });

    $locationProvider.html5Mode(true);

}
angular
    .module('account')
    .config(config)
    .run(function() {
    });
