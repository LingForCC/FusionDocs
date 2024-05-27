import {
  basicSetup,
  EditorView,
} from 'codemirror';

import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { LanguageDescription } from '@codemirror/language';

import { getChatCompletionStream } from './pplai';

document.addEventListener("DOMContentLoaded", () => {
    const jsonDescription = LanguageDescription.of({
        name: "JSON",
        alias: [],
        extensions: ["json"],
        filename: /\.json$/,
        load: () => Promise.resolve(json()),
    });

    let view = new EditorView({
        extensions: [
            basicSetup,
            markdown({
                codeLanguages: [jsonDescription],
            }),
        ],
        parent: document.getElementById("editor") as HTMLElement,
    });

    const processButton = document.getElementById("button-process");

    if (processButton) {
        processButton.addEventListener("click", handleProcessButtonClick);
    }
});

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
