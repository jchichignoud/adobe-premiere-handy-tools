import * as React from "react";


import "../variables.scss";
import "../../fonts/adobe-clean.css";
import "./App.scss"
import { library } from "@fortawesome/fontawesome-svg-core";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
library.add(faSearch, faTimes, faCheck, faChevronDown, faChevronRight);

import Panel from "./Panel";
import Button from "../components/Button"


import AdobeAppInfo from "../components/AdobeAppInfo";
import LogInfo from "../components/LogInfo";

export default class App extends React.Component {
  render() {
    return (
      <div className="App">
        <Panel />
        
      </div>
    );
  }
}
