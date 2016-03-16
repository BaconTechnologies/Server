// store.js
'use strict'

const _ = require('lodash');
const Firebase = require('firebase');
const Q = require('q');

const FIREBASE_URL = 'http://scorching-fire-7518.firebaseIO.com';

const db = new Firebase(FIREBASE_URL);
const zones = db.child('zones');
const places = db.child('places');
const suggestedZone = db.child('suggestedZone');


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

const zoneIdInUse = function(zonesData, zoneId) {
  return _.findIndex(zonesData, { id: zoneId }) !== -1;
};


const updateZones = function(zonesData) {
  const deferred = Q.defer();

  zones.update(zonesData, function(error) {
    if (!error) {
      deferred.resolve({
        msg: 'Zones updated succefsully',
        zonesData: zonesData
      });
    } else {
      deferred.reject({
        errorMsg: 'Could not update zones',
        zonesData: zonesData
      });
    }
  });

  return deferred.promise;
};


const getAllZones = function() {
  const deferred = Q.defer();

  zones.once('value', function(snapshot) {
    const allZonesData = snapshot.val();
    const allZonesArray = _.map(_.toPairs(allZonesData), (pair) => {
      pair[1].availability = pair[1].capacity - pair[1].occupancy;
      pair[1].id = pair[0];
      return pair[1];
    });
    deferred.resolve(allZonesArray);
  }, function(error) {
    deferred.reject({
      errorMsg: error
    });
  });

  return deferred.promise;
};


const createZone = function(zoneData) {
  const deferred = Q.defer();
  const zoneId = zoneData.id;
  const _zoneData = _.omit(_.clone(zoneData), 'id');
  const errorMsg = '';

  getAllZones()
  .then(function(allZonesData) {
    if (zoneIdInUse(allZonesData, zoneId)) {
      deferred.reject({
        errorMsg: 'Cannot create zone, given id already exists.',
        zoneData: zoneData
      });
    } else {
      zones.child(zoneId).set(_zoneData, function(error) {
        if (!error) {
          deferred.resolve({
            msg: 'Zone created successfully',
            data: zoneData
          });
        } else {
          deferred.reject({
            errorMsg: 'Unknown error creating zone.',
            zoneData: zoneData
          });
        }
      });
    }
  });

  return deferred.promise;
};


const deleteZone = function(zoneId) {
  const deferred = Q.defer();

  zones.child(zoneId).remove(function(error) {
    if (!error) {
      deferred.resolve();
    } else {
      deferred.reject();
    }
  });

  return deferred.promise;
};


const getZone = function(zoneId) {
  const deferred = Q.defer();

  zones.child(zoneId).once('value', function(snapshot) {
    const zoneData = snapshot.val();

    if (zoneData) {
      zoneData.id = zoneId;
      zoneData.availability = zoneData.capacity - zoneData.occupancy;
      deferred.resolve(zoneData);
    } else {
      deferred.reject({
        errorMsg: 'No zone with given id found.',
        zoneId: zoneId
      });
    }
  }, function(error) {
    deferred.reject({
      errorMsg: 'Unkown error retrieving zone data.',
      zoneId: zoneId
    });
  });

  return deferred.promise;
}


const updateZone = function(zoneId, updatedZoneData) {
  const deferred = Q.defer();
  const zone = zones.child(zoneId);

  zone.once('value', function(snapshot) {
    if (snapshot.exists()) {
      zone.update(_.omit(updatedZoneData, ['id', 'availability']), function(error) {
        if (!error) {
          updatedZoneData.id = zoneId;
          updatedZoneData.availability = updatedZoneData.capacity - updatedZoneData.occupancy;
          deferred.resolve(updatedZoneData);
        } else {
          deferred.reject({
            errorMsg: 'Uknown error updating zone.',
            updatedZoneData: updatedZoneData
          });
        }
      });
    } else {
      deferred.reject({
        errorMsg: 'Cannot update a zone that doesn\'t exist',
        zoneId: zoneId,
        updatedZoneData: updatedZoneData
      });
    }
  });

  return deferred.promise;
};


const makeZoneUpdater = function(modifierFn) {
  return function(zoneId) {
    var deferred = Q.defer();

    getZone(zoneId)
    .then(function(prevZoneData) {
      const updatedZoneData = modifierFn(prevZoneData);
      updateZone(updatedZoneData.id, _.omit(updatedZoneData, 'id'))
      .then(function(dbResponse) {
        deferred.resolve(dbResponse);
      })
      .catch(function(dbError) {
        deferred.reject(dbError);
      });
    });

    return deferred.promise;
  }
};


const incrementZoneOccupancy = makeZoneUpdater(function(prevZoneData) {
  const newZoneData = _.clone(prevZoneData);
  if (prevZoneData.occupancy < prevZoneData.capacity) {
    newZoneData.occupancy += 1
  }
  return newZoneData;
});


const decrementZoneOccupancy = makeZoneUpdater(function(prevZoneData) {
  const newZoneData = _.clone(prevZoneData);
  if (prevZoneData.occupancy > 0) {
    newZoneData.occupancy -= 1
  }
  return newZoneData;
});


const setSuggestedZone = function(zoneId) {
  var deferred = Q.defer();

  suggestedZone.set(zoneId, function(error) {
    if (!error) {
      deferred.resolve(zoneId);
    } else {
      deferred.reject(zoneId);
    }
  });

  return deferred.promise;
};


const getSuggestedZone = function() {
  var deferred = Q.defer();

  suggestedZone.once('value', function(snapshot) {
    getZone(snapshot.val())
    .then(function(dbResponse) {
      deferred.resolve(dbResponse);
    })
    .catch(function(dbError) {
      deferred.reject(dbError);
    })
  });

  return deferred.promise();
};


const setZonePlaces = function(placesData) {
  var deferred = Q.defer();

  places.set(placesData, function(error) {
    if (!error) {
      deferred.resolve();
    } else {
      deferred.reject({
        errorMsg: 'Uknnown error setting places.',
        placesData: placesData
      });
    }
  })

  return deferred.promise;
};


const getZonePlaces = function()  {
  const deferred = Q.defer();

  places.once('value', function(snapshot) {
    deferred.resolve(snapshot.val())
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};


const deletePlace = function(placeName) {
  const deferred = Q.defer();

  places.child(placeName).set(null, function(error) {
    if (!error) {
      deferred.resolve({
        msg: 'Delete succesfull'
      });
    } else {
      deferred.reject({
        errorMsg: 'Could not delete place.',
        placeName: placeName
      });
    }
  });

  return deferred.promise;
}


module.exports = {
  db: db,
  zones: zones,
  suggestedZone: suggestedZone,
  updateZones: updateZones,
  getAllZones: getAllZones,
  createZone: createZone,
  deleteZone: deleteZone,
  getZone: getZone,
  updateZone: updateZone,
  incrementZoneOccupancy: incrementZoneOccupancy,
  decrementZoneOccupancy: decrementZoneOccupancy,
  setSuggestedZone: setSuggestedZone,
  getSuggestedZone: getSuggestedZone,
  getZonePlaces: getZonePlaces,
  setZonePlaces: setZonePlaces,
  deletePlace: deletePlace
};
