var http = require('http');
var path = require('path');
var express = require('express');
var firebase = require('firebase');

var app = express();

app.get('/api/parking', function(request, response) {
  response.json({
    zone: 2,
    message: 'Ve a la zona 2'
  });
});

http.createServer(app).listen(8000);
