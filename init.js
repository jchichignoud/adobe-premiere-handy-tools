function onLoaded() {

	
	var csInterface = new CSInterface();

	var appName = csInterface.hostEnvironment.appName;

	var appVersion = csInterface.hostEnvironment.appVersion;

	var APIVersion = csInterface.getCurrentApiVersion();

	var caps = csInterface.getHostCapabilities();

	loadJSX();

	loadButtons(appName, appVersion);

	updateThemeWithAppSkinInfo(csInterface.hostEnvironment.appSkinInfo);


	// Update the color of the panel when the theme color of the product changed.
	csInterface.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, onAppThemeColorChanged);
	// Listen for event sent in response to rendering a sequence.
	csInterface.addEventListener("com.adobe.csxs.events.PProPanelRenderEvent", function(event){
		alert(event.data);
	});

	// csInterface.addEventListener("com.adobe.csxs.events.WorkspaceChanged", function(event){
	// 	alert("New workspace selected: " + event.data);
	// });

	// csInterface.addEventListener("com.adobe.ccx.start.handleLicenseBanner", function(event){
	// 	alert("User chose to go \'Home\', wherever that is...");
	// });

	// csInterface.addEventListener("ApplicationBeforeQuit", function(event){
	// 	csInterface.evalScript('$._PPRO_.closeLog()');
	// });

	

	// register for messages
	VulcanInterface.addMessageListener(
	    VulcanMessage.TYPE_PREFIX + "com.DVA.message.sendtext",
	    function(message) {
	        var str = VulcanInterface.getPayload(message);
	        // You just received the text of every Text layer in the current AE comp.
	    }
	);
	// csInterface.evalScript('$._PPRO_.getVersionInfo()', myVersionInfoFunction);	
	// csInterface.evalScript('$._PPRO_.getActiveSequenceName()', myCallBackFunction);		
	csInterface.evalScript('$._PPRO_.getUserName()', myUserNameFunction);  
	// csInterface.evalScript('$._PPRO_.registerProjectPanelSelectionChangedFxn()');  	// Project panel selection changed
	// csInterface.evalScript('$._PPRO_.registerItemAddedFxn()');					  	// Item added to project
	// csInterface.evalScript('$._PPRO_.registerProjectChangedFxn()');					// Project changed
	// csInterface.evalScript('$._PPRO_.registerSequenceSelectionChangedFxn()');		// Selection within the active sequence changed

	csInterface.evalScript('$._PPRO_.confirmPProHostVersion()');
}


/**
 * Update the theme with the AppSkinInfo retrieved from the host product.
 */

function updateThemeWithAppSkinInfo(appSkinInfo) {

	//Update the background color of the panel

	var panelBackgroundColor = appSkinInfo.panelBackgroundColor.color;
	document.body.bgColor = toHex(panelBackgroundColor);

	var styleId 			= "ppstyle";
	var gradientBg			= "background-image: -webkit-linear-gradient(top, " + toHex(panelBackgroundColor, 40) + " , " + toHex(panelBackgroundColor, 10) + ");";
	var gradientDisabledBg	= "background-image: -webkit-linear-gradient(top, " + toHex(panelBackgroundColor, 15) + " , " + toHex(panelBackgroundColor, 5) + ");";
	var boxShadow			= "-webkit-box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 1px 1px rgba(0, 0, 0, 0.2);";
	var boxActiveShadow		= "-webkit-box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.6);";
		 
	var isPanelThemeLight	= panelBackgroundColor.red > 50; // choose your own sweet spot
		 
		var fontColor, disabledFontColor;
		var borderColor;
		var inputBackgroundColor;
		var gradientHighlightBg;

		if(isPanelThemeLight) {
			fontColor				= "#000000;";
			disabledFontColor		= "color:" + toHex(panelBackgroundColor, -70) + ";";
			borderColor				= "border-color: " + toHex(panelBackgroundColor, -90) + ";";
			inputBackgroundColor	= toHex(panelBackgroundColor, 54) + ";";
			gradientHighlightBg		= "background-image: -webkit-linear-gradient(top, " + toHex(panelBackgroundColor, -40) + " , " + toHex(panelBackgroundColor,-50) + ");";
		} else {
			fontColor				= "#ffffff;";
			disabledFontColor		= "color:" + toHex(panelBackgroundColor, 100) + ";";
			borderColor				= "border-color: " + toHex(panelBackgroundColor, -45) + ";";
			inputBackgroundColor	= toHex(panelBackgroundColor, -20) + ";";
			gradientHighlightBg		= "background-image: -webkit-linear-gradient(top, " + toHex(panelBackgroundColor, -20) + " , " + toHex(panelBackgroundColor, -30) + ");";
		}
	
		//Update the default text style with pp values

		addRule(styleId, ".default", "font-size:" + appSkinInfo.baseFontSize + "px" + "; color:" + fontColor + "; background-color:" + toHex(panelBackgroundColor) + ";");
		addRule(styleId, "button, select, input[type=text], input[type=button], input[type=submit]", borderColor);	   
		addRule(styleId, "p", "color:" + fontColor + ";");	  
		addRule(styleId, "button", "font-family: " + appSkinInfo.baseFontFamily + ", Arial, sans-serif;");	  
		addRule(styleId, "button", "color:" + fontColor + ";");	   
		addRule(styleId, "button", "font-size:" + (1.2 * appSkinInfo.baseFontSize) + "px;");	
		addRule(styleId, "button, select, input[type=button], input[type=submit]", gradientBg);	
		addRule(styleId, "button, select, input[type=button], input[type=submit]", boxShadow);
		addRule(styleId, "button:enabled:active, input[type=button]:enabled:active, input[type=submit]:enabled:active", gradientHighlightBg);
		addRule(styleId, "button:enabled:active, input[type=button]:enabled:active, input[type=submit]:enabled:active", boxActiveShadow);
		addRule(styleId, "[disabled]", gradientDisabledBg);
		addRule(styleId, "[disabled]", disabledFontColor);
		addRule(styleId, "input[type=text]", "padding:1px 3px;");
		addRule(styleId, "input[type=text]", "background-color: " + inputBackgroundColor + ";");
		addRule(styleId, "input[type=text]:focus", "background-color: #ffffff;");
		addRule(styleId, "input[type=text]:focus", "color: #000000;");
}

