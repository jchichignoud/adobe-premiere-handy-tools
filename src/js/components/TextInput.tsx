import * as React from "react";
import "./TextInput.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface InputProps {
}

interface InputState {
  value: string,
  focused: boolean

}

class TextInput extends React.Component<InputProps, InputState> {
  private textInput: React.RefObject<HTMLInputElement>;
  constructor(props) {
    super(props);
    this.state = { value: "", focused: false };
    this.textInput = React.createRef();
  }

  handleChange = event => {
    this.setState({ value: event.target.value });
  };

  focusTextInput = () => {
    this.textInput.current.focus();
  };

  onBlur = () => {
    this.setState({ focused: false });
  };
  onFocus = () => {
    this.setState({ focused: true });
  };

  clearInput = e => {
    e.stopPropagation();
    this.setState({ value: "", focused: false });
  };

  render() {
    return (
      <div
        className={[
          "container",
          this.state.focused ? "activated" : undefined
        ].join(" ")}
        onClick={this.focusTextInput}
      >
        <FontAwesomeIcon
          icon="search"
          flip="horizontal"
          className={
            this.state.value || this.state.focused ? "blue" : undefined
          }
        />
        <input
          ref={this.textInput}
          type="text"
          value={this.state.value}
          onChange={this.handleChange}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
        />
        {this.state.value ? (
          <div onClick={this.clearInput}>
            <FontAwesomeIcon icon="times" />
          </div>
        ) : (
            ""
          )}
      </div>
    );
  }
}

export default TextInput;
