import {
  basicSetup,
  EditorView,
} from 'codemirror';

import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { LanguageDescription } from '@codemirror/language';

document.addEventListener('DOMContentLoaded', () => {
    
    const jsonDescription = LanguageDescription.of({
        name: "JSON",
        alias: [],
        extensions: ["json"],
        filename: /\.json$/,
        load: () => Promise.resolve(json())
      });

    let view = new EditorView({
        extensions: [
            basicSetup, 
            markdown({
                codeLanguages: [
                    jsonDescription
                ]
              })
        ],
        parent: document.body
    })
});