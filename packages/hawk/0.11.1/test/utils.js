// Load modules

var Lab = require('lab');
var Hawk = require('../lib');
var Package = require('../package.json');


// Declare internals

var internals = {};


// Test shortcuts

var expect = Lab.expect;
var before = Lab.before;
var after = Lab.after;
var describe = Lab.experiment;
var it = Lab.test;


describe('Hawk', function () {

    describe('Utils', function () {

        describe('#parseHost', function () {

            it('returns port 80 for non tls node request', function (done) {

                var req = {
                    method: 'POST',
                    url: '/resource/4?filter=a',
                    headers: {
                        host: 'example.com',
                        'content-type': 'text/plain;x=y'
                    }
                };

                expect(Hawk.utils.parseHost(req, 'Host').port).to.equal(80);
                done();
            });

            it('returns port 443 for non tls node request', function (done) {

                var req = {
                    method: 'POST',
                    url: '/resource/4?filter=a',
                    headers: {
                        host: 'example.com',
                        'content-type': 'text/plain;x=y'
                    },
                    connection: {
                        encrypted: true
                    }
                };

                expect(Hawk.utils.parseHost(req, 'Host').port).to.equal(443);
                done();
            });
        });

        describe('#version', function () {

            it('returns the correct package version number', function (done) {

                expect(Hawk.utils.version()).to.equal(Package.version);
                done();
            });
        });
    });
});


