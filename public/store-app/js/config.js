'use strict';

function config($stateProvider, $locationProvider, $httpProvider, $urlRouterProvider) {
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

    $urlRouterProvider.otherwise("/");

    $stateProvider

        .state('home', {
            templateUrl: '../store-app/views/shop_home.html',
            controller: storeCtrl,
            url: "/"
        })
        .state('product', {
            templateUrl: '../store-app/views/product.html',
            controller: productCtrl,
            url: '/:productUrl',
            params: {
                productUrl: null,
                id: null
            }
        });

    $locationProvider.html5Mode(true);

}
angular
    .module('storeapp')
    .config(config)
    .run(function($rootScope, $state) {
        $rootScope.$on('$stateChangeStart', function(evt, to, params) {
            if (to.redirectTo) {
                evt.preventDefault();
                $state.go(to.redirectTo, params);
            }
        });
        //$rootScope.state = $state;
    });