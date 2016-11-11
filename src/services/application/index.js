'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var csv = require('papaparse');
var search = require('../search');

var sourceUrl = 'https://raw.githubusercontent.com/kravets-levko/' +
  'tartan-database/master/data/house-of-tartan.csv';

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

function loadData(url) {
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
          resolve(_.map(results.data, function(record, index) {
            var result = {
              id: index,
              /* eslint-disable dot-notation */
              source: record['Source'],
              name: record['Name'],
              overview: record['Overview'],
              comment: record['Comment'],
              copyright: record['Copyright'],
              palette: record['Palette'],
              threadcount: record['Threadcount'],
              sourceUrl: record['Source URL']
              /* eslint-enable dot-notation */
            };
            var sett = _.filter([result.palette, result.threadcount]);
            result.sett = sett.length > 0 ? sett.join('\n') : null;
            /* eslint-disable dot-notation */
            var categories = record['Category'].split(';');
            /* eslint-enable dot-notation */
            result.categories = _.chain(categories)
              .map(_.trim)
              .filter()
              .value();
            return result;
          }));
        }
      }
    };
    csv.parse(url, config);
  });
}

function loadDatabase() {
  return loadData(sourceUrl).then(function(records) {
    return search(records, [
      search.fulltext(records),
      search.category(records)
    ]);
  });
}

module.exports.loadDatabase = loadDatabase;
