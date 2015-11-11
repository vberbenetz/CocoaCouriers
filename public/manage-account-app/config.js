'use strict';

function config($stateProvider, $locationProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");

    $stateProvider

        .state('main', {
            url: '/',
            templateUrl: 'views/main.html'
        })

        .state('change-email', {
            url: '/change-email',
            templateUrl: 'views/change_email.html'
        })

        .state('change-password', {
            url: '/change-password',
            templateUrl: 'views/change_password.html'
        })

        .state('email-preferences', {
            url: '/email-preferences',
            templateUrl: 'views/email_preferences.html'
        })

        .state('change-plan', {
            url: '/change-plan',
            templateUrl: 'views/change_plan.html'
        })

        .state('update-payment', {
            url: '/update-payment',
            templateUrl: 'views/update_payment.html'
        })

        .state('billing-details', {
            url: '/billing-details',
            templateUrl: 'views/billing_details.html'
        });

    $locationProvider.html5Mode(true);

}
angular
    .module('mgmt')
    .config(config)
    .run(function($rootScope, $state) {
        $rootScope.$state = $state;
    });
