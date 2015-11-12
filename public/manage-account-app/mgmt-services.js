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
                        item: 'password'
                    },
                    isArray: false
                }
            }
        )
    }
}

function stService($resource) {
    return {
        customer: $resource('/api/customer')
    }
}

angular
    .module('account')
    .factory('appService', appService)
    .factory('stService', stService);