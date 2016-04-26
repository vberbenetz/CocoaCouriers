var helpers = require('../app/utils/helpers');
var expect = require('chai').expect;

before(function(){
    require('../cocoacouriers_server');
});

describe('Cooldown period test', function(){
    it('should return false if within period, or true if not', function() {
        var iscooldownmanual = false;
        expect(helpers.isCoolDownPeriod()).to.equal(iscooldownmanual);
    })
});