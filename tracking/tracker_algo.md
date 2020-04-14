# How to track several objects at the same time?


```
The leftmost indexed tracked object controls

/* 	
	list of tracked fiducial objects
	each object has these attributes
		- fiducial_id = int
		- position = (x, y, z)
		- last_updated // timestamp
		- tracked = bool
*/
tracked_objects = []
timeout = 10 s	// timeout before objects that have lost tracking are uncontrolled

for every frame:
	if there is an update to an object: // also triggers on new object
		update tracked = true
		update the position of the object
		update the timestamp of the object
	if an object is lost:
		update tracked = false
	for object in in tracked_objects:
		if (current time - object.last_updated_timestamp < timeout):
			remove object from tracked_objects
	format and send tracked_objects list to receiving part
```