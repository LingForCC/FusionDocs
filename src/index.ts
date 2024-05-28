import {
  basicSetup,
  EditorView,
} from 'codemirror';

import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { LanguageDescription } from '@codemirror/language';
import { EditorState } from '@codemirror/state';

import { getChatCompletionStream } from './pplai';

document.addEventListener("DOMContentLoaded", async () => {

    //Initialize the UI
    const jsonDescription = LanguageDescription.of({
        name: "JSON",
        alias: [],
        extensions: ["json"],
        filename: /\.json$/,
        load: () => Promise.resolve(json()),
    });

    let view = new EditorView({
        parent: document.getElementById("editor") as HTMLElement,
    });

    const processButton = document.getElementById("button-process");

    if (processButton) {
        processButton.addEventListener("click", handleProcessButtonClick);
    }

    //Load the test document
    const response = await fetch('./testDocument.md');
    const fileContent = await response.text();
    view.setState(EditorState.create({
        doc: fileContent,
        extensions: [
            basicSetup,
            markdown({
                codeLanguages: [jsonDescription],
            }),
        ]
    }));

    //Extract the JSON configuration from the document
    const documentConfiguration = JSON.parse(extractJsonContent(fileContent)!);

    //Fill in the pplai key
    const inputKey = document.getElementById(
        "input-pplai-key"
    ) as HTMLInputElement;
    inputKey.value = documentConfiguration.tools.pplai.apiKey;
});

function extractJsonContent(markdown: string): string | null {
    const startMarker = "```json";
    const endMarker = "```";

    const startIndex = markdown.indexOf(startMarker);
    if (startIndex === -1) {
        return null; // no start marker found
    }

    const endIndex = markdown.indexOf(
        endMarker,
        startIndex + startMarker.length
    );
    if (endIndex === -1) {
        return null; // no end marker found
    }

    return markdown.substring(startIndex + startMarker.length, endIndex);
}

async function handleProcessButtonClick() {
    const inputKey = document.getElementById(
        "input-pplai-key"
    ) as HTMLInputElement;

    const inputUser = document.getElementById(
        "input-user"
    ) as HTMLInputElement;

    if (inputKey) {
        const inputKeyString = inputKey.value;
        const inputUserString = inputUser.value;
        let aiResponse = await getChatCompletionStream(inputKeyString, inputUserString);

        const aiResponseElement = document.getElementById('text-airesponse');
        if (aiResponseElement) {
            aiResponseElement.innerHTML = aiResponse;
        }
    } else {
        console.error("Input field not found");
    }
}
