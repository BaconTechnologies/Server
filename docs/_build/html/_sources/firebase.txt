Application's Database
######################

For the application database we utilized the `Firebase PAAS
<https://www.firebase.com/>`_. Firebase is a NoSQL database that works by using
the JSON format. All the data stored in the application will be a child of a
top root JSON object.

The database has three subsections (children):

- zones
- places
- suggestedZone


Zones
-----

The zones are stored in a simple object acting as a map or dictionary,
the keys of the objects are the zones ID's, and are therefore, unique.
The values are themselves simple objects that store a zone's name, capacity
(meaning the number of automoviles the zone can harbor) and occupancy (meaning
the number of cars currently parked at the zone).

Places
------

Similar to the Zones, the Places are stored in a simple object that acts as a
map or dictionary, the keys of the object are the place's name and are,
therefore, unique. The values are simple objects themselves that contain the
places associated zone and a category which is a string that is used to
logically group places together.

Suggested Zone
--------------

The suggested zone is merely a string that, it's domain is the existing
Zone ID's, meaning the keys of the *zones* child.
