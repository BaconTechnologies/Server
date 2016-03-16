'use strict';

// Third party libraries
const http = require('http'); // For the server
const _ = require('lodash'); // Utility methods
const path = require('path'); // For managing filesystem paths
const express = require('express'); // Web framework
const bodyParser = require('body-parser');
const store = require('./store.js'); // Our own library to command the database
const cors = require('cors');

// Instatiate the express server
const app = express();

const determineSuggestedParkingZone = function(parkingZones) {
  return _.reduce(parkingZones, function(bestSoFar, currentZone) {
    if (!bestSoFar || currentZone.availability > bestSoFar.availability) {
      return currentZone;
    } else {
      return bestSoFar;
    }
  }, null).id;
};

store.zones.on('value', function(snapshot) {
  store.getAllZones()
  .then(function(allZonesData) {
    store.setSuggestedZone(determineSuggestedParkingZone(allZonesData))
    .catch(function(dbError) {
      console.error(dbError);
    });
  });
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'api-guide.html'));
});


app.get('/api/zone', function(request, response) {
  store.getAllZones()
  .then(function(allZonesData) {
    response.json(allZonesData);
  })
  .catch(function(dbResponse) {
    response.status(400).json(dbResponse);
  })
});


app.post('/api/zone', function(request, response) {
  const zoneData = request.body;

  store.createZone(zoneData)
  .then(function(dbResponse) {
    response.json(dbResponse.data);
  })
  .catch(function(dbResponse) {
    response.status(400).json(dbResponse);
  });
});


app.get('/api/zone/:zoneId', function(request, response) {
  const zoneId = request.params.zoneId;

  store.getZone(zoneId)
  .then(function(zoneData) {
    response.json(zoneData);
  })
  .catch(function(dbResponse) {
    response.status(400).json(dbResponse);
  });
});


app.delete('/api/zone/:zoneId', function(request, response) {
  const zoneId = request.params.zoneId;

  store.deleteZone(zoneId)
  .then(function(zoneData) {
    response.status(204).end();
  })
  .catch(function(dbResponse) {
    response.status(400).json(dbResponse);
  });
});


app.put('/api/zone/:zoneId', function(request, response) {
  const zoneId = request.params.zoneId;
  const updatedZoneData = request.body;
  store.updateZone(zoneId, updatedZoneData)
  .then(function(dbResponse) {
    response.json(dbResponse);
  })
  .catch(function(error) {
    console.error(error);
    response.status(400).end();
  });
})


app.get('/api/zone/:zoneId/enter', function(request, response) {
  const zoneId = request.params.zoneId;
  store.incrementZoneOccupancy(zoneId)
  .then(function(dbResponse) {
    response.json(dbResponse);
  })
  .catch(function(dbError) {
    console.error(error);
    response.status(400).end();
  });
});


app.get('/api/zone/:zoneId/exit', function(request, response) {
  const zoneId = request.params.zoneId;
  store.decrementZoneOccupancy(zoneId)
  .then(function(dbResponse) {
    response.json(dbResponse);
  })
  .catch(function(dbError) {
    console.error(error);
    response.status(400).end();
  });
});


http.createServer(app).listen(process.env.PORT || 8000);
