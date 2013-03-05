/*jshint indent:2, curly:true eqeqeq:true, immed:true, latedef:true,
newcap:true, noarg:true, regexp:true, undef:true, strict:true, trailing:true
white:true*/
/*global XT:true, XM:true, Backbone:true, _:true, console:true */

(function () {
  "use strict";

  /**
    Mixin for item classes
  */
  XM.ItemMixin = {

    /**
      Requests the standard cost of an item.

      @param {Object} Options: success, error
    */
    standardCost: function (options) {
      // TO DO: We need this for quote, sales order etc. but what about ViewCost privilege?
      this.dispatch("XM.Item", "standardCost", this.id, options);
    },

    /**
      Requests an array of selling units from the server.

      @param {Object} Options: success, error
    */
    sellingUnits: function (options) {
      this.dispatch("XM.Item", "sellingUnits", this.id, options);
    },

    /**
      Requests on array of selling units from the server.

      @param {Object} Options: success, error
    */
    materialIssueUnits: function (options) {
      this.dispatch("XM.Item", "materialIssueUnits", this.id, options);
    },

    /**
      Requests a tax type based on a  specified tax zone from the server.

      @param {XM.TaxZone} Tax Zone
      @param {Object} Options: success, error
    */
    taxType: function (taxZone, options) {
      this.dispatch("XM.Item", "taxType", [this.id, taxZone ? taxZone.id : null], options);
    }
  };

  /**
    @class

    @extends XM.Document
  */
  XM.ClassCode = XM.Document.extend({
    /** @scope XM.ClassCode.prototype */

    recordType: 'XM.ClassCode',

    documentKey: 'code',

    enforceUpperKey: false

  });

  /**
    @class

    @extends XM.Document
  */
  XM.ProductCategory = XM.Document.extend({
    /** @scope XM.ProductCategory.prototype */

    recordType: 'XM.ProductCategory',

    nameAttribute: 'code',

    documentKey: 'code'

  });

  /**
    @instance

    Dummy product category for setting -1 values.
  */
  XM.emptyProductCategory = new XM.ProductCategory({
    /** @scope XM.emptyProductCategory */
    id: -1,
    code: 'EMPTY',
    description: 'Use for indicating no product category'
  });

  /**
    @class

    @extends XM.Document
  */
  XM.Unit = XM.Document.extend({
    /** @scope XM.Unit.prototype */

    recordType: 'XM.Unit',

    documentKey: 'name',

    defaults: {
      isItemWeight: false
    },

    requiredAttributes: [
      "isItemWeight"
    ]

  });

  /**
    @class

    @extends XM.Document
  */
  XM.Item = XM.Document.extend({
    /** @scope XM.Item.prototype */

    recordType: 'XM.Item',

    nameAttribute: 'number',

    defaults: function () {
      return {
        description1: '',
        description2: '',
        isActive: true,
        isFractional: false,
        isSold: true,
        listPrice: 0,
        productCategory: XM.emptyProductCategory
      };
    },

    requiredAttributes: [
      "classCode",
      "inventoryUnit",
      "isActive",
      "isFractional",
      "isSold",
      "listPrice",
      "priceUnit",
      "productCategory"
    ],

    // ..........................................................
    // METHODS
    //

    initialize: function () {
      XM.Document.prototype.initialize.apply(this, arguments);
      this.on('change:inventoryUnit', this.inventoryUnitDidChange);
      this.on('change:isSold', this.isSoldDidChange);
      this.on('statusChange', this.isSoldDidChange);
    },

    inventoryUnitDidChange: function (model, value, options) {
      var status = this.getStatus(),
        K = XM.Model;
      if ((options && options.force) || !(status & K.READY)) { return; }
      if (value) { this.set('priceUnit', value); }
    },

    isSoldDidChange: function () {
      var K = XM.Model,
        isNotSold = !(this.get('isSold') || false);
      if (this.getStatus() & K.READY) {
        this.setReadOnly('productCategory', isNotSold);
        this.setReadOnly('priceUnit', isNotSold);
        this.setReadOnly('listPrice', isNotSold);
      }
    },

    statusDidChange: function () {
      var K = XM.Model;
      if (this.getStatus() === K.READY_CLEAN) {
        this.setReadOnly('number');
        this.setReadOnly('inventoryUnit');
      }
    },

    validateSave: function () {
      var isSold = this.get('isSold'),
        productCategory = this.get('productCategory');
      if (isSold && (productCategory.id || -1) === -1) {
        return XT.Error.clone('xt2005');
      }
    }

  });

  // Add in item mixin
  XM.Item = XM.Item.extend(XM.ItemMixin);

  /**
    @class

    @extends XM.Info
  */
  XM.ItemListItem = XM.Info.extend({
    /** @scope XM.ItemListItem.prototype */

    recordType: 'XM.ItemListItem',

    editableModel: 'XM.Item'

  });

  /**
    @class

    @extends XM.Comment
  */
  XM.ItemComment = XM.Comment.extend({
    /** @scope XM.ItemComment.prototype */

    recordType: 'XM.ItemComment',

    sourceName: 'I'

  });

  /**
    @class

    @extends XM.Characteristic
  */
  XM.ItemCharacteristic = XM.CharacteristicAssignment.extend({
    /** @scope XM.ItemCharacteristic.prototype */

    recordType: 'XM.ItemCharacteristic'

  });

  /**
    @class

    @extends XM.Model
  */
  XM.ItemAccount = XM.Model.extend({
    /** @scope XM.ItemAccount.prototype */

    recordType: 'XM.ItemAccount',

    isDocumentAssignment: true

  });

  /**
    @class

    @extends XM.Model
  */
  XM.ItemContact = XM.Model.extend({
    /** @scope XM.ItemContact.prototype */

    recordType: 'XM.ItemContact',

    isDocumentAssignment: true

  });

  /**
    @class

    @extends XM.Model
  */
  XM.ItemItem = XM.Model.extend({
    /** @scope XM.ItemItem.prototype */

    recordType: 'XM.ItemItem',

    isDocumentAssignment: true

  });

  /**
    @class

    @extends XM.Model
  */
  XM.ItemFile = XM.Model.extend({
    /** @scope XM.ItemFile.prototype */

    recordType: 'XM.ItemFile',

    isDocumentAssignment: true

  });

  /**
    @class

    @extends XM.Model
  */
  XM.ItemUrl = XM.Model.extend({
    /** @scope XM.ItemUrl.prototype */

    recordType: 'XM.ItemUrl',

    isDocumentAssignment: true

  });

  /**
    @class

    @extends XM.Model
  */
  XM.ItemRelation = XM.Info.extend({
    /** @scope XM.ItemRelatino.prototype */

    recordType: 'XM.ItemRelation',

    editableModel: 'XM.Item',

    descriptionKey: 'description1'

  });

  // Add in item mixin
  XM.ItemRelation = XM.ItemRelation.extend(XM.ItemMixin);

  // ..........................................................
  // COLLECTIONS
  //

  /**
   @class

   @extends XM.Collection
  */
  XM.ClassCodeCollection = XM.Collection.extend({
   /** @scope XM.ClassCodeCollection.prototype */

    model: XM.ClassCode

  });

  /**
   @class

   @extends XM.Collection
  */
  XM.ProductCategoryCollection = XM.Collection.extend({
   /** @scope XM.ProductCategoryCollection.prototype */

    model: XM.ProductCategory

  });

  /**
   @class

   @extends XM.Collection
  */
  XM.UnitCollection = XM.Collection.extend({
   /** @scope XM.UnitCollection.prototype */

    model: XM.Unit

  });

  /**
    @class

    @extends XM.Collection
  */
  XM.ItemListItemCollection = XM.Collection.extend({
    /** @scope XM.ItemListItemCollection.prototype */

    model: XM.ItemListItem

  });

  /**
    @class

    @extends XM.Collection
  */
  XM.ItemRelationCollection = XM.Collection.extend({
    /** @scope XM.ItemRelationCollection.prototype */

    model: XM.ItemRelation

  });

}());
