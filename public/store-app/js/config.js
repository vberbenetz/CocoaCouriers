'use strict';

function config($stateProvider, $locationProvider, $httpProvider, $urlRouterProvider, $provide) {
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
            url: '/item/:urlSubPath'
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
        })
        .state('orderFilled', {
            templateUrl: '../store-app/views/post_checkout.html',
            controller: postCheckoutCtrl,
            url: '/order-filled'
        });

    $locationProvider.html5Mode(true);

    // Scroll to top on view change
    $provide.decorator('$uiViewScroll', function($delegate) {
        return function(uiViewElement) {
            var top = uiViewElement.getBoundingClientRect().top;
            window.scrollTo(0, (top-60));
        }
    });

}
angular
    .module('storeapp')
    .config(config)
    .run(function($rootScope, $document, $state) {
        $rootScope.$on('$stateChangeStart', function(evt, to, params) {
            if (to.redirectTo) {
                evt.preventDefault();
                $state.go(to.redirectTo, params);
            }
        });
    });