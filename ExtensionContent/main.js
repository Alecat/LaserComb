ptPerMm = (72 / 25.4);
ptPerIn = 72;

var point_conv = [72/25.4, 72, 1];

$(document).ready(function() {
    var csInterface = new CSInterface();

    $("#btn").click(function() {
	var width = $('#width').val() * point_conv[$('#width-units').val()];
	var gap = $('#gap').val() * point_conv[$('#gap-units').val()];
	var height = $('#height').val() * point_conv[$('#height-units').val()];
	var kerf = $('#kerf').val() * point_conv[$('#kerf-units').val()];
	
	var invert = $('#invert').val() == 0;
	
	csInterface.evalScript("create("+width+","+gap+","+height+","+kerf+","+invert+",false)");
    });

    $("#btn-reload").click(function() {
	location.reload();
    });
    $("#btn-restore").click(function() {
	csInterface.evalScript("restoreEdgeFromPoint()");
    });
    $("#btn-teeth-data").click(function() {
	csInterface.evalScript("alertTeethData()");
    });
});


function clean_units(units_string) {
    
    
}
function parse_units() {
    var re = /(\d+)\s*(mm|in|pt)/g;
    var str = "fee fi fo fum";
    var myArray = str.match(re);
    console.log(myArray);
}