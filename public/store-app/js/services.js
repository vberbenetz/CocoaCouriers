'use strict';

function appService($resource) {
    return {
        stPubKey: $resource('/api/st-pk'),

        user: $resource('/api/user'),

        productOrigins: $resource('/api/product/origin/list'),

        productProfileList: $resource('/api/profiles/list'),

        manufacturer: $resource('/api/manufacturer'),

        manufacturerOrigins: $resource('/api/manufacturer/origin/list'),

        taxInfo: $resource('/api/tax-info',
            {},
            {
                get: {
                    method: 'GET',
                    params: {
                        province: '@province'
                    },
                    isArray: false
                }
            }
        ),

        shippingCost: $resource('/api/shipping-cost',
            {},
            {
                get: {
                    method: 'GET',
                    params: {
                        province: '@province',
                        country: '@country',
                        amount: '@amount'
                    },
                    isArray: false
                }
            }
        ),

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
                },
                getByUrlSubPath: {
                    method: 'GET',
                    params: {
                        urlSubPath: '@urlSubPath'
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

        productListFilter: $resource('/api/product/filter',
            {},
            {
                query: {
                    method: 'GET',
                    params: {
                        mid: '@mid',
                        mo: '@mo',
                        co: '@co',
                        pt: '@pt',
                        fp: '@fp',
                        dp: '@dp'
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

        productProfiles: $resource('/api/product/profiles',
            {},
            {
                query: {
                    method: 'GET',
                    params: {
                        productId: '@productId'
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
