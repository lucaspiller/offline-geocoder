"use strict";

const path         = require('path')
const sqlite3      = require('sqlite3').verbose()
const reverse      = require('./reverse')
const findLocation = require('./location').find
const fs           = require('fs')

const NO_DB = 'Database doesn\'t exist';

function Geocoder(options) {
  var geocoder = function(options) {
    this.options = options || {}

    if (this.options.database === undefined) {
      this.options.database = path.join(__dirname, '../db.sqlite')
    }

    if (fs.existsSync(this.options.database)) {
      this.db = new sqlite3.Database(this.options.database)
    }
  }

  geocoder.prototype.reverse = function(latitude, longitude, callback) {
    if (!this.db) {
      if (callback) {
        callback(NO_DB)
      }
      return Promise.reject(NO_DB)
    }
    return reverse(this, latitude, longitude, callback)
  }

  geocoder.prototype.location = function(locationId, locationCountryId) {
    if (!this.db) {
      return Promise.reject(NO_DB)
    }

    return findLocation(this, locationId, locationCountryId);
  }

  return new geocoder(options)
}

module.exports = Geocoder;
