

export async function getChatCompletionStream(apiKey: string, userInput: string) {
    const response = await fetch("/ppl-api/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "llama-3-70b-instruct",
            messages: [{ role: "user", content: userInput }]
        }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
}

export async function useTool(apiKey: string, toolSchema: string, dataSchema: string): Promise<string> {

    const useToolResponseSchema = {    
        "apiEndpoint": "",
        "method": "",
        "urlParameters": {

        },
        "body": {

        }
    }

    const response = await fetch("/ppl-api/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "llama-3-70b-instruct",
            messages: [
                {
                    role: "system", 
                    content: "You are an expert in telling me the correct API and corresponding parameters to use. You can ONLY return the result in JSON format."
                },
                { role: "user", content: `
                    
                    Below is the tool schema 

                    ${toolSchema}

                    Based on this schema, I want to send a request so that I can fill in the data schema as below
                    
                    ${dataSchema}

                    how can I send the request?

                    RETURN in following JSON format. I do NOT need anything else.
                    ${JSON.stringify(useToolResponseSchema)}
                ` }
            ]
        }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
}