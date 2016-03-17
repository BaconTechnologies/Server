REST API
########


GET /
-------

Displays a page that documentates the api endpoints


PUT /api/zone
--------------

Upadates a zone with the given application/json content type payload.


GET /api/zone
-------------

Returns the data of all the zones in the application

GET /api/zones
--------------

Returns the data of all the zones in the application. Alias for GET /api/zone

POST /api/zone
--------------

Creates a zone with the given application/json content type payload.


GET /api/zone/:zoneId
---------------------

Returns the data of a zone with the given id.

DELETE /api/zone/:zoneId
------------------------

Deletes the zone with the given id.

PUT /api/zone/:zoneId
---------------------

Updates the zone with the given id, with the given application/json
content type json.

GET /api/zone/:zoneId/enter
---------------------------

Increments the occupancy of the given zone by one, as long as it doesn't
put the occupancy over the capacity.

/api/zone/:zoneId/exit
----------------------

Decrements the occupancy of the given zone by one, as long as it doesn't
put it below 0.

GET /api/places
---------------

Returns the data of all the places in the database

POST /api/places
----------------

Sets the data of the given places in application/json content type.

DELETE /api/places/:placeName
-----------------------------

Deletes the place with the given name from the database.
