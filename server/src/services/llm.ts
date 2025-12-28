import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not defined in the environment');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

interface ChatMessage {
    sender: string; // 'user' | 'ai'
    text: string;
}

const SYSTEM_PROMPT = `
You are a helpful customer support agent for "Spur Store", a fictional e-commerce shop.
Your goal is to answer customer questions clearly and concisely.
You have the following domain knowledge:
- Shipping: We ship worldwide. standard shipping is free on orders over $50. Otherwise it's $5.
- Returns: You can return items within 30 days of receipt if they are unused.
- Support Hours: Mon-Fri 9am - 5pm EST.
- Products: We sell "Cool Gadgets", "Funny T-shirts", and "Tech Accessories".

If you don't know the answer, politely say you don't know and offer to connect them to a human (simulate this by saying "I'll leave a note for a human agent").
Always be polite and professional.
`;

export async function generateReply(history: ChatMessage[]): Promise<string> {

    try {
        const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });

        // transform history to gemini format
        const chatHistory = history.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
        }));

        // Start chat with history
        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: SYSTEM_PROMPT + "\n\nHello" }]
                },
                {
                    role: 'model',
                    parts: [{ text: "Hello! I am ready to help with Spur Store questions." }]
                },
                ...chatHistory
            ],
            generationConfig: {
                maxOutputTokens: 150,
            },
        });

        const historyForChat = chatHistory.slice(0, -1);
        const lastMessage = chatHistory[chatHistory.length - 1];

        if (!lastMessage || lastMessage.role !== 'user') {
            // Fallback or just respond to context
            return "How can I help you regarding our products?";
        }

        const chatSession = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: SYSTEM_PROMPT }]
                },
                {
                    role: 'model',
                    parts: [{ text: "Understood. I am ready to help." }]
                },
                ...historyForChat
            ]
        });

        const result = await chatSession.sendMessage(lastMessage.parts[0].text);
        const response = await result.response;
        const text = response.text();

        return text || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
        console.error('Gemini API Error:', error);
        return "I'm having trouble connecting to my brain right now. Please try again later.";
    }
}
