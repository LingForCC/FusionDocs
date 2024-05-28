

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

export async function findTool(apiKey: string, toolSchema: string, userInput: string): Promise<string> {

    const findToolResponseSchema = {    
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

                    Based on the tool schema, I want to achieve the goal below
                    
                    ${userInput}

                    how can I use the tool?

                    RETURN in following JSON format. I do NOT need anything else.
                    ${JSON.stringify(findToolResponseSchema)}
                ` }
            ]
        }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
}