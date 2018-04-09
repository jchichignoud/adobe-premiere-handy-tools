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
  }

  init();
})();