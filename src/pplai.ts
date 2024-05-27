export async function getChatCompletionStream() {
    const response = await fetch("/api/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer `,
        },
        body: JSON.stringify({
            model: "llama-3-70b-instruct",
            messages: [{ role: "user", content: "WHat is the capital for China?" }],
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
  
