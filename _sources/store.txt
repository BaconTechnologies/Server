`store.js`
##########

The `store.js` module encapsulates all the logic of interfacing with the
database, it exports a number of function specialized to perform a single
action that will impact the database. Each of the exported functions
returns a JavaScript promise that gets resolved or rejected once the
database actions it involves are succesfull or encounter an error. Allowing
for an asynchronous program flow.

zoneIdInUse(zonesData, zoneId)
------------------------------

This function receives the data about all of the zones in the database,
and a string representing a zoneId, it returns whether the zoneId is
valid (meaning a zone is using it as it id) or not. This function is
only used internally and is not exported.


updateZones(zonesData)
----------------------

This function takes a JavaScript object literal with the same structure
as the *zones* child of the database. It creates any zone not currently
in the database, and overrides the data of those that already exist.
Any zone not included in the *zonesData* remains unchanged.

getAllZones()
-------------

Transforms the data of all the zones in the database, to an array of JavaScript
object literals, where the id (key) has been made into an attribute and
returns it.

createZone(zoneData)
--------------------

This function takes the data of a zone as an object literal, which must contain
the attributes *id, name, capacity, occupancy* and creates it, given that the
zone with the given id doesn't already exists in which case it informs the
caller of the collition.

getZone(zoneId)
----------------

Returns JavaScript object literal with the data of a zone with the given zoneId,
unless there exists no zone with that id in which case the user is informed of
the error.


makeZoneUpdater(modifierFn)
---------------------------

This is an internal function used to create functions that modify a specific
attribute of a given zone, setting it to the result of a given function.


incrementZoneOccupancy(zoneId)
------------------------------

This function was created by the `makeZoneUpdater()` function and when called
increments the occupancy of the zone with the given id by one, unless the
occupancy already equals the capacity in which case it does nothing.


decrementZoneOccupancy(zoneId)
------------------------------

This function was created by the `makeZoneUpdater()` function and when called
decrements the occupancy of the zone with the given id by one, unless the
occupancy already equals the capacity in which case it does nothing.

setSuggestedZone(zoneId)
------------------------

This function takes a string the id of a zone and sets it as the
value of the suggestedZone database child node.

getSuggestedZone()
-------------------------------------

Returns the suggestedZone.

setZonePlaces(placesData)
-------------------------

This function takes a JavaScript object literal with the same structure as the
*places* database child and set it. As a consequence, any non existing places
are created, exisitng places are overriden and places not included in the given
data are not modified.


getZonePlaces()
---------------

This function returns all the data about the places. (The *places*) child of the
database.


deletePlace(placeName)
-----------------------

This function takes the name (key) of a place and deletes it from the
database.
