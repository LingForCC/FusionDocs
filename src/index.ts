import {
  basicSetup,
  EditorView,
} from 'codemirror';

import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { LanguageDescription } from '@codemirror/language';
import { EditorState } from '@codemirror/state';

import {
  findToolForPopulate,
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
    
    const populateButton = document.getElementById("button-populate");
    if(populateButton) {
        populateButton.addEventListener("click", handlePopulateButtonClick);
    }

    const routeButton = document.getElementById("button-route");
    if(routeButton) {
        routeButton.addEventListener("click", handleRouteButtonClick);
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

async function handlePopulateButtonClick() {
    //get the selected text from CodeMirror and detect the corresponding object
    const state = editorView.state;
    const selection = state.selection.main;

    const selectedText = state.sliceDoc(selection.from, selection.to);
    const inlineObjectPattern: RegExp = /@\w+\([^\)]+\)/g; 

    const inlineObjectMatches: RegExpMatchArray | null = selectedText.match(inlineObjectPattern);

    if (inlineObjectMatches) {
        inlineObjectMatches.forEach((inlineObjectMatch) => {

            const objectRefpattern: RegExp = /@\w+\(([^)]+)\)/; 
            const objectRefMatches: RegExpMatchArray | null = inlineObjectMatch.match(objectRefpattern);

            if(objectRefMatches) {

                const dataObjects = documentConfiguration.data as Array<any>;
                dataObjects.forEach(async (item) => {
                    if (item.metadata.ref === objectRefMatches[1]) {

                        //Need to identify the position of the toPopulateObject in the document


                        const toPopulateObject = item;

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

                            const startMarker = "```json";
                            const endMarker = "```";

                            const startIndex = editorView.state.doc.toString().indexOf(startMarker);
                            const endIndex = editorView.state.doc.toString().indexOf(
                                endMarker,
                                startIndex + startMarker.length
                            );

                            const transaction = editorView.state.update({
                                changes: { from: startIndex, to: endIndex, insert: "```json" + JSON.stringify(documentConfiguration) + "```"}
                            });

                            editorView.dispatch(transaction);
                        }
                    }
                })
            }
        })
    } 

    


    
}

async function handleRouteButtonClick() {

    const response = await fetch("http://localhost:9000/google-route-api:computeRoutes?fields=routes.duration&key=", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(
            {
                "origin": {
                    "placeId": "" 
                },
                "destination": {
                    "placeId": ""
                },
                "routingPreference": "TRAFFIC_AWARE",
                "computeAlternativeRoutes": false,
                "routeModifiers": {
                    "avoidTolls": false,
                    "avoidHighways": false,
                    "avoidFerries": false
                },
                "languageCode": "en-US",
                "units": "IMPERIAL"
            }
        )
    });
    const text = await response.text();
    console.log(text);
}