import { Request, Response } from 'express';
import { handleChatMessage, getChatHistoryById } from '../services/db';

export const getChatHistory = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;

        if (!sessionId) {
            res.status(400).json({
                success: false,
                error: 'Session ID is required'
            });
            return;
        }

        const history = await getChatHistoryById(sessionId);
        res.status(200).json({
            success: true,
            chatHistory: history
        });
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

export const chatWithAgent = async (req: Request, res: Response) => {
    try {
        const { message, sessionId } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Message cannot be empty'
            });
        }

        if (message.length > 5000) {
            return res.status(400).json({
                success: false,
                error: 'Message too long (maximum 5000 characters)'
            });
        }

        const response = await handleChatMessage(message, sessionId);
        res.status(200).json({
            status: true,
            agentResponse: response
        });
    } catch (error) {
        console.error('Error handling chat message:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
