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


const deleteZone = function(zoneName) {
  const deferred = Q.defer();

  zones.child(zoneName).remove(function(error) {
    if (!error) {
      deferred.resolve();
    } else {
      deferred.reject();
    }
  });

  return deferred.promise;
}


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

const setNextParkingZone = function(zoneName) {
  const deferred = Q.defer();

  db.child('nextToPark').set(zoneName, function(errorObj) {
    if (!errorObj) {
      deferred.resolve(zoneName);
    } else {
      deferred.reject(errorObj)
    }
  });

  return deferred.promise;
}

const getNextParkingZone = function() {
  const deferred = Q.defer();

  db.child('nextToPark').once('value', function(snapshot) {
    deferred.resolve(snapshot.val());
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

module.exports = {
  getAllZones: getAllZones,
  createZone: createZone,
  deleteZone: deleteZone,
  getZone: getZone,
  incrementZoneOccupancy: incrementZoneOccupancy,
  decrementZoneOccupancy: decrementZoneOccupancy,
  setNextParkingZone: setNextParkingZone
};
