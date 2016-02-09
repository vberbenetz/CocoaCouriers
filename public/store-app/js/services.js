'use strict';

function appService($resource) {
    return {
        user: $resource('/api/user'),

        customer: $resource('/api/customer',
            {},
            {
                update: {
                    method: 'PUT',
                    isArray: false
                }
            }
        ),

        source: $resource('/api/customer/source',
            {},
            {
                getSourceById: {
                    method: 'GET',
                    params: {
                        sourceId: '@sourceId'
                    },
                    isArray: false
                }
            }
        ),

        altShippingAddress: $resource('/api/customer/altShippingAddr'),

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

        productList: $resource('/api/product/list',
            {},
            {
                queryByIds: {
                    method: 'GET',
                    params: {
                        productIds: '@productIds'
                    },
                    isArray: true
                }
            }
        ),

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
        ),

        charge: $resource('/api/charge')
    }
}

angular
    .module('storeapp')
    .factory('appService', appService);
