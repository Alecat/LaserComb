function onLoaded() {
    var csInterface = new CSInterface();

    updateThemeWithAppSkinInfo(csInterface.hostEnvironment.appSkinInfo);
    // Update the color of the panel when the theme color of the product
    // changed.
    csInterface.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT,
	    onAppThemeColorChanged);

    // Listen vulcan message
    var eventType = new SuiteMessageEvent(SuiteMessageEvent.TYPE
	    + ".HelloCSComm").type;
    VulcanInterface.addEventListener(eventType, function(event) {
	alert("Received:" + event.getPayload());
    });
}

/* Update the theme with the AppSkinInfo retrieved from the host product. */
function updateThemeWithAppSkinInfo(appSkinInfo) {
    // console.log(appSkinInfo)
    var panelBgColor = appSkinInfo.panelBackgroundColor.color;
    var bgdColor = toHex(panelBgColor);

    var fontColor = "#F0F0F0";
    var isLight = panelBgColor.red > 122;
    if (isLight) {
	fontColor = "#000000";
	$("#theme").attr("href", "css/light.css");
    } else {
	bgdColor = "#494949";
	$("#theme").attr("href", "css/dark.css");
    }
    var styleId = "ppstyle";
    document.body.bgColor = bgdColor;
    addRule(styleId, "input select", "background-color:" + toHex(panelBgColor) + ";");
    addRule(styleId, "body", "background-color:" + bgdColor + ";");
    addRule(styleId, "body", "color:" + fontColor + ";");
//    addRule(styleId, "body", "font-size:" + appSkinInfo.baseFontSize + "px;");
}

function addRule(stylesheetId, selector, rule) {
    var stylesheet = document.getElementById(stylesheetId);

    if (stylesheet) {
	stylesheet = stylesheet.sheet;
	if (stylesheet.addRule) {
	    stylesheet.addRule(selector, rule);
	} else if (stylesheet.insertRule) {
	    stylesheet.insertRule(selector + ' { ' + rule + ' }',
		    stylesheet.cssRules.length);
	}
    }
}

/**
 * Convert the Color object to string in hexadecimal format;
 */
function toHex(color, delta) {
    function computeValue(value, delta) {
	var computedValue = !isNaN(delta) ? value + delta : value;
	if (computedValue < 0) {
	    computedValue = 0;
	} else if (computedValue > 255) {
	    computedValue = 255;
	}

	computedValue = computedValue.toString(16);
	return computedValue.length == 1 ? "0" + computedValue : computedValue;
    }

    var hex = "";
    if (color) {
	with (color) {
	    hex = computeValue(red, delta) + computeValue(green, delta)
		    + computeValue(blue, delta);
	}
	;
    }
    return "#" + hex;
}

function onAppThemeColorChanged(event) {
    var skinInfo = JSON.parse(window.__adobe_cep__.getHostEnvironment()).appSkinInfo;
    updateThemeWithAppSkinInfo(skinInfo);
}

function sendVulcanMessage(message) {
    var event = new SuiteMessageEvent(SuiteMessageEvent.TYPE + ".HelloCSComm");
    event.setPayload(message);
    VulcanInterface.dispatchEvent(event);
}