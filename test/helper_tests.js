"use strict";

var helpers = require('../app/utils/helpers');
var expect = require('chai').expect;

describe('Cooldown period test', function(){
    it('should return false if within period, or true if not', function() {
        var iscooldownmanual = true;
        expect(helpers.isCoolDownPeriod()).to.equal(iscooldownmanual);
    })
});

describe('Vacation period test', function() {
   it('should return false if within period, or true if not', function() {
       var isVacationManual = true;
       expect(helpers.isVacationPeriod()).to.equal(isVacationManual);
   })
});