﻿ptPerMm = (72 / 25.4);ptPerIn = 72;Array.prototype.contains = function(obj) {    var i = this.length;    while (i--) {        if (this[i].typename == "PathPoint") {            if(anchorsEqual(this[i].anchor, obj.anchor)) {                return i;            }        }        if (this[i] == obj) {            return i;        }    }    return false;}Array.prototype.containsAnchor = function(obj) {    var i = this.length;    while (i--) {        if(anchorsEqual(this[i], obj)) {            return i;        }    }    return false;}Array.prototype.containsNumWithMargin = function(obj, precision) {    var i = this.length;    while (i--) {        if (compareNumWithMargin(this[i],obj, precision)) {            return i;        }    }    return false;}function compareNumWithMargin(a,b,precision) {    var rounda = round(a, precision);    var roundb = round(b, precision);    if (rounda == roundb) {        return true;    }    // allow for decimal diffs    var margin = '1e-'+precision;    if (Math.abs(rounda) + margin >= Math.abs(roundb) && Math.abs(rounda) - margin <= Math.abs(roundb)) {        return true;    }    return false;}function pathPointsEqual(a, b) {    return anchorsEqual(a.anchor, b.anchor);}function anchorsEqual(a, b) {    if (a[0] == b[0] && a[1] == b[1]) {        return true;    }    return false;}function round(value, precision) {    return Number(Math.round(value*('1e'+precision))*('1e-'+precision));}