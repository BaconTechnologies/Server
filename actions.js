'use strict';

var _ = require('lodash');
var Firebase = require('firebase');

var FIREBASE_URL = 'https://scorching-fire-7518.firebaseio.com/';
var db = new Firebase(FIREBASE_URL);

var zones = db.child('zones');

module.exports = {

  createZone: function(data, onSuccess, onError) {
    zones.child(data.name).set(data);
    onSuccess();
  },

  queryZone: function(zoneName, onSuccess, onError) {
    // I haven't figured out how to do queries in firebase so I
    // am using lodash _ functions to find the desired elements
    // from the data that firebase returns
    zones.once('value', function(snapshot) {
      onSuccess(_.get(snapshot.val(), zoneName));
    });
  },

  incrementZoneOccupancy: function(zoneName, onSuccess, onError) {
    var z = queryZone(zoneName);
    z.occupancy += 1;
    zones.set({ zoneName: z }, onSuccess });
  }

}
