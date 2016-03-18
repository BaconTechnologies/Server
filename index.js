'use strict';

// Third party libraries
const http = require('http'); // For the server
const _ = require('lodash'); // Utility methods
const path = require('path'); // For managing filesystem paths
const express = require('express'); // Web framework
const bodyParser = require('body-parser');
const store = require('./store.js'); // Our own library to command the database
const cors = require('cors');
const moment = require('moment');

_.mixin({
    'sortKeysBy': function (obj, comparator) {
        var keys = _.sortBy(_.keys(obj), function (key) {
            return comparator ? comparator(obj[key], key) : key;
        });

        return _.object(keys, _.map(keys, function (key) {
            return obj[key];
        }));
    }
});

// Instatiate the express server
const app = express();

const getMoreAvailableZone = function(parkingZones) {
  return _.reduce(parkingZones, function(bestSoFar, currentZone) {
    if (!bestSoFar || currentZone.availability > bestSoFar.availability) {
      return currentZone;
    } else {
      return bestSoFar;
    }
  }, null).id;
};

const getFirstNomEmptyParkingZone = function(parkingZones) {
  let suggestedZone = null;

  _.each(parkingZones, function(parkingZoneData) {
    if (_.isNull(suggestedZone) && parkingZoneData.occupancy < parkingZoneData.capacity) {
      suggestedZone = parkingZoneData;
    }
  });

  return suggestedZone.id;
};

store.zones.on('value', function(snapshot) {
  store.getAllZones()
  .then(function(allZonesData) {
    store.setSuggestedZone(getMoreAvailableZone(allZonesData))
    .then(function(dbResponse) {
    })
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


app.put('/api/zone', function(request, response) {
  const zonesData = request.body;
  store.updateZones(zonesData)
  .then(function(dbResponse) {
    response.json(zonesData);
  })
  .catch(function(dbError) {
    response.status(400).end();
  });
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

app.get('/api/zones', function(request, response) {
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


app.get('/api/zone/:zoneId/:plates', function(request, response) {
  const zoneId = request.params.zoneId;
  const plates = request.params.plates;
  store.registerVehicleMovement(zoneId, plates)
  .then(function(dbResponse) {
    response.json(dbResponse);
  })
  .catch(function(dbError) {
    console.error(dbError);
    response.status(400).end();
  });
});


app.get('/api/places', function(request, response) {
  store.getZonePlaces()
  .then(function(data) {
    response.json(data);
  })
  .catch(function(dbError) {
    console.error(error);
    response.status(400).end();
  });
});


app.post('/api/places', function(request, response) {
  const placesData = request.body;
  store.setZonePlaces(placesData)
  .then(function(dbResponse) {
    response.status(200).end();
  })
  .catch(function(dbError) {
    console.error(dbError);
    response.status(400).end();
  });
});


app.delete('/api/places/:placeName', function(request, response) {
    const placeName = request.params.placeName;
    store.deletePlace(placeName)
    .then(function() {
      response.status(204).end();
    })
    .catch(function() {
      response.status(400).end();
    });
});


app.get('/api/parking/history', function(request, response) {
  const query = request.query;

  console.log(query);

  let filterObj = {};

  if (!_.isUndefined(query.plate) && query.plate !== '') {
    filterObj.plates = query.plate;
  }

  if (!_.isUndefined(query.zone) && query.zone !== 'ALL') {
    filterObj.zoneId = query.zone;
  }

  let filtered = [];
  store.getParkingHistory()
  .then(function(parkingHistory) {
    filtered = _.filter(parkingHistory, filterObj)

    if (!_.isUndefined(query.startDay) && !_.isNull(query.startDay) && query.startDay !== '') {
      filtered = _.filter(filtered, function(datum) {
        // return moment(parseInt(query.startDay)).isSame(moment(parseInt(datum.entryTimestamp)), 'day');
        const given = moment(parseInt(query.startDay));
        const actual = moment(parseInt(datum.entryTimestamp));

        // console.log(given.date(), given.month(), given.year());
        // console.log(actual.date(), actual.month(), actual.year());
        // console.log();
        return given.date() === actual.date() && given.month() === actual.month() && given.year() === actual.year();
      });
    }

    if (!_.isUndefined(query.endDay) && !_.isNull(query.endDay) && query.endDay !== '') {
      filtered = _.filter(filtered, function(datum) {
        // return moment(parseInt(query.endDay)).isSame(moment(parseInt(datum.exitTimestamp)), 'day');

        const given = moment(parseInt(query.endDay));
        const actual = moment(parseInt(datum.exitTimestamp));

        // console.log(given.date(), given.month(), given.year());
        // console.log(actual.date(), actual.month(), actual.year());
        // console.log();
        return given.date() === actual.date() && given.month() === actual.month() && given.year() === actual.year();
      });
    }

    response.json(filtered);
  })
  .catch(function(error) {
    console.error(error);
    response.status(200).end();
  });
});


http.createServer(app).listen(process.env.PORT || 8080);
