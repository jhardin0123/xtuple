/*jshint trailing:true, white:true, indent:2, strict:true, curly:true,
  immed:true, eqeqeq:true, forin:true, latedef:true,
  newcap:true, noarg:true, undef:true */
/*global describe:true, it:true, XT:true, XM:true, XV:true,
  process:true, module:true, require:true, beforeEach: true */

(function () {
  "use strict";

  var zombieAuth = require("../lib/zombie_auth"),
    _ = require("underscore"),
    assert = require("chai").assert;

  describe('Model integrity', function () {
    this.timeout(20 * 1000);
    it('should log in first', function (done) {
      zombieAuth.loadApp(done);
    });

    it('should contain its idAttribute', function () {
      _.each(XM, function (Klass, key) {
        var model;
        if (typeof Klass === 'function') {
          if (!Klass.prototype.recordType) {
            // guard against exceptions
            return;
          }
          model = new Klass();
          if (model instanceof XM.Model && !model instanceof XM.Settings) {
            assert.include(model.getAttributeNames(), model.idAttribute, key + " does not contain its idAttribute");
          }
        }
      });
    });
  });

  describe('Model read-only recursion', function () {
    this.timeout(20 * 1000);
    it('should log in first', function (done) {
      zombieAuth.loadApp(done);
    });

    it('should know to stop if an attribute is null', function () {
      var model, status;

      model = new XM.QuoteLine();
      model.set("itemSite", null);

      status = model.isReadOnly("itemSite.site.standardCost");
      assert.isNull(status);
    });
  });

  describe('XM.Model.augment()', function () {

    beforeEach(function () {
      XM.TestModel = XM.Model.extend({
        recordType: "XM.TestModel",
        myHash: {
          foo: 3
        },
        myArray: [1, 2, 3],
        myCount: 1,
        myIncrementer: function () {
          this.myCount += 5;
        }
      });
    });

    it('should add new fields', function () {
      XM.TestModel.prototype.augment({
        myNewThing: "GREAT"
      });

      var model = new XM.TestModel();
      assert.equal(model.myNewThing, "GREAT");
    });

    it('should error on type mismatches', function () {
      try {
        XM.TestModel.prototype.augment({
          myHash: "GREAT"
        });
        assert.fail("Type mismatches should not be allowed");
      } catch (error) {
        assert.isObject(error);
      }
    });

    it('should mix in objects', function () {
      XM.TestModel.prototype.augment({
        myHash: {
          bar: 5
        }
      });

      var model = new XM.TestModel();
      assert.equal(model.myHash.foo, 3);
      assert.equal(model.myHash.bar, 5);
    });

    it('should union arrays', function () {
      XM.TestModel.prototype.augment({
        myArray: [7]
      });

      var model = new XM.TestModel();
      assert.include(model.myArray, 1);
      assert.include(model.myArray, 2);
      assert.include(model.myArray, 3);
      assert.include(model.myArray, 7);
    });

    it('should run the old function and then the new', function () {
      XM.TestModel.prototype.augment({
        myIncrementer: function () {
          this.myCount *= 3;
        }
      });

      var a = new XM.TestModel();
      a.myIncrementer();
      var model = new XM.TestModel();
      model.myIncrementer();
      assert.equal(model.myCount, 18);
    });

    it('should error on illegal augmentation', function () {
      try {
        XM.TestModel.prototype.augment({
          myCount: 99
        });
        assert.fail("Illegal augmentation should not be allowed");
      } catch (error) {
        assert.isObject(error);
      }
    });


  });
}());

