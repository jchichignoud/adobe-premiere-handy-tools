import * as React from "react";

import "./Box.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface BoxProps {
  title: string,
  collapsible?: boolean,
}

interface BoxState {
  isCollapsed: boolean
}

export default class Box extends React.Component<BoxProps, BoxState> {
  constructor(props) {
    super(props);
    this.state = {
      isCollapsed: false
    };
  }

  toggleBox = () => {
    this.setState(prevState => ({
      isCollapsed: !prevState.isCollapsed
    }
    ))
  };
  render(){
    if(this.props.title && this.props.collapsible) {
      return (
        <div className={this.state.isCollapsed? "boxCollapsed" : "box"}>
          <div className="boxTitle" onClick={this.toggleBox}><FontAwesomeIcon className="icon" icon={this.state.isCollapsed? "chevron-right" : "chevron-down"} />{this.props.title}</div>
          {!this.state.isCollapsed? this.props.children : null}
        </div>
      );
    } else if (this.props.title) {
      return (
        <div className="box">
          <div className="boxTitle">{this.props.title}</div>
          {this.props.children}
        </div>
      );
    } else {
      return <div className="box">{this.props.children}</div>;
    }
  }
  
};

// Box.defaultProps = {
//   collapsible: false
//  }
