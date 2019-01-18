import * as React from "react";

import "./Bar.scss";

interface BarProps {
  isVertical?: boolean;
  justifyContent?: "flex-start" | "flex-end" | "center";
}

const Bar: React.SFC<BarProps> = (props) => {
  return <div className="bar">{props.children}</div>
};

Bar.defaultProps = {
  isVertical: true, // This value is adopted when name prop is omitted.
  justifyContent: "flex-start"
 }

export default Bar;

