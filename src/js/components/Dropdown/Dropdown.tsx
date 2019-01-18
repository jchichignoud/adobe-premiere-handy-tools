import * as React from "react";
import "./Dropdown.scss";
import "./List/List"
import List from "./List/List";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface DropdownProps {
  options: any
}

interface DropdownState {
  selection: number,
  isOpen: boolean

}

export default class Dropdown extends React.Component<DropdownProps, DropdownState> {
  constructor(props) {
    super(props);
    this.state = {
      selection: null,
      isOpen: false
    };
  }

  toggleList = () => {
    this.setState(prevState => ({
      isOpen: !prevState.isOpen
    }
  ))};

  handleSelection = id => {
    this.setState({ selection: id, isOpen: false });
  };

  render() {
    return (
      <div className="dropDownContainer">
        <div
          className={[
            "header",
            this.state.isOpen ? "open" : undefined
          ].join(" ")}
          onClick={this.toggleList}
        >
          <div className="headerTitle">
            {this.props.options[this.state.selection] || "Select an option"}
          </div>
          <FontAwesomeIcon icon="chevron-down" />
        </div>
        {this.state.isOpen ? (
          <List
            items={this.props.options}
            selection={this.state.selection}
            selectionHandler={this.handleSelection}
          />
        ) : null}
      </div>
    );
  };
}
