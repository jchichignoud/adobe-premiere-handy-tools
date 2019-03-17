import { Editor, EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import * as React from "react";
import { evalExtendscript } from "cep-interface";

interface NotesProps {

}

interface NotesState {
    editorState: string;
}

export default class Notes extends React.Component<NotesProps, NotesState> {
    constructor(props) {
        super(props);
        this.state = { editorState: EditorState.createEmpty() };
    }

    onChange = editorState => {
        this.setState({ editorState })
        const rawContentState = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
        evalExtendscript(`$._PPRO_.setProjectNotes(${rawContentState})`)
    };

    async componentDidMount() {
        const savedProjectNotes = await evalExtendscript(`$._PPRO_.getProjectNotes()`)

        if (savedProjectNotes) {
            this.setState({ editorState: EditorState.createWithContent(convertFromRaw(savedProjectNotes)) })
        }

    };

    render() {
        return (
            <Editor editorState={this.state.editorState} onChange={this.onChange} />
        );
    }
}