import * as React from "react";

import Box from "../containers/Box";
import Bar from "../containers/Bar";

import Button from "../components/Button";
import TextInput from "../components/TextInput";
import Dropdown from "../components/Dropdown/Dropdown";
import Checkbox from "../components/Checkbox";
import AdobeAppInfo from "../components/AdobeAppInfo";

export default class Panel extends React.Component {

  render() {
    return [
      <Box title="Buttons" collapsible>
        <Button wide highlight>Duplicate Sequence</Button>
        <Button wide>Sequence Snapshot</Button>
        <Button disabled>Fill Frame</Button>
      </Box>,
      <Box title="Search" collapsible>
        <TextInput />
      </Box>,
      <Box title="Quick Export" collapsible>
        <Bar>
          <Dropdown
            options={[
              "Match Source - High Bitrate",
              "Youtube HD 1080p25",
              "Apple ProRes 422HQ"
            ]}
          />
          <Button>Export</Button>
        </Bar>
      </Box>,
      <Box title="Clean and export" collapsible>
        <Checkbox label="Audio tracks" />
        <Checkbox label="Adjustment layers" />
        <Checkbox label="Unsupported effects" />
        <Button wide>Export XML</Button>
      </Box>
    ];
  }
}
