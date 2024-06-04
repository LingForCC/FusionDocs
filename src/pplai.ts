import {
  Axios,
  AxiosError,
} from 'axios';

export async function findToolForPopulate(apiKey: string, toolSchema: string, toPopulateObject: string): Promise<string> {

    const findToolResponseSchema = {    
        "provider": "",
        "name": "",
        "request": {
            "apiEndpoint": "",
            "method": "",
            "urlParameters": {
    
            },
            "body": {
    
            }
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

                    Based on the tool schema, I want to popluate the properties in following object
                    
                    ${toPopulateObject}

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

export async function populateObject(apiKey: string, toPopulateData: string, toPopulateObject: string): Promise<string> {

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
                    content: "You are an expert in fill in the value of the properties of the JSON object I provide. You can ONLY return the result in JSON format."
                },
                { role: "user", content: `
                    
                    Below is the JSON object whose properties need to be populated

                    ${toPopulateObject}

                    Below is the data 
                    
                    ${toPopulateData}


                    Return the populated JSON object in JSON format only. I do NOT need anything else.
                ` }
            ]
        }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
}

export async function findTool(apiKey: string, toolSchema: string, userInstruction: string, dataObjects: string): Promise<string> {

    const findToolResponseSchema = {    
        "provider": "",
        "name": "",
        "request": {
            "apiEndpoint": "",
            "method": "",
            "urlParameters": {
    
            },
            "body": {
    
            }
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

                    Below is the data objects

                    ${dataObjects}

                    Below is the instructions from the user

                    ${userInstruction}

                    Based on the tool schema and the data objects, how can I use the tool to complete user instruction?

                    RETURN in following JSON format. I do NOT need anything else.
                    ${JSON.stringify(findToolResponseSchema)}
                ` }
            ]
        }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
}

export async function instruct(instruction: string): Promise<string | undefined> {

    const axiosInstance = new Axios({
        baseURL: 'https://api.perplexity.ai',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PPLAI_KEY}`,
        },
    });

    try{ 

       
        const data = JSON.stringify({
            model: "llama-3-70b-instruct",
            messages: [
                {
                    role: "system",
                    content: "",
                },
                {
                    role: "user",
                    content: instruction,
                },
            ],
        });

        const response = await axiosInstance.post(
            "/chat/completions",
            data
        );

        const result = JSON.parse(response.data);
        return result.choices[0].message.content;
    } catch(error) {
       if (error as AxiosError) {
            const axiosError = error as AxiosError;
            console.log(axiosError.cause);
            console.log(axiosError.message);
       }
    }

}