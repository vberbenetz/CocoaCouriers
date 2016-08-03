'use strict';

function config($stateProvider, $locationProvider, $httpProvider, $urlRouterProvider, $cookiesProvider, $windowProvider) {
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

    $urlRouterProvider.otherwise("/");

    var $window = $windowProvider.$get();

    $stateProvider

        .state('home', {
            templateUrl: '../store-app/views/shop_home.html',
            controller: storeCtrl,
            url: "/",
            onEnter: function(){
                $window._fbq.push(['track', 'PixelInitialized', {}]);
                $window._fbq.push(['track', 'PageView', {}]);
                $window._fbq.push(['track', 'Search', {}]);
            }
        })
        .state('subscribe', {
            templateUrl: '../store-app/views/subscription.html',
            controller: subscriptionCtrl,
            url: "/subscribe",
            onEnter: function(){
                $window._fbq.push(['track', 'PixelInitialized', {}]);
                $window._fbq.push(['track', 'PageView', {}]);
                $window._fbq.push(['track', 'Search', {}]);
            }
        })
        .state('product', {
            templateUrl: '../store-app/views/product.html',
            controller: productCtrl,
            url: '/item/:urlSubPath',
            onEnter: function($stateParams){
                $window._fbq.push(['track', 'PixelInitialized', {}]);
                $window._fbq.push(['track', 'PageView', {}]);
                $window._fbq.push(['track', 'Lead', {content_name: $stateParams.urlSubPath}]);
            }
        })
        .state('cart', {
            templateUrl: '../store-app/views/cart.html',
            controller: cartCtrl,
            url: '/cart',
            onEnter: function(){
                $window._fbq.push(['track', 'PixelInitialized', {}]);
                $window._fbq.push(['track', 'PageView', {}]);
            }
        })
        .state('checkout', {
            templateUrl: '../store-app/views/checkout.html',
            controller: checkoutCtrl,
            url: '/checkout',
            onEnter: function(){
                $window._fbq.push(['track', 'PixelInitialized', {}]);
                $window._fbq.push(['track', 'PageView', {}]);
                $window._fbq.push(['track', 'InitiateCheckout', {}]);
            }
        })
        .state('summer-vacation', {
            templateUrl: '../store-app/views/vacation_template.html',
            controller: summerVacationCtrl,
            url: '/vacation'
        })
        .state('orderFilled', {
            templateUrl: '../store-app/views/post_checkout.html',
            controller: postCheckoutCtrl,
            url: '/order-filled',
            params: {
                recentSub: null
            }
        });

    $locationProvider.html5Mode(true);

    $cookiesProvider.defaults.path = '/';
    $cookiesProvider.defaults.secure = true;

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
        $rootScope.$on('$stateChangeSuccess', function() {

            // Scroll to top of page on state change
            $document[0].documentElement.scrollTop = 0;
            document.body.scrollTop = document.documentElement.scrollTop = 0;
        });
    });