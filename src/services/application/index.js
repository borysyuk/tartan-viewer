'use strict';

var _ = require('lodash');
var url = require('url');
var Promise = require('bluebird');
var csv = require('papaparse');
var downloader = require('../downloader');
var search = require('../search');

var sourceUrl = 'https://rawgit.com/thetartan/tartan-database/' +
  'v0.2/data/house-of-tartan.csv';

var datasetDirectoryUrl = 'https://rawgit.com/thetartan/' +
  'tartan-database/master/data/index.json';

function getDatasetDirectory() {
  return downloader.getJson(datasetDirectoryUrl)
    .then(function(items) {
      return _.map(items, function(item) {
        item = _.clone(item);
        item.url = url.resolve(datasetDirectoryUrl, item.path);
        return item;
      });
    });
}

function convertRecord(record, fields, attributes) {
  var result = {};

  var propMap = {};
  _.each(fields, function(field) {
    propMap[field.name] = field.title;
  });

  _.each(attributes, function(attribute) {
    var attrFields = _.isArray(attribute.fields) ? attribute.fields :
      [attribute.fields];
    var value = _.map(attrFields, function(name) {
        var result = record[propMap[name]];
        if (attribute.split) {
          result = _.map(result.split(attribute.split), _.trim);
        }
        return result;
      });

    if (attribute.split) {
      // Merge and get unique values
      value = _.union.apply(null, value);
    }

    value = _.filter(value, function(item) {
      return _.isString(item) && (item.length > 0);
    });

    if (!attribute.split && !_.isArray(attribute.fields)) {
      value = _.first(value);
    }

    if (attribute.join) {
      value = value.join(attribute.join);
    }

    result[attribute.name] = value;
  });

  return result;
}

function getDataset(dataset) {
  var attributes = null;
  var fields = null;
  var resourceName = null;
  return downloader.getJson(dataset.url)
    .then(function(dataPackage) {
      attributes = dataPackage.attributes;
      var resource = _.first(dataPackage.resources);
      if (resource) {
        resourceName = resource.title;
        fields = _.extend({}, resource.schema).fields;
        if (!_.isArray(fields) && !_.isObject(fields)) {
          fields = [];
        }
        if (!_.isArray(attributes) && !_.isObject(attributes)) {
          attributes = _.map(fields, function(field) {
            return {name: field.name, fields: field.name};
          });
        }
        var resourceUrl = resource.url;
        if (resource.path) {
          resourceUrl = url.resolve(dataset.url, resource.path);
        }
        return getCSVData(resourceUrl);
      }
      return []; // return empty dataset
    })
    .then(function(records) {
      return _.map(records, function(record) {
        if (fields && attributes) {
          record = convertRecord(record, fields, attributes);
          record.dataset = resourceName;
        }
        return record;
      });
    })
    .then(function(records) {
      return _.extend({}, dataset, {
        items: records
      });
    });
}

function getPapaParseError(parseErrors) {
  parseErrors = _.filter(parseErrors, function(error) {
    // Delimiter was not auto-detected (defaults used).
    // We'll not treat this as an error
    var delimiterNotDetected = (error.type == 'Delimiter') &&
      (error.code == 'UndetectableDelimiter');

    return !delimiterNotDetected;
  });
  if (parseErrors.length > 0) {
    return new Error(parseErrors[0].message);
  }
}

function getCSVData(url) {
  return new Promise(function(resolve, reject) {
    var config = {
      download: true,
      skipEmptyLines: true,
      header: true,
      error: function(error) {
        reject(new Error('Failed to load ' + url + ' : ' + error));
      },
      complete: function(results) {
        var error = getPapaParseError(results.errors);
        if (error) {
          reject(error);
        } else {
          resolve(results.data);
        }
      }
    };
    csv.parse(url, config);
  });
}

function buildSearchIndex(items) {
  return search(items, [
    search.fulltext(items),
    search.category(items)
  ]);
}

module.exports.getDatasetDirectory = getDatasetDirectory;
module.exports.getDataset = getDataset;
module.exports.buildSearchIndex = buildSearchIndex;
