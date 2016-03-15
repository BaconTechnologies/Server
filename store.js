// store.js
'use strict'

const _ = require('lodash');
const Firebase = require('firebase');
const Q = require('q');

const FIREBASE_URL = 'http://scorching-fire-7518.firebaseIO.com';

const db = new Firebase(FIREBASE_URL);
const zones = db.child('zones');


const createZone = function(data) {
  const deferred = Q.defer();

  const zoneName = data.name;
  const zoneData = _.omit(data, 'name');

  zones.child(data.name).set(zoneData, function(error) {
    if (!error) {
      deferred.resolve();
    } else {
      deferred.reject();
    }
  });

  return deferred.promise;
};


const getAllZones = function() {
  const deferred = Q.defer();

  zones.once('value', function(snapshot) {
    deferred.resolve(snapshot.val());
  }, function(errorObj) {
    deferred.reject(errorObj);
  });

  return deferred.promise;
};


const getZone = function(zoneName) {
  const deferred = Q.defer();

  zones.child(zoneName).once('value', function(snapshot) {
    deferred.resolve(snapshot.val());
  }, function(errorObj) {
    deferred.reject(errorObj);
  });

  return deferred.promise;
};


const traverseToChildHandle = function(startingHandle, fn, params, times) {
  let caller = startingHandle
  _.each(params, function(p) {
    caller = _.invoke(caller, fn, p);
  });
  return caller;
};


const incrementZoneOccupancy = function(zoneName) {
  const deferred = Q.defer();

  getZone(zoneName)
    .then(function(zoneData) {
      zones.child(zoneName).update({
        occupancy: zoneData.occupancy += 1
      }, function(error) {
        if (!error) {
          deferred.resolve({ message: 'ok' });
        } else {
          deferred.reject({ message: 'denied' });
        }
      })
    });

  return deferred.promise;
};


const decrementZoneOccupancy = function(zoneName) {
  const deferred = Q.defer();

  getZone(zoneName)
    .then(function(zoneData) {
      zones.child(zoneName).update({
        occupancy: zoneData.occupancy -= 1
      }, function(error) {
        if (!error) {
          deferred.resolve({ message: 'ok' });
        } else {
          deferred.reject({ message: 'denied' });
        }
      })
    });

  return deferred.promise;
};

module.exports = {
  getAllZones: getAllZones,
  createZone: createZone,
  getZone: getZone,
  incrementZoneOccupancy: incrementZoneOccupancy,
  decrementZoneOccupancy: decrementZoneOccupancy
};
