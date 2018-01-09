"use strict";

function find(geocoder, locationId, locationCountryId) {
  return new Promise(function(resolve, reject) {
    let query, params;
    if (typeof locationCountryId === 'string') {
      query = 'SELECT * FROM everything WHERE name = $name AND country_id = $country LIMIT 1';
      params = {$name: locationId, $country: locationCountryId};
    } else {
      query = 'SELECT * FROM everything WHERE id = $id LIMIT 1';
      params = {$id: locationId};
    }

    geocoder.db.all(query, params, function(err, rows) {
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

  if (row === undefined) {
    return undefined
  } else {
    return format(row)
  }
}

function format(result) {
  // Construct the formatted name consisting of the name, admin1 name and
  // country name. Some features don't have an admin1, and others may have the
  // same name as the feature, so this handles that.
  let nameParts = []
  nameParts.push(result.name)
  if (result.admin1_name && result.admin1_name != result.name) {
    nameParts.push(result.admin1_name)
  }
  nameParts.push(result.country_name)
  const formattedName = nameParts.join(', ')

  return {
    id:        result.id,
    name:      result.name,
    tz:        result.tz,
    formatted: formattedName,
    country: {
      id:   result.country_id,
      name: result.country_name
    },
    admin1: {
      id:   result.admin1_id,
      name: result.admin1_name,
    },
    coordinates: {
      latitude:  result.latitude,
      longitude: result.longitude
    }
  }
}

module.exports = {
  find:   find,
  format: format
}
