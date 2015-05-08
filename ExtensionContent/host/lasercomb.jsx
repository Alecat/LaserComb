﻿#include "staging.jsx"#include "geometryHelpers.jsx"#include "pathItemHelpers.jsx"create(6*ptPerMm,6*ptPerMm, 3*ptPerMm, .1*ptPerMm, true, false);//restoreEdgeFromPoint();function create(toothwidth, gapwidth, toothheight, kerf,inverse, pathsAnticlockwise) {    if ( app.documents.length > 0 ) {        if (!checkParams(toothwidth, gapwidth, toothheight, kerf)) {            alert("All heights and lengths must be greater than 0");            return;        }                var selected = app.activeDocument.selection;        var direction = [selected.length];        for (i=0; i< selected.length; i++) {            var wasClosed = selected[i].closed;            selected[i].closed = true;            direction[i] = selected[i].area > 0;            selected[i].closed = wasClosed;        }        var selectedInfo = checkSelected(selected, direction);        if (selectedInfo.length == selected.length) {            for (i = 0;i < selected.length ; i++) {                addFingerJointsToLine(selected[i], selectedInfo[i], toothwidth, gapwidth, toothheight, kerf, i % 2 != inverse ? 1 : 0, direction[i] );            }        }    }}function checkParams(toothwidth, gapwidth, toothheight, kerf) {    for(var i=0;i<arguments.length;i++) {        if (arguments[i] <= 0) {            return false;        }    }    return true;}function checkSelected(selected, direction) {    var pathInfo = [];    if (selected.length > 0) {        if (selected.length > 2) {            alert("Please select no more than two segments.");            return pathInfo;        }        var lastLength = 0;        for (i = 0;i < selected.length ; i++) {            if (selected[i].selectedPathPoints.length != 2) {                alert("Please select segments between two anchors. Make sure only one segment per path is selected.");                return pathInfo;            }            selectionInfo = calculatePathInfo(selected[i], direction[i]);            if (selectionInfo == false) {                alert("Please select segments between two anchors");                return pathInfo;            }            var roundedLength =round(selectionInfo.length, 1);            if (lastLength != 0 && lastLength != roundedLength) {                alert("Please select segments with the same length\n" + lastLength + "\n" + roundedLength);                return pathInfo;            }            lastLength = round(selectionInfo.length,1);            pathInfo.push(selectionInfo);        }    }    return pathInfo;}function calculateOffsetsForTeeth(teeth, pathInfo, toothWidth, gapwidth, toothHeight, kerf, inverse, clockwise) {    var totalToothWidth = (teeth)*(toothWidth+gapwidth)-gapwidth;    var startHeight = toothHeight + kerf;    startHeight = clockwise ? startHeight : -1*startHeight;    var offset = (pathInfo.length - totalToothWidth) / 2;    var inverseOffset = 0;    if (inverse) {        var tan = round(Math.tan(pathInfo.angle),0);        if (tan) {            inverseOffset= (startHeight) / tan;        }        offset += inverseOffset;    }    return { offset: offset, inverseOffset: inverseOffset, startHeight: startHeight};}function getTeethForLength(pathInfo, toothHeight, toothWidth, gapwidth) {    // minus height*2 to allow material thickness to be spared from teeth    return teeth = Math.floor((pathInfo.length-toothHeight*2)/ (toothWidth+gapwidth));        // based on angle of line - we may want to allow more room on the edges}// adds squared finger joints to the selected line segmentfunction addFingerJointsToLine(selection, pathInfo, toothWidth, gapwidth, toothHeight, kerf, inverse, clockwise) {        var teeth = getTeethForLength(pathInfo, toothHeight, toothWidth, gapwidth);    if (teeth < 1) {        return;    }    var offsets = calculateOffsetsForTeeth(teeth, pathInfo, toothWidth, gapwidth, toothHeight, kerf, inverse, clockwise);    var allPoints = selection.pathPoints;    var newPathPoints = [];    for (var i=0;i<allPoints.length;i++) {        var point = allPoints[i];        if (inverse && (anchorsEqual(allPoints[i].anchor, pathInfo.leftPoint.anchor) || anchorsEqual(allPoints[i].anchor, pathInfo.rightPoint.anchor))) {            // at start or end of edge - calculate point            if (inverse) {                var offsetCorner = calculatePoint(point, pathInfo.angle, offsets.inverseOffset, offsets.startHeight);                // get next point                var isLeft = anchorsEqual(allPoints[i].anchor, pathInfo.rightPoint.anchor);                var cornerPoint = isLeft ? pathInfo.leftPoint : pathInfo.rightPoint;                var nextIndex = nextPointIndex(i, isLeft, allPoints, selection.closed);                if (nextIndex !== null) {                    var nextPoint = allPoints[nextIndex];                    var pointToNext = bearingToAnchor(nextPoint.anchor, allPoints[i].anchor);                                               var newAnchor = pathIntersect(offsetCorner, nextPoint.anchor, pathInfo.angle, pointToNext.angle);                    if (newAnchor !== null) {                        newPathPoints.push(newAnchor);                    }                }                else {                    newPathPoints.push(offsetCorner);                }            }            else {                newPathPoints.push(calculatePoint(point, pathInfo.angle, offsets.inverseOffset, offsets.startHeight));            }        }        else {            newPathPoints.push(point.anchor);        }        if (anchorsEqual(point.anchor, pathInfo.leftPoint.anchor)) {            // add all of the intermediate points            for (j=0; j<teeth; j++) {                drawTooth(newPathPoints, inverse, clockwise, pathInfo.leftPoint, pathInfo.angle, offsets.offset, j, toothWidth, gapwidth, toothHeight, kerf);            }        }    }    selection.setEntirePath(newPathPoints);}function drawTooth(pathPoints, inverse, clockwise, lineStart, lineAngle, offset, index, width, gapwidth, height, kerf) {    var toothStart = offset + index*(width+gapwidth);    var toothEnd = toothStart+width;    if (inverse) {        toothStart -= kerf/2;        toothEnd += kerf/2;    }    else {        toothStart += kerf/2;        toothEnd -= kerf/2;    }        var toothHeight = inverse ? height+kerf : 0;    var gapHeight = inverse ? 0 : height+kerf;    if ( !clockwise) {        toothHeight = 0-toothHeight;        gapHeight = 0 - gapHeight;    }    pathPoints.push(calculatePoint(lineStart, lineAngle, toothStart, toothHeight));    pathPoints.push(calculatePoint(lineStart, lineAngle, toothStart, gapHeight));    pathPoints.push(calculatePoint(lineStart, lineAngle, toothEnd, gapHeight));    pathPoints.push(calculatePoint(lineStart, lineAngle, toothEnd, toothHeight));}function calculatePoint(origin, angle, along, notch) {    var arr = [];    arr.push(origin.anchor[0]+Math.cos(angle)*along + Math.sin(angle)*notch);    arr.push(origin.anchor[1]+Math.sin(angle)*along - Math.cos(angle)*notch);    return arr;}function restoreEdgeFromPoint() {    //Find the angle between every point from the start point.    //The first instance of a repeated angle should represent the angle along with which the edge is aligned    if (selection.length == 0) {        return;    }    var pathItem = selection[0];    var pathPoints= pathItem.selectedPathPoints;    var allPP = pathItem.pathPoints;    if (allPP.length < 2) {        return;    }    var startPoint = getFirstSelectedPoint(pathPoints);    //var ellipse = app.activeDocument.layers[0].pathItems.star(startPoint.anchor[0], startPoint.anchor[1], 5, 2, 5 );    var allPoints = [];    for (var i=0;i<allPP.length;i++){        allPoints.push(allPP[i]);    }    var startIndex = allPoints.contains(startPoint);    var backwardsAngle = false;    var angle = searchForAngle(startIndex, allPoints, true, pathItem);    if (angle.angle === null) {        backwardsAngle = true;        angle = searchForAngle(startIndex, allPoints, false, pathItem);    }    if (angle.angle === null) {        return;    }    // search again to find all points, forwards and backwards, that match the angle we found.    var linePoints = [];    if (startIndex > 0 && startIndex < allPoints.length-1) {        linePoints.push(startPoint);    }    var replacements = {};    // search forwards    var dirs = [true, false];    for (var k=0;k<2;k++) {        forwards = dirs[k];        var lookBack = (forwards && !backwardsAngle) || (!forwards && backwardsAngle) ;        var lastPoint = startPoint;        var i = startIndex;        var j = 0;        i = nextPointIndex(i, forwards, allPoints, pathItem.closed);        while(i !== startIndex && i !== null) {            var pointToPrevious;            pointToPrevious = forwards ? bearingToAnchor(allPoints[i].anchor, lastPoint.anchor) : bearingToAnchor(lastPoint.anchor, allPoints[i].anchor);                        var compIndex = lookBack ? j % 4 : 3 - (j %4);            // Are the angles following the correct sequence?            if(compareNumWithMargin(pointToPrevious.angle, angle.anglesDiff[compIndex],6)) {                // Are the lengths following the correct sequence?                if ( compareNumWithMargin(pointToPrevious.length, angle.lengthsDiff[compIndex], 6)) {                    forwards ? linePoints.push(allPoints[i]) : linePoints.unshift(allPoints[i]);                }                else {                    var pointToStart = forwards ? bearingToAnchor(allPoints[i].anchor, startPoint.anchor) : bearingToAnchor(startPoint.anchor, allPoints[i].anchor);                    var nextIndex = nextPointIndex(i, forwards, allPoints, pathItem.closed);                    // from the end point to the start point - draw a line. If this line isn't the same angle as the angle of the edge we're restoring, we need to adjust the end points                    if (!compareNumWithMargin(pointToStart.angle, angle.angle, 6)) {                        if (nextIndex !== null) {                            // take into account angle to point after this one to calculate our corner point                            var nextPoint = allPoints[nextIndex];                            var pointToNext = !forwards ? bearingToAnchor(nextPoint.anchor, allPoints[i].anchor) : bearingToAnchor(allPoints[i].anchor, nextPoint.anchor);                                                        var replacementAnchor = pathIntersect(startPoint.anchor, nextPoint.anchor, angle.angle, pointToNext.angle);                            if (replacementAnchor !== null) {                                replacements[i] = replacementAnchor;                            }                        }                        else {                            // if there are no points after this, just account for the tooth protrusion                            var newx = allPoints[i].anchor[0] + Math.cos(angle.toothAngle)*angle.toothHeight;                            var newy = allPoints[i].anchor[1] + Math.sin(angle.toothAngle)*angle.toothHeight;                            replacements[i] = [newx, newy];                        }                    }                    break;                }            }            else {                break;            }            lastPoint = allPoints[i];            i = nextPointIndex(i, forwards, allPoints, pathItem.closed);            j++;        }    }    var newPathPoints = [];    for (var i=0;i<allPoints.length;i++) {        if (i in replacements) {            newPathPoints.push(replacements[i]);        }        else if (linePoints.contains(allPoints[i]) === false) {            newPathPoints.push(allPoints[i].anchor);        }    }        pathItem.setEntirePath(newPathPoints);    return angle.angle;}function searchForAngle(startIndex, allPoints, searchForwards, pathItem) {    var startPoint = allPoints[startIndex];    var angles = [];    var lengthsDiff = [];    var anglesDiff = [];    var i = startIndex;    i = nextPointIndex(i, searchForwards, allPoints, pathItem.closed);    var lastPoint = startPoint;    var angle = null;    var toothHeight = null;    var toothAngle = null;    while(angles.length < 4 && angle === null && i !== null) {        var pointToStart = searchForwards ? bearingToAnchor(allPoints[i].anchor, startPoint.anchor) : bearingToAnchor(startPoint.anchor, allPoints[i].anchor);        var pointToPrevious = searchForwards ? bearingToAnchor(allPoints[i].anchor, lastPoint.anchor) : bearingToAnchor(lastPoint.anchor, allPoints[i].anchor);        if (angle === null && angles.containsNumWithMargin(pointToStart.angle, 6) !== false) {            angle = pointToStart.angle;        }        // Within four points: If a length is repeated then it is the height of the tooth. However it can't be the immediately prior point.        if (lengthsDiff.length >= 2 && toothHeight === null) {            var lengthIndex = lengthsDiff.slice(0, lengthsDiff.length - 1).contains(pointToPrevious.length);            if (lengthIndex !== false) {                toothHeight = pointToPrevious.length;                toothAngle = pointToPrevious.angle;            }        }        angles.push(pointToStart.angle);        lengthsDiff.push(pointToPrevious.length);        anglesDiff.push(pointToPrevious.angle);        var lastPoint = allPoints[i];        i = nextPointIndex(i, searchForwards, allPoints, pathItem.closed);    } // we should find the angle within four points     if (!searchForwards) {        toothAngle += Math.PI;    }    // Now look to see if the next point is along the path - if not, forget it, we're at a corner    if (i !== null) {        var pointToPrevious = searchForwards ? bearingToAnchor(allPoints[i].anchor, lastPoint.anchor) : bearingToAnchor(lastPoint.anchor, allPoints[i].anchor);        // angle should be the same as the first angle was to the startPoint        if (!compareNumWithMargin(angles[0], pointToPrevious.angle, 6) || !compareNumWithMargin(lengthsDiff[0], pointToPrevious.length, 6)) {            return { angle: null, toothHeight: null, toothAngle: null, lengthsDiff: [], anglesDiff: []};        }    }    return { angle : angle, toothHeight: toothHeight, toothAngle: toothAngle, lengthsDiff: lengthsDiff, anglesDiff: anglesDiff};}