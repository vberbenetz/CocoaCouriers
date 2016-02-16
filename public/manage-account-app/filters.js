'use strict';

function capitalizeFirst () {
    return function(input) {
        return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
}

function formatPostalCode () {
    return function(input) {
        if (input) {
            if (/[a-z]/i.test(input)) {
                var retStr = input.toUpperCase();
                retStr = retStr.replace(/ /g, '');
                return (retStr.slice(0, -3) + ' ' + retStr.slice(3));
            }
            else {
                return input;
            }
        }
        else {
            return '';
        }
    }
}

angular
    .module('account')
    .filter('capitalizeFirst', capitalizeFirst)
    .filter('formatPostalCode', formatPostalCode);