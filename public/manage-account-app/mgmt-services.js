'use strict';

function appService($resource) {
    return {
        stPubKey: $resource('/api/st-pk'),

        user: $resource('/api/user',
            {},
            {
                updatePassword: {
                    method: 'PUT',
                    params: {
                        item: 'pass'
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

        subscription: $resource('/api/subscription'),

        logout: $resource('/logout')
    }
}


angular
    .module('account')
    .factory('appService', appService);