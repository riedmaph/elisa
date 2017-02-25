const path = require('path');
const uuid = require('uuid');

const db = require(path.join('..', 'dbconnector.js'));

const async = require('async');
const waterfall = require('async-waterfall');

var sqlReadItems = db.loadSql(path.join('controllers', 'items', 'readItems.sql'));
var sqlFindOffers = db.loadSql(path.join('controllers', 'optimisation', 'findOffers.sql'));
var sqlCreateOptimisedList = db.loadSql(path.join('controllers', 'optimisation', 'createOptimisedList.sql'));
var sqlCreateOptimisedItem = db.loadSql(path.join('controllers', 'optimisation', 'createOptimisedItem.sql'));

//var sql = db.loadSql(path.join('optimization', 'optimization', '.sql'));

function updateItem(req, res, next) {

}

function saveOptimisedList(req, res, next) {

}

function getOptimisedList(req, res, next) {
  var options = {};
  options.listid = req.params.listid;
  options.userid = req.body.userid

  waterfall([
    async.apply(initialize, options), //async.apply to hand over parameter to first method
    executeOptimisation,
    createOptimisedData
  ], function (err, result) {
      if(!err) {
        res.status(200)
        .json(
          result
        );
      }
      else {
        next(err);    
      }
  });
}

//load items for given list and suitable offers for each item
function initialize(options, callback) {
    db.conn.task(function (t) {
      return t.map(sqlReadItems, options, function(item) { //load all items for list
        options.name = item.name;
        return t.any(sqlFindOffers, options)  //load offers for each item
          .then(function(offers) {
            offers = offers.map(
              function(offer) 
              {
                return {
                  id: offer.id, 
                  market: offer.market, 
                  offerprice: offer.offerprice, 
                  offerfrom: offer.offerfrom, 
                  offerto: offer.offerto, 
                  discount: offer.discount, 
                  isOptimium: false,
                  article:{
                    name: offer.articlename, 
                    brand: offer.articlebrand
                  }
                }
              }
            );
            item.offers = offers;
            return item;
          });
    }).then(t.batch)
   })
   .then(function (data) {
      var result = {};
      result = {
          items: data
        };
    callback(null, result, options);
  })
  .catch(function (err) {
    err.message = 'controllers.optimisation.loadList: ' + err.message;
    callback(err);
  });
}

//select the right optimisation-method
function executeOptimisation(result, options, callback) {
  //call right optimisation
  callback(null, result, options);
}

function _optimiseByPrice(result) {

}

function createOptimisedData(result, options, callback) {
  //write optimsed list to db 
  var sqlOtimisedListOptions = {};
  sqlOtimisedListOptions.id = uuid.v1();
  sqlOtimisedListOptions.listid = options.listid;

  var sqlOtimisedItemOptions = {}

  db.conn.none(sqlCreateOptimisedList, sqlOtimisedListOptions)  //create db-entry for optimisedlist
    .then(function (data) {
      db.conn.task(function (t) {
          var queries = result.items.map(function (item) {
            sqlOtimisedItemOptions.id = uuid.v1();
            sqlOtimisedItemOptions.optimisedlistid = sqlOtimisedListOptions.id;
            sqlOtimisedItemOptions.position = item.position;
            sqlOtimisedItemOptions.name = item.name;
            sqlOtimisedItemOptions.amount = item.amount;
            sqlOtimisedItemOptions.unit = item.unit;
            sqlOtimisedItemOptions.offerAlgorithm = null;

            return t.none(sqlCreateOptimisedItem, sqlOtimisedItemOptions);
          });
          return t.batch(queries);
        })
        .then(function (data) {          
          callback(null, result);
        })
        .catch(function (err) {
          err.message = 'controllers.createOptimisedData.createOptimisedItems: ' + err.message;
          callback(err);
        });  
    })
    .catch(function (err) {
      err.message = 'controllers.createOptimisedData.createOptimisedList: ' + err.message;
      callback(err);
    });  
}

module.exports = {
  getOptimisedList: getOptimisedList,
  updateItem: updateItem
};