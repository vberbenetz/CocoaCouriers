'use strict';

function appService($resource) {
    return {
        user: $resource('/api/user',
            {},
            {
                updateEmail: {
                    method: 'PUT',
                    params: {
                        item: 'email'
                    },
                    isArray: false
                },
                updatePassword: {
                    method: 'PUT',
                    params: {
                        item: 'pass'
                    },
                    isArray: false
                }
            }
        ),

        logout: $resource('/logout')
    }
}

function stService($resource) {
    return {
        customer: $resource('/api/customer',
            {},
            {
                update: {
                    method: 'PUT',
                    params: {},
                    isArray: false
                }
            }
        ),

        subscription: $resource('/api/subscription'),

        token: $resource('/api/token'),

        plan: $resource('/api/plan')
    }
}

angular
    .module('account')
    .factory('appService', appService)
    .factory('stService', stService);