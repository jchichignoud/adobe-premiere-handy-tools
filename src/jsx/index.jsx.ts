import { id } from "../shared";

function showAlert() {
  alert(`Alert from Extendscript.\n${new Date().toString()}`);
}

function getInfo() {
  return JSON.stringify({
    id,
    name: app.getAppPrefPath,
    version: app.version
  });
}

$.global[id] = {
  showAlert,
  getInfo
};


$._PPRO_ = {
  buttonClick : function () {
    alert("you clicked a button!")
  },
}