function addRule(stylesheetId, selector, rule) {
	var stylesheet = document.getElementById(stylesheetId);
	
	if (stylesheet) {
		stylesheet = stylesheet.sheet;
		if( stylesheet.addRule ){
				stylesheet.addRule(selector, rule);
		} else if( stylesheet.insertRule ){
			stylesheet.insertRule(selector + ' { ' + rule + ' }', stylesheet.cssRules.length);
		}
	}
}

function reverseColor(color, delta) {
	return toHex({red:Math.abs(255-color.red), green:Math.abs(255-color.green), blue:Math.abs(255-color.blue)}, delta);
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

		computedValue = Math.round(computedValue).toString(16);
		return computedValue.length == 1 ? "0" + computedValue : computedValue;
	}

	var hex = "";
	if (color) {
		hex = computeValue(color.red, delta) + computeValue(color.green, delta) + computeValue(color.blue, delta);
	}
	return "#" + hex;
}

function onAppThemeColorChanged(event) {
	// Should get a latest HostEnvironment object from application.
	var skinInfo = JSON.parse(window.__adobe_cep__.getHostEnvironment()).appSkinInfo;
	// Gets the style information such as color info from the skinInfo, 
	// and redraw all UI controls of your extension according to the style info.
	updateThemeWithAppSkinInfo(skinInfo);
} 

/**
* Load buttons based on the ./settings/buttons.json file, according to host app and app version
*/

function loadButtons(app, version) {
	var isDev = false;
	var csInterface = new CSInterface();
	
	// temporary dev switch, will add a preference for it later
	csInterface.evalScript('$._PPRO_.getUserName()', function(user){
		if(user == "jchichignoud"){
			isDev = true;
		}
	});

	$.getJSON("./settings/buttons.json", function(buttons) {
		buttons.forEach(function(button){
			// check if button works with app and version of app
			if ((app == button.app) && (button.version[0] <= parseFloat(version)) && (parseFloat(version) <= button.version[1])){
				// enable dev buttons
				if (!button.dev || isDev){
					var html = `<button id="btn_${button.id}" class="btn" title=${button.blurb}>${button.label}</button>`
					$( "#content" ).append(html);
				}
			}
		})	
	}).then(function(){
		// load reload button for development purposes
		if(isDev){
			$( "#content" ).append('<button id="btn_reload" class="btn" onClick="location.reload(true)">Reload</button>')
		}
		
	})
	
}

/**
* Load JSX file into the scripting context of the product. All the jsx files in 
* folder [ExtensionRoot]/jsx & [ExtensionRoot]/jsx/[AppName] will be loaded.
*/

function loadJSX() {
	var csInterface = new CSInterface();

	// get the appName of the currently used app. For Premiere Pro it's "PPRO"
	var appName = csInterface.hostEnvironment.appName;
	var extensionPath = csInterface.getSystemPath(SystemPath.EXTENSION);
	
	// load general JSX script independent of appName
	var extensionRootGeneral = extensionPath + '/jsx/';
	csInterface.evalScript('$._INIT_.evalFiles("' + extensionRootGeneral + '")');

	// load JSX scripts based on appName
	var extensionRootApp = extensionPath + '/jsx/' + appName + '/';
	csInterface.evalScript('$._INIT_.evalFiles("' + extensionRootApp + '")');
}

function evalScript(script, callback) {
	new CSInterface().evalScript(script, callback);
}

function getCurrentTime() {
	var today = new Date();
	var yyyy = padDigit(today.getFullYear());
	var mo = padDigit(today.getMonth() + 1);
	var dd = padDigit(today.getDate());
	var hh = padDigit(today.getHours());
	var mi = padDigit(today.getMinutes());
  
	function padDigit(number) {
	  if (number < 10) {
		return ("0" + number);
	  } else {
		return number.toString();
	  }
	}
  
	return (yyyy + mo + dd + "_" + hh + mi);
  }
