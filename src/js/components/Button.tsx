import * as React from "react";
import "./Button.scss";
import { evalExtendscript } from "cep-interface";

// const button = props => {


//   return (
//     <button
//       disabled={props.disabled}
//       className={[(props.highlight ? "highlight" : undefined), 
//         props.wide ? "wide" : undefined]
//         .join(' ')}
//       onClick={handleClick}
//     >
//       {props.children}
//     </button>
//   );
// };

// export default button;

interface ButtonProps {
  trigger: string,
  disabled?: boolean;
  wide?: boolean,
  highlight?: boolean
}

const Button: React.SFC<ButtonProps> = (props) => {
  
  let handleClick = () => {evalExtendscript(`$._PPRO_.${props.trigger}()`)}

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

Button.defaultProps = {
  disabled: false,
  wide: false,
  highlight: false
 }

export default Button