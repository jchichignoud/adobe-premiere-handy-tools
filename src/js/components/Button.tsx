import * as React from "react";
import "./Button.scss";
import { evalExtendscript } from "cep-interface";

let handleClick = () => {evalExtendscript(`$._PPRO_.buttonClick()`)}

const button = props => {


  return (
    <button
      disabled={props.disabled}
      className={[(props.highlight ? "highlight" : undefined), 
        props.wide ? "wide" : undefined]
        .join(' ')}
      onClick={handleClick}
    >
      {props.children}
    </button>
  );
};

export default button;
