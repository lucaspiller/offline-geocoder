"use strict";

const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('data/db.sqlite')

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
function findFeature(latitude, longitude, callback) {
  const query = `SELECT * FROM everything WHERE id IN (
                   SELECT feature_id
                   FROM coordinates
                   ORDER BY (
                     ($lat - latitude) * ($lat - latitude) +
                       ($lon - longitude) * ($lon - longitude) * $scale
                   ) ASC
                   LIMIT 1
                 )`

  const scale = Math.pow(Math.cos(latitude * Math.PI / 180), 2)

  db.all(query, {
    $lat:   latitude,
    $lon:   longitude,
    $scale: scale
  }, function(err, rows) {
    if (err) {
      callback(err, undefined)
    } else {
      callback(undefined, formatResult(rows))
    }
  })
}

function formatResult(rows) {
  const row = rows[0]

  if (row.id === undefined) {
    return {}
  }

  // Construct the formatted name consisting of the name, admin1 name and
  // country name. Some features don't have an admin1, and others may have the
  // same name as the feature, so this handles that.
  let nameParts = []
  nameParts.push(row.name)
  if (row.admin1_name && row.admin1_name != row.name) {
    nameParts.push(row.admin1_name)
  }
  nameParts.push(row.country_name)
  const formattedName = nameParts.join(', ')

  return {
    id:        row.id,
    name:      row.name,
    formatted: formattedName,
    country: {
      id:   row.country_id,
      name: row.country_name
    },
    admin1: {
      id:   row.admin1_id,
      name: row.admin1_name,
    },
    coordinates: {
      latitude:  row.latitude,
      longitude: row.longitude
    }
  }
}

function Reverse(latitude, longitude, callback) {
  findFeature(latitude, longitude, callback)
}

module.exports = Reverse;
