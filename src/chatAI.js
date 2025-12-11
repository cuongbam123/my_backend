import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const askAI = async (message, image) => {
    try {
        const messages = [
            { role: "user", content: message }
        ];

        if (image) {
            messages.push({
                role: "user",
                content: [
                    { type: "text", text: message || "Hình này là gì?" },
                    {
                        type: "image_url",
                        image_url: `data:${image.mime_type};base64,${image.data}`
                    }
                ]
            });
        }

        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.log(error);
        return "Xin lỗi, AI đang gặp sự cố.";
    }
};
