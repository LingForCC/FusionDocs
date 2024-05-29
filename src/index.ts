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
  findToolForPopulate,
  getChatCompletionStream,
  populateObject,
} from './pplai';

let editorView: EditorView;
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

    editorView = new EditorView({
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
    
    const populateButton = document.getElementById("button-populate");
    if(populateButton) {
        populateButton.addEventListener("click", handlePopulateButtonClick);
    }

    //Load the test document
    const response = await fetch('./testDocument.md');
    const fileContent = await response.text();
    editorView.setState(EditorState.create({
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


async function handlePopulateButtonClick() {
    //get the selected object from CodeMirror
    const state = editorView.state;
    const selection = state.selection.main;

    const selectedText = state.sliceDoc(selection.from, selection.to);

    const toPopulateObject = JSON.parse(selectedText);

    //use the selected object to find the proper tool
    const apiKeyElement = document.getElementById("input-pplai-key") as HTMLInputElement;

    const apiKeyString = apiKeyElement.value;
    const findToolResponseString = await findToolForPopulate(apiKeyString, JSON.stringify(documentConfiguration.tools), JSON.stringify(toPopulateObject));

    const findToolResponseObject = JSON.parse(findToolResponseString);

    const resultElement = document.getElementById('text-result');
    if (resultElement) {
        resultElement.innerHTML = resultElement.innerHTML + findToolResponseString;
    }

    //send request to the tool to get data
    const authorizationInfo = documentConfiguration.toolAuthorization[findToolResponseObject.provider];

    if(authorizationInfo.mode === "apiKeyInParameter") {
        findToolResponseObject.request.urlParameters.key = authorizationInfo.apiKey;
    
        
        const url = new URL(findToolResponseObject.request.apiEndpoint);

        for (const key in findToolResponseObject.request.urlParameters) {
            url.searchParams.set(key, findToolResponseObject.request.urlParameters[key]);
        }

        const useToolResponse = await fetch(url, {
            method: findToolResponseObject.request.method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(findToolResponseObject.request.body)
        });

        const useToolResponseString = await useToolResponse.text();
        const useToolResponseObject = JSON.parse(useToolResponseString);

        const resultElement = document.getElementById('text-result');
        if (resultElement) {
            resultElement.innerHTML = resultElement.innerHTML + "<br><br>" + useToolResponseString;
        }

        //populate the data to the selected object
        const populateResponseString = await populateObject(apiKeyString, JSON.stringify(useToolResponseObject), JSON.stringify(toPopulateObject.properties));
        const populateResponseObject = JSON.parse(populateResponseString);

        if (resultElement) {
            resultElement.innerHTML = resultElement.innerHTML + "<br><br>" + populateResponseString;
        }

        //write the populated object back to CodeMirror
        toPopulateObject.properties = populateResponseObject;
        const populatedString = JSON.stringify(toPopulateObject);

        const transaction = editorView.state.update({
            changes: { from: selection.from, to: selection.to, insert: populatedString }
        });

        editorView.dispatch(transaction);
    }


    
}