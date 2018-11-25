$(document).ready(function () {
    
    $("#content").on("click", "#btn_duplicate", function (e) {
        e.preventDefault();
        var csInterface = new CSInterface();
        csInterface.evalScript('$._PPRO_.duplicateActive()', returnCallback);
    });

    $("#content").on("click", "#btn_proxiesonly", function (e) {
        e.preventDefault();
        var csInterface = new CSInterface();
        csInterface.evalScript('$._PPRO_.setOfflineWhenProxied(app.project.rootItem)', returnCallback);
    });

    $("#content").on("click", "#btn_monitorimport", function (e) {
        e.preventDefault();
        var csInterface = new CSInterface();
        csInterface.evalScript('$._PPRO_.registerItemAddedFxn()', toggleMonitor);
    });

    $("#content").on("click", "#btn_snapshot", function (e) {
        e.preventDefault();
        var csInterface = new CSInterface();
        csInterface.evalScript("$._PPRO_.snapshotSequence('" + getCurrentTime() + "')", returnCallback);
      });

      $("#content").on("click", "#btn_snapshotnavigator", function (e) {
        e.preventDefault();
        var csInterface = new CSInterface();
        csInterface.evalScript("$._PPRO_.snapshotNavigator()", returnCallback);
      });

      $("#content").on("click", "#btn_fill", function (e) {
        e.preventDefault();
        var csInterface = new CSInterface();
        csInterface.evalScript('$._PPRO_.fillFrame()', returnCallback);
    });

    function returnCallback (r) {
        // alert(r)
    };


    function toggleProxies (r) {
        if (r) {
            $("#btn_proxiesonly").addClass("active");
        } else {
            $("#btn_proxiesonly").removeClass("active");
        }
    }

    function toggleMonitor (r) {
        if (r) {
            $("#btn_monitorimport").addClass("active");
        } else {
            $("#btn_monitorimport").removeClass("active");
        }
    }
})