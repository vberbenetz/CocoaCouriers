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
            url: '/item/:productUrl'
        })
        .state('cart', {
            templateUrl: '../store-app/views/cart.html',
            controller: cartCtrl,
            url: '/cart'
        })
        .state('checkout', {
            templateUrl: '../store-app/views/checkout.html',
            controller: checkoutCtrl,
            url: '/checkout'
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