/*jshint trailing:true, white:true, indent:2, strict:true, curly:true,
  immed:true, eqeqeq:true, forin:true, latedef:true,
  newcap:true, noarg:true, undef:true */
/*global describe:true, it:true, XT:true, XM:true, XV:true, process:true,
  module:true, require:true, exports:true */

(function () {
  "use strict";

  /**
  Incident categories are used by the incident management system to categorize incidents.
  TIP: You must manually create incident categories if you want the ability to assign them to incidents. If no incident categories are defined, then none will be available when entering incidents.
  @class
  @alias IncidentCategory
  @property {String} Name
  @property {String} Description
  @property {Number} Order
  @property {Option} Email Delivery Profile
  **/

  var spec = {
      recordType: "XM.IncidentCategory",
      enforceUpperKey: false,
      collectionType: "XM.IncidentCategoryCollection",
      listKind: "XV.IncidentCategoryList",
      instanceOf: "XM.Document",
      attributes: ["name", "description", "order"],
      idAttribute: "name",
      extensions: ["crm", "billing"],
      isLockable: true,
      cacheName: "XM.incidentCategories",
      privileges: {
        createUpdateDelete: "MaintainIncidentCategories",
        read:  true
      },
      createHash: {
        name: 'tested' + Math.random(),
        description: 'description'
      },
      updatableField: "name",
      defaults: {
        order: 0
      }
    };

  exports.spec = spec;

}());