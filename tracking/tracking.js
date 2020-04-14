/*

    This algorithm is for tracking fiducial objects with [ReacTIVision](http://reactivision.sourceforge.net/) platform.
    It assumes that there's at most one instance of each fiducial marker. However, this is not always the case, and that's
    why I've left both (session_id, trackind_id) as parameters; for use in future improvements to the algorithm.

    List of Fiducial markers: http://reactivision.sourceforge.net/data/fiducials.pdf

    // The outputs from TUIO Max client object:
    the left output posts a list of TUIO messages: 
        - addObject session_id fiducial_id xpos ypos angle
        - updateObject session_id fiducial_id xpos ypos angle xspeed yspeed rspeed maccel raccel 
        - removeObject session_id fiducial_id
        - addCursor session_id cursor_id xpos ypos 
        - updateCursor session_id cursor_id xpos ypos xspeed yspeed maccel
        - removeCursor session_id cursor_id
        - addBlob session_id blob_id xpos ypos angle width height area
        - updateBlob session_id blob_id xpos ypos angle width height area xspeed yspeed rspeed maccel raccel
        - removeBlob session_id blob_id
*/

const Max = require('max-api'); // docs: https://docs.cycling74.com/nodeformax/api/
const path = require('path')

let timeout = 3.0 // seconds before an unseen tracker is removed from the list of tracked objects
const tracked_objects = []

// event handlers for Max
const handlers = {
    [Max.MESSAGE_TYPES.BANG]: () => {
      Max.post("Banging");
    },
    ['status']: () => {
        tracked_objects.forEach((obj) => {
            const diff = (new Date().getTime() - obj.updated) / 1000;
            Max.dump("Fiducial", obj.fiducial_id, "with ID", obj.session_id, "has lived", diff, "seconds")
        })
    },
    ['timeout']: (time) => {
        if (time && typeof time == "number" && time > 0.0){
            timeout = time;
        } else {
            Max.dump("Timeout is set to", timeout, "seconds");
        }
    },
    ['updateObject']: (...args) => {
        handleUpdateObject(...args);
    },
    ['addObject']: (...args) => {
        handleAddObject(...args);
    },
    ['removeObject']: (...args) => {
        handleRemoveObject(...args);
    },
    [Max.MESSAGE_TYPES.ALL]: (handled, ...args) => {
        if (!handled){
            Max.post(`The following inlet event was ${!handled ? "not " : "" }handled.\nEdit ${path.basename(__filename)} to do something about it.`);
        }
    }
};

// attach handlers through Max API
Max.addHandlers(handlers);

// print array to Max console for ease of use
Max.dump = function(...args) {
    Max.post(args.join(" "))
};

// object representing a fiducial marker
const Marker = (session_id, fiducial_id, x, y) => {
    return {
        session_id: session_id,
        fiducial_id: fiducial_id,
        x: x,
        y: y,
        tracked: true,
        count: 1, // how many frames this object has been seen
        created: new Date().getTime(),
        updated: new Date().getTime()
    }
}

const handleAddObject = (session_id, fiducial_id, x, y, angle=0) => {
    const i = findObject(tracked_objects, session_id, fiducial_id)    
    
    // we only append if fiducial is not already tracked
    if (i == -1){
        const marker = Marker(session_id, fiducial_id, x, y);
        tracked_objects.push(marker)
        Max.dump("Adding marker", marker.session_id, marker.fiducial_id)
    }
    // treat new addition of same fiducial as an update due to our uniqueness assumption
    else if (!tracked_objects[i].tracked){
        updateObject(tracked_objects, i, x, y);
    }
    return
}

/* 
    
    for every update to any object, we check if there are any objects that have
    timed out. if yes, then we don't want to track these objects anymore

*/
const handleUpdateObject = (session_id, fiducial_id, x, y, angle=0, xspeed=0, yspeed=0, rspeed=0, maccel=0, raccel=0) => {
    // update new information about the object
    const i = findObject(tracked_objects, session_id, fiducial_id);
    if (i > -1){
        updateObject(tracked_objects, i, x, y);
    } else {
        tracked_objects.push(Marker(session_id, fiducial_id, x, y));
    }
    
    // if there is a timeout, we remove the tracked object
    tracked_objects.forEach((obj) => {
        const diff = (new Date().getTime() - obj.updated) / 1000;
        // Max.dump("Diff", diff, "seconds", diff > timeout, " | ", obj.fiducial_id, obj.session_id, obj.count);
        if (diff > timeout){
            // remove object from tracked_objects
            Max.dump("Timeout reached", diff)
            removeObject(tracked_objects, obj.session_id, obj.fiducial_id);
        }
    });
    outputTrackedObjects(tracked_objects);
}

const handleRemoveObject = (session_id, fiducial_id) => {
    const i = findObject(tracked_objects, session_id, fiducial_id);
    if (i >= -1){
        tracked_objects[i].tracked = false;
        tracked_objects[i].count = 0;

        // if this object has only been visible for one frame, we discard it as a detection error
        if (tracked_objects[i].count === 1) {
            Max.dump("Removing due to low count", session_id, fiducial_id);
            removeObject(tracked_objects, session_id, fiducial_id);
        }
    }
}

// assumes that there is at most one instance of every fiducial_id
const findObject = (tracked_objects, session_id, fiducial_id) => {
    for (let i = 0; i < tracked_objects.length; i ++ ){
        if (tracked_objects[i].fiducial_id == fiducial_id) {
            return i
        }
    }
    return -1
}

const removeObject = (tracked_objects, session_id, fiducial_id) => {
    Max.dump("Deleting object", fiducial_id, session_id);
    const i = findObject(tracked_objects, session_id, fiducial_id);
    tracked_objects.splice(i, 1);
    return tracked_objects;
}

const updateObject = (tracked_objects, index, x, y) => {
    tracked_objects[index].tracked = true;
    tracked_objects[index].x = x;
    tracked_objects[index].y = y;
    tracked_objects[index].updated = new Date().getTime();
    tracked_objects[index].count += 1;
}


// output format: [route x y], e.g. [0 0.47123 0.95322]
// NB: route is zero-indexed
const outputTrackedObjects = (tracked_objects) => {
    const valid_objects = tracked_objects.filter(obj => obj.tracked);
    if (valid_objects.length >= 3){
        let i = 0;
        valid_objects
            .sort((a, b) => { a.created - b.created }) // sort by creation time
            .slice(0, 3) // we only want the three eldest
            .forEach( (obj) => {
                routeXY(i, obj.x, obj.y);
                i++;
            });

    } else if (valid_objects.length == 2){
        let i = 0;
        valid_objects
            .sort((a, b) => { a.created - b.created }) // sort by creation time
            .forEach( (obj) => {
                routeXY(i, obj.x, obj.y);
                i++;
            })
        routeXY(i, valid_objects[0].x, valid_objects[0].y) // mirror of first output (0 == 2)
        
        
    } else if (valid_objects.length == 1) {
        const obj = valid_objects[0]
        routeXY(0, obj.x, obj.y);
        routeXY(1, obj.x, obj.y);
        routeXY(2, obj.x, obj.y);
    }
    return
}

const routeXY = (route, x, y) => {
    return Max.outlet(route, parseInt(map(x, 0, 1, 0, 127)), parseInt(map(y, 0, 1, 0, 127)))
}

const map = (value, a, b, c, d) => (value - a) * (d - c) / (b - a) + c;

