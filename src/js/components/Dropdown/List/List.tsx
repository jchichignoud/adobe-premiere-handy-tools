import * as React from "react";

import "./List.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const list = props => {
  const listItems = props.items.map((item, i) => (
    <li
      key={i}
      className={props.selection === i ? "selected" : null}
      onClick={() => props.selectionHandler(i)}
    >
      {props.selection === i ? (
        <span className="">
          <FontAwesomeIcon icon="check" className='tick'/>
        </span>
      ) : null}
      {item}
    </li>
  ));

  return (
    <div className="list">
      <ul>{listItems}</ul>
    </div>
  );
};

export default list;
