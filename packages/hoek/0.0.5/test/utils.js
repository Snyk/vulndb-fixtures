var assert = require('assert');
var should = require("should");
var sinon = require("sinon");
var hoek = require("../lib/hoek");

describe("hoek", function(){
  var emptyObj = {};
  var nestedObj = {
    x: 'x',
    y: 'y'
  }
  var dupsArray = [nestedObj, {z:'z'}, nestedObj];
  var reducedDupsArray = [nestedObj, {z:'z'}];
  
  describe("#clone", function(){
    it("should clone a nested object", function(done){
      var a = nestedObj;
      var b = hoek.clone(a);
      
      assert.deepEqual(a, b);
      done();
    })
  })
  
  describe("#merge", function(){
    it("should", function(done){
      var a = emptyObj;
      var b = nestedObj;
      
      var c = hoek.merge(a, b);
      assert.deepEqual(a, b);
      assert.deepEqual(c, b);
      done();
    })
  })
  
  describe("#unique", function(){
    it("should ensure uniqueness within array of objects based on subkey", function(done){
      var a = hoek.unique(dupsArray, 'x');
      assert.deepEqual(a, reducedDupsArray);
      done();
    })
  })
  
  describe("#mapToObject", function () {
    it("should convert basic array to existential object", function(done){
      var keys = [1,2,3,4];
      var a = hoek.mapToObject(keys);
      for(var i in keys){
        a[keys[i]].should.equal(true);
      }
      done();
    })
    
    it("should convert array of objects to existential object", function(done){
      var keys = [{x:1}, {x:2}, {x:3}];
      var subkey = 'x';
      var a = hoek.mapToObject(keys, subkey);
      for(var i in keys){
        a[keys[i][subkey]].should.equal(true);
      }
      done();
    })
  })

  describe("#removeKeys", function(){
    var objWithHiddenKeys = {
      location: {
        name: 'San Bruno'
      },
      company: {
        name: "@WalmartLabs"
      }
    }
    
    it("should delete params with definition's hide set to true", function(done){
      var a = hoek.removeKeys(objWithHiddenKeys, ['location']);
      should.not.exist(objWithHiddenKeys.location);
      should.exist(objWithHiddenKeys.company);
      done();
    })
  })
})