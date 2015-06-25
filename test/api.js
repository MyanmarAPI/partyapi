var assert = require('chai').assert;
var request = require('supertest');
var app = require('../app');

describe('GET /data', function() {
  it('should return a party and complete flag URL', function(done) {
    request(app)
      .get('/party')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }
        assert.include(res.text, 'National Unity Party');
        assert.include(res.text, '/images/political/2-flag');
        done();
      });
  });

  it('should return all 76 parties', function(done) {
    request(app)
      .get('/party')
      .end(function(err, res) {
        if (err) {
          return done(err);
        }
        var parties = JSON.parse(res.text);
        assert.equal(parties.length, 76);
        done();
      });
  });

  it('should return Unicode by default', function(done) {
    request(app)
      .get('/party')
      .end(function(err, res) {
        if (err) {
          return done(err);
        }
        assert.include(res.text, "တိုင်းရင်းသားစည်းလုံးညီညွတ်ရေးပါတီ");
        assert.notInclude(res.text, "တိုင္းရင္းသားစည္းလုံးညီညြတ္ေရးပါတီ");
        done();
      });
  });

  it('should return Zawgyi on request', function(done) {
    request(app)
      .get('/party?font=zawgyi')
      .end(function(err, res) {
        if (err) {
          return done(err);
        }
        assert.notInclude(res.text, "တိုင်းရင်းသားစည်းလုံးညီညွတ်ရေးပါတီ");
        assert.include(res.text, "တိုင္းရင္းသားစည္းလုံးညီညြတ္ေရးပါတီ");
        done();
      });
  });
});
