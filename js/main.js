/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager*/

(function() {
  "use strict";

  var csInterface = new CSInterface();

  function init() {
    themeManager.init();

    $("#btn_duplicate").click(function() {
      csInterface.evalScript("duplicateActive()");
    });

    $("#btn_fill").click(function() {
      csInterface.evalScript("fillFrame()");
    });

    $("#btn_snapshot").click(function() {
      csInterface.evalScript("snapshotSequence('" + getCurrentTime() + "', '" + prompt("Your notes here") + "')");
      csInterface.evalScript("removeProject('" + projectID + "')")
    });
  }

  init();
})();

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
