var _ = require('lodash');
var actions = require('./actions.js');

actions.createZone({
  name: 'zona1',
  numLots: 20,
  occupancy: 0
}, _.noop, _.noop);

actions.createZone({
  name: 'zona2',
  numLots: 40,
  occupancy: 0
}, _.noop, _.noop);
