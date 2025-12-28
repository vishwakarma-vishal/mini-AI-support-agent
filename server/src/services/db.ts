import { PrismaClient } from '@prisma/client';
import { generateReply } from './llm';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

export async function getChatHistoryById(sessionId: string) {
    const messages = await prisma.message.findMany({
        where: { conversationId: sessionId },
        orderBy: { timestamp: 'asc' },
    });

    messages.map((msg: { sender: string; text: string; timestamp: Date }) => ({
        sender: msg.sender, // "user" | "ai"
        text: msg.text,
        timestamp: msg.timestamp
    }));

    return messages;
}

export async function handleChatMessage(messageText: string, sessionId?: string) {
    let conversationId = sessionId;

    // create conversation if not exists
    if (!conversationId) {
        conversationId = randomUUID();
        await prisma.conversation.create({
            data: { id: conversationId }
        });
    } else {
        const exists = await prisma.conversation.findUnique({ where: { id: conversationId } });
        if (!exists) {
            await prisma.conversation.create({ data: { id: conversationId } });
        }
    }

    // persist user message
    await prisma.message.create({
        data: {
            id: randomUUID(),
            conversationId: conversationId!,
            sender: 'user',
            text: messageText,
        },
    });

    // get history for context
    const history = await prisma.message.findMany({
        where: { conversationId: conversationId! },
        orderBy: { timestamp: 'asc' },
        take: 10,
    });

    // call llm
    const aiReplyText = await generateReply(history);

    // persist ai message
    await prisma.message.create({
        data: {
            id: randomUUID(),
            conversationId: conversationId!,
            sender: 'ai',
            text: aiReplyText,
        },
    });

    return {
        reply: aiReplyText,
        sessionId: conversationId,
    };
}