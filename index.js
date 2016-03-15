'use strict';

// Third party libraries
var http = require('http'); // For the server
var _ = require('lodash'); // Utility methods
var path = require('path'); // For managing filesystem paths
var express = require('express'); // Web framework
var bodyParser = require('body-parser');
var store = require('./store.js'); // Our own library to command the database
var cors = require('cors');

// Instatiate the express server
var app = express();

app.use(cors());
app.use(bodyParser.json());


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
      response.json(result);
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
      response.json(result);
    })
    .catch(function(errorObj) {
      response.status(400);
      response.json(errorObj);
    });
});


http.createServer(app).listen(8000);
