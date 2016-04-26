var request = require('supertest');
var assert = require('chai').assert;

describe('Authentication Test', function(){
    it('should not be logged in', function(done){
        request('https://localhost')
            .get('/isloggedin')
            .set('Accept', 'application/json')
            .end(function (err, res) {
                if (err) {
                    //throw err;
                }
                assert.equal(res.body, true);
                done();
            });
    });
});