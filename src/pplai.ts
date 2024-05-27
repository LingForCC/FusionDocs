

export async function getChatCompletionStream(apiKey: string, userInput: string) {
    const response = await fetch("/api/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "llama-3-70b-instruct",
            messages: [{ role: "user", content: userInput }],
            stream: true,
        }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        console.log(chunk);
    }
}
  
