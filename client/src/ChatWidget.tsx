import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatWidget.css';

interface Message {
    id?: string;
    sender: 'user' | 'ai';
    text: string;
}

interface ChatResponse {
    reply: string;
    sessionId: string;
}

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

export const ChatWidget: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'ai', text: 'Hi there! How can I help you today?' },
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | undefined>(undefined);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load session from localStorage and fetch history on mount
    const getInitilMessage = async (): Promise<void> => {
        const storedSessionId = localStorage.getItem('chat_session_id');

        if (!storedSessionId) return;

        try {
            setSessionId(storedSessionId);
            // Fetch history
            const response = await fetch(`${BACKEND_API_URL}/chat/history/${storedSessionId}`);
            const data = await response.json();
            const chatHistory = data.chatHistory;

            if (chatHistory && chatHistory.length > 0) {
                const loadedMessages: Message[] = chatHistory.map((msg: any) => ({
                    sender: msg.sender,
                    text: msg.text
                }));
                setMessages(loadedMessages);
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
        }
    }

    useEffect(() => {
        getInitilMessage();
    }, []);

    // handle new message
    const handleSendMessage = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMessage = inputText.trim();
        setInputText('');

        const newMessages: Message[] = [...messages, { sender: 'user', text: userMessage }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const response = await fetch(`${BACKEND_API_URL}/chat/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage, sessionId }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const responseData = await response.json();
            const data: ChatResponse = responseData.agentResponse;

            if (data.sessionId && !sessionId) {
                setSessionId(data.sessionId);
                localStorage.setItem('chat_session_id', data.sessionId);
            }

            setMessages((prev) => [
                ...prev,
                { sender: 'ai', text: data.reply },
            ]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages((prev) => [
                ...prev,
                { sender: 'ai', text: 'Sorry, something went wrong. Please try again.' },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // enter to send message
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <span>Support Agent</span>
            </div>
            <div className="server-notice" style={{ fontSize: '10px', padding: '4px 10px', backgroundColor: '#fffbe6', borderBottom: '1px solid #ffe58f', color: '#856404', fontStyle: 'italic' }}>
                Note: Backend may take a few seconds to wake up after inactivity (Free Tier).
            </div>
            <div className="chat-messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.sender}`}>
                        {msg.sender === 'ai' ? (
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                        ) : (
                            msg.text
                        )}
                    </div>
                ))}
                {isLoading && <div className="typing-indicator">Agent is typing...</div>}
                <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-area">
                <input
                    type="text"
                    className="chat-input"
                    placeholder="Type a message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                />
                <button
                    className="send-button"
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isLoading}
                >
                    ➤
                </button>
            </div>
        </div>
    );
};
