"use strict";

const formatLocation = require('./location').format

// This finds the closest feature based upon Pythagoras's theorem. It is an
// approximation, and won't provide results as accurate as the haversine
// formula, but trades that for performance. For our use case this is good
// enough as the data is just an approximation of the centre point of a
// feature.
//
// The scale parameter accounts for the fact that 1 degree in longitude is
// different at the poles vs the equator.
//
// Based upon http://stackoverflow.com/a/7261601/155715
function findFeature(geocoder, latitude, longitude, callback) {
  return new Promise(function(resolve, reject) {
    const query = `SELECT * FROM everything WHERE id IN (
                     SELECT feature_id
                     FROM coordinates
                     WHERE latitude BETWEEN $lat - 1.5 AND $lat + 1.5
                     AND longitude BETWEEN $lon - 1.5 AND $lon + 1.5
                     ORDER BY (
                       ($lat - latitude) * ($lat - latitude) +
                         ($lon - longitude) * ($lon - longitude) * $scale
                     ) ASC
                     LIMIT 1
                   )`

    const scale = Math.pow(Math.cos(latitude * Math.PI / 180), 2)

    geocoder.db.all(query, {
      $lat:   latitude,
      $lon:   longitude,
      $scale: scale
    }, function(err, rows) {
      if (err) {
        if (typeof(callback) == 'function') {
          callback(err, undefined)
        } else if (typeof(reject) == 'function') {
          reject(err)
        }
      } else {
        const result = formatResult(rows)
        if (typeof(callback) == 'function') {
          callback(undefined, result)
        } else if (typeof(resolve) == 'function') {
          resolve(result)
        }
      }
    })
  })
}

function formatResult(rows) {
  const row = rows[0]

  if (!row || row === undefined) {
    return {}
  } else {
    return formatLocation(row)
  }
}

function Reverse(geocoder, latitude, longitude, callback) {
  return findFeature(geocoder, latitude, longitude, callback)
}

module.exports = Reverse;
