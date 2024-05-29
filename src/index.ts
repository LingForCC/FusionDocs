import {
  basicSetup,
  EditorView,
} from 'codemirror';

import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { LanguageDescription } from '@codemirror/language';
import { EditorState } from '@codemirror/state';

import {
  findTool,
  getChatCompletionStream,
} from './pplai';

let documentConfiguration: any = null;
let findToolResponse: any = null;
let useToolResponse: any = null;

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

    const findToolButton = document.getElementById("button-findTool");

    if (findToolButton) {
        findToolButton.addEventListener("click", handleFindToolButtonClick);
    }

    const useToolButton = document.getElementById("button-useTool");
    if(useToolButton) {
        useToolButton.addEventListener("click", handleUseToolButtonClick);
    }

    const processButton = document.getElementById("button-process");
    if(processButton) {
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
    documentConfiguration = JSON.parse(extractJsonContent(fileContent)!);

    //Fill in the pplai key
    const inputKey = document.getElementById(
        "input-pplai-key"
    ) as HTMLInputElement;
    inputKey.value = documentConfiguration.aiProvider.pplai.apiKey;
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

async function handleFindToolButtonClick() {
    const inputKey = document.getElementById(
        "input-pplai-key"
    ) as HTMLInputElement;

    const inputUser = document.getElementById(
        "input-user"
    ) as HTMLInputElement;

    if (inputKey) {
        const inputKeyString = inputKey.value;
        const aiResponse = await findTool(inputKeyString, JSON.stringify(documentConfiguration.tools), inputUser.value);

        findToolResponse = JSON.parse(aiResponse);

        const resultElement = document.getElementById('text-result');
        if (resultElement) {
            resultElement.innerHTML = aiResponse;
        }
    } else {
        console.error("Input field not found");
    }
}

async function handleUseToolButtonClick() {
    //send the actual 
    console.log(findToolResponse);

    const authorizationInfo = documentConfiguration.toolAuthorization[findToolResponse.provider];

    if(authorizationInfo.mode === "apiKeyInParameter") {
        findToolResponse.request.urlParameters.key = authorizationInfo.apiKey;
    
        
        const url = new URL(findToolResponse.request.apiEndpoint);

        for (const key in findToolResponse.request.urlParameters) {
            url.searchParams.set(key, findToolResponse.request.urlParameters[key]);
        }

        const response = await fetch(url, {
            method: findToolResponse.request.method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(findToolResponse.request.body)
        });

        const responseText = await response.text();
        useToolResponse = JSON.parse(responseText);

        const resultElement = document.getElementById('text-result');
        if (resultElement) {
            resultElement.innerHTML = resultElement.innerHTML + "<br><br>" + responseText;
        }
    }

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
        const responseText = await getChatCompletionStream(inputKeyString, inputUser.value);

        const resultElement = document.getElementById('text-result');
        if (resultElement) {
            resultElement.innerHTML = resultElement.innerHTML + "<br><br>" + responseText;
        }
    } else {
        console.error("Input field not found");
    }
}
