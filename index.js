'use strict';

// Third party libraries
let http = require('http'); // For the server
let _ = require('lodash'); // Utility methods
let path = require('path'); // For managing filesystem paths
let express = require('express'); // Web framework
let bodyParser = require('body-parser');
let store = require('./store.js'); // Our own library to command the database
let cors = require('cors');

// Instatiate the express server
let app = express();

let determineParkingZoneForNextDriver = function(parkingZones) {
  let leastOccupiedZoneName = null;
  let leastOccupiedZoneData = null;
  _.forIn(parkingZones, function(zoneData, zoneName) {
    if (!leastOccupiedZoneName || zoneData.occupancy < leastOccupiedZoneData.occupancy) {
      leastOccupiedZoneName = zoneName;
      leastOccupiedZoneData = zoneData;
    }
  });
  return leastOccupiedZoneName;
}

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/api/zone', function(request, response) {
  store.getAllZones()
  .then(function(zonesData) {
    response.json(zonesData);
  })
  .catch(function(errorObj) {
    response.satus(400);
    response.json(errorObj);
  });
});


app.post('/api/zone', function(request, response) {
  const data = request.body;
  store.createZone(data)
  .then(function() {
    response.end()
  })
  .catch(function() {
    response.status(400);
    response.end();
  });
});


app.get('/api/zone/:zoneName', function(request, response) {
  const zoneName = request.params.zoneName;
  store.getZone(zoneName)
  .then(function(zoneData) {
    zoneData.availability = zoneData.capacity - zoneData.occupancy;
    zoneData.name = zoneName;
    response.json(zoneData)
  })
  .catch(function(errorObj) {
    response.status(400);
    response.json(errorObj);
  });
});


app.delete('/api/zone/:zoneName', function(request, response) {
  const zoneName = request.params.zoneName;
  store.deleteZone(zoneName)
  .then(function() {
    response.status(204);
    response.end();
  })
  .catch(function(errorObj) {
    response.status(400);
    response.json(errorObj);
  });
});


app.get('/api/zone/:zoneName/enter', function(request, response) {
  const zoneName = request.params.zoneName;
  store.incrementZoneOccupancy(zoneName)
  .then(function(result) {
    return store.getAllZones();
  })
  .then(function(parkingZones) {
    return store.setNextParkingZone(determineParkingZoneForNextDriver(parkingZones));
  })
  .then(function() {
    return store.getZone(zoneName);
  })
  .then(function(zoneData) {
    zoneData.name = zoneName;
    zoneData.availability = zoneData.capacity - zoneData.occupancy;
    response.json(zoneData);
  })
  .catch(function(errorObj) {
    response.status(400);
    response.json(errorObj);
  });
});


app.get('/api/zone/:zoneName/exit', function(request, response) {
  const zoneName = request.params.zoneName;
  store.decrementZoneOccupancy(zoneName)
  .then(function(result) {
    return store.getAllZones();
  })
  .then(function(parkingZones) {
    return store.setNextParkingZone(determineParkingZoneForNextDriver(parkingZones));
  })
  .then(function() {
    return store.getZone(zoneName);
  })
  .then(function(zoneData) {
    zoneData.name = zoneName;
    zoneData.availability = zoneData.capacity - zoneData.occupancy;
    response.json(zoneData);
  })
  .catch(function(errorObj) {
    response.status(400);
    response.json(errorObj);
  });
});


http.createServer(app).listen(process.env.PORT || 8000);
