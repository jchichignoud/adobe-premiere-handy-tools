import * as React from "react";

import Box from "../containers/Box";
import Bar from "../containers/Bar";

import Button from "../components/Button";
import TextInput from "../components/TextInput";
import Dropdown from "../components/Dropdown/Dropdown";
import Checkbox from "../components/Checkbox";
import AdobeAppInfo from "../components/AdobeAppInfo";
import Notes from "../components/Notes/Notes"

export default class Panel extends React.Component {

  render() {
    return [
      <Bar>
        <Button wide highlight trigger="duplicateActive">Duplicate Sequence</Button>
        <Button wide trigger="snapshotSequence">Sequence Snapshot</Button>
        <Button trigger="fillFrame">Fill Frame</Button>
      </Bar>,
      <Notes />
      // <Box title="Search" collapsible>
      //   <TextInput />
      // </Box>,
      // <Box title="Quick Export" collapsible>
      //   <Bar>
      //     <Dropdown
      //       options={[
      //         "Match Source - High Bitrate",
      //         "Youtube HD 1080p25",
      //         "Apple ProRes 422HQ"
      //       ]}
      //     />
      //     <Button trigger="duplicateActive">Export</Button>
      //   </Bar>
      // </Box>,
      // <Box title="Clean and export" collapsible>
      //   <Checkbox label="Audio tracks" />
      //   <Checkbox label="Adjustment layers" />
      //   <Checkbox label="Unsupported effects" />
      //   <Button trigger="duplicateActive" wide>Export XML</Button>
      // </Box>
    ];
  }
}
