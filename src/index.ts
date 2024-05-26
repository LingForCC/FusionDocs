import { defaultKeymap } from '@codemirror/commands';
import { EditorState } from '@codemirror/state';
import {
  EditorView,
  keymap,
} from '@codemirror/view';

document.addEventListener('DOMContentLoaded', () => {
    let startState = EditorState.create({
        doc: "Hello World",
        extensions: [keymap.of(defaultKeymap)]
    })
    
    let view = new EditorView({
        state: startState,
        parent: document.body
    })
});