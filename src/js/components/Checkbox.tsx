import * as React from "react";
import  "./Checkbox.scss";

interface CheckboxProps {
  label: string
}

interface CheckboxState {
  checked : boolean

}

class Checkbox extends React.Component<CheckboxProps, CheckboxState> {
  constructor(props) {
    super(props);
    this.state = { checked: false };
  }

  handleClick = event => {
    this.setState(prevState => ({
      checked: !prevState.checked
    }));
  };

  render() {
    return (
      <div className="labelledBox "onClick={this.handleClick}>
        <input
          className="checkbox"
          type="checkbox"
          checked={this.state.checked}
        />
        <label>{this.props.label}</label>
      </div>
    );
  }
}

export default Checkbox;
