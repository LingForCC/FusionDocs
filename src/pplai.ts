

export async function getChatCompletionStream(apiKey: string, userInput: string) {
    const response = await fetch("/api/chat/completions", {
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
  
