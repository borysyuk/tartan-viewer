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

function createAttributeMapper(fields, attributes) {
  var fieldIndex = _.chain(fields)
    .map(function(field, index) {
      return [field.name, index];
    })
    .fromPairs()
    .value();

  function compileArguments(args) {
    args = _.isArray(args) ? args : [args];
    return _.chain(args)
      .map(function(value) {
        return _.isUndefined(value) ? 'undefined' : JSON.stringify(value);
      })
      .join(', ')
      .value();
  }

  var mapper = ['var result = {};'];

  _.each(attributes, function(descriptor, name) {
    if (_.isString(descriptor)) {
      if (fieldIndex.hasOwnProperty(descriptor)) {
        mapper.push('result[' + JSON.stringify(name) + '] = ' +
          'row[' + fieldIndex[descriptor] + '];');
      }
    }
    if (_.isArray(descriptor)) {
      mapper.push('var values = [];');

      var isArray = true;
      _.each(descriptor, function(item) {
        if (_.isString(item)) {
          switch (item) {
            case 'trim':
              if (isArray) {
                mapper.push('values = _.map(values, _.trim);');
              } else {
                mapper.push('values = _.trim(values);');
              }
              break;
            case 'filter':
              if (isArray) {
                mapper.push('values = _.filter(values);');
              }
              break;
            case 'unique':
              if (isArray) {
                mapper.push('values = _.uniq(values);');
              }
              break;
            default:
              break;
          }
        }
        if (_.isObject(item)) {
          _.each(item, function(args, func) {
            switch (func) {
              case 'fields':
                args = _.isArray(args) ? args : [args];
                var fields = [];
                _.each(args, function(field) {
                  if (fieldIndex.hasOwnProperty(field)) {
                    fields.push('row[' + fieldIndex[field] + ']');
                  }
                });
                if (fields.length > 0) {
                  if (!isArray) {
                    mapper.push('values = [values];');
                    isArray = true;
                  }
                  mapper.push('values.push(' + fields.join(', ') + ')');
                }
                break;
              case 'values':
                if (!isArray) {
                  mapper.push('values = [values];');
                  isArray = true;
                }
                mapper.push('values.push(' + compileArguments(args) + ')');
                break;
              case 'split':
                if (isArray) {
                  mapper.push('values = _.map(values, function(value) {');
                  mapper.push('return _.split(value, ' +
                    compileArguments(args) + ');');
                  mapper.push('});');
                } else {
                  mapper.push('values = _.split(values, ' +
                    compileArguments(args) + ');');
                }
                isArray = true;
                break;
              case 'join':
                if (isArray) {
                  mapper.push('values = _.join(values, ' +
                    compileArguments(args) + ');');
                  isArray = false;
                }
                break;
              case 'flatten':
                if (isArray) {
                  mapper.push('values = _.flattenDeep(values);');
                }
                break;
              default:
                break;
            }
          });
        }
      });

      mapper.push('result[' + JSON.stringify(name) + '] = values;');
    }
  });

  mapper.push('return result;');

  mapper = new Function('row', '_', mapper.join('\n'));
  return function(row) {
    return mapper(row, _);
  };
}

function getDataset(dataset) {
  var attributes = null;
  var fields = null;
  var resourceName = null;
  var hasHeaders = false;
  return downloader.getJson(dataset.url)
    .then(function(dataPackage) {
      attributes = dataPackage.attributes;
      var resource = _.first(dataPackage.resources);
      if (resource) {
        resourceName = resource.title;
        hasHeaders = !!resource.headers;
        fields = _.extend({}, resource.schema).fields;
        if (!_.isArray(fields) && !_.isObject(fields)) {
          fields = [];
        }
        if (!_.isArray(attributes) && !_.isObject(attributes)) {
          attributes = _.chain(fields)
            .map(function(field) {
              return [field.name, field.name];
            })
            .fromPairs()
            .value();
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
      if (hasHeaders) {
        records.splice(0, 1); // Remove first item
      }
      var result = records;
      if (fields && attributes) {
        var mapper = createAttributeMapper(fields, attributes);
        result = _.map(records, function(record, index) {
          return _.extend({}, mapper(record), {
            ref: index + 1,
            dataset: resourceName
          });
        });
      }
      return result;
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
