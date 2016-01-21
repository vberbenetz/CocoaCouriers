'use strict';

function appService($resource) {
    return {
        product: $resource('/api/product',
            {},
            {
                get: {
                    method: 'GET',
                    params: {
                        productId: '@productId'
                    },
                    isArray: false
                }
            }
        ),

        productList: $resource('/api/product/list'),

        productListByType: $resource('/api/product/list/byType',
            {},
            {
                query: {
                    method: 'GET',
                    params: {
                        productTypeId: '@productTypeId'
                    },
                    isArray: true
                }
            }
        )

    }
}

angular
    .module('storeapp')
    .factory('appService', appService);
