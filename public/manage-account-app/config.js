'use strict';

function config($routeProvider, $locationProvider, stripeProvider) {

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

        .when('/update-billing', {
            controller: 'updateBillingCtrl',
            templateUrl: '/manage-account-app/views/update_billing.html'
        })
        .when('/update-subscription-shipping', {
            controller: 'updateSubShippingCtrl',
            templateUrl: '/manage-account-app/views/update_shipping.html'
        })

        .when('/billing-details', {
            controller: 'billingHistoryCtrl',
            templateUrl: '/manage-account-app/views/billing_details.html'
        })
        .when('/update-plan', {
            controller: 'updatePlanCtrl',
            templateUrl: '/manage-account-app/views/update_subscription.html'
        });

    $locationProvider.html5Mode(true);

}
angular
    .module('account')
    .config(config)
    .run(function() {
    });
