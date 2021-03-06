(function () {
  'use strict';

  var Query = require('./query'),
    RestQuery = require('./rest_query');

  /**
   * @class FreeTextQuery
   */
  function FreeTextQuery (query) {
    this.template || (this.template = FreeTextQuery.template);
    RestQuery.call(this, query);
  }

  Object.defineProperties(FreeTextQuery, {

    /**
     * @static
     */
    template: {
      value: _.extend(_.omit(_.clone(RestQuery.template), '(?)attributes'), {
        q: _.isString
      })
    }
  });

  /**
   * @extends FreeTextQuery
   */
  FreeTextQuery.prototype = _.extend(Object.create(RestQuery.prototype), {

    /**
     * @override
     * FreeTextQuery -> RestQuery -> TargetQuery
     */
    _toTarget: function (TargetQuery, options) {
      var that = this,
        schema = options.schema,
        columns = _.where(schema.columns, { category: 'S' }),
        source = _.defaults({
          attributes: _.object(
            _.pluck(columns, 'name'),
            _.map(columns, function (value, key) {
              return {
                MATCHES: that.query.q
              };
            })
          )
        }, _.omit(this.query, 'q'));

      return new RestQuery(source).toTarget(TargetQuery, options);
    }
  });

  module.exports = FreeTextQuery;
})();
