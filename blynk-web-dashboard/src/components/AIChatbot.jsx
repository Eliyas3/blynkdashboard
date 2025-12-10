import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Trash2, Copy, Check } from 'lucide-react';
import dataAnalytics from '../utils/dataAnalytics';
import anomalyDetector from '../utils/anomalyDetection';
import geminiService from '../services/geminiAPI';

const AIChatbot = ({ widgets, datastreams, project }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Hi! I\'m your AI assistant powered by Google Gemini. Ask me anything!', timestamp: Date.now() }
    ]);
    const [input, setInput] = useState('');
    const [copiedId, setCopiedId] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const processQuery = async (query) => {
        const lowerQuery = query.toLowerCase();

        // Arduino code generation
        if (lowerQuery.includes('arduino') || lowerQuery.includes('code') || lowerQuery.includes('esp')) {
            if (!project) {
                return 'No project selected. Please create a project first!';
            }

            if (lowerQuery.includes('generate') || lowerQuery.includes('create') || lowerQuery.includes('give') || lowerQuery.includes('show')) {
                const code = geminiService.generateArduinoCode(project);
                return `Here's the complete Arduino code for "${project.name}":\n\n${code}\n\nCopy to Arduino IDE, update WiFi credentials, and upload!`;
            }
        }

        // Project info
        if (lowerQuery.includes('project') || lowerQuery.includes('about')) {
            if (!project) return 'No project selected.';
            return `Project: ${project.name}\nDescription: ${project.description}\nWidgets: ${widgets.length}\nConnection: ${project.connectionType}\n\nAsk me to "generate Arduino code" to get full ESP8266/ESP32 code!`;
        }

        // Current readings
        if (lowerQuery.includes('current') || lowerQuery.includes('reading') || lowerQuery.includes('status')) {
            if (widgets.length === 0) return 'No widgets yet!';
            const responses = widgets.map(w => {
                const current = datastreams[w.pin] || 0;
                return `${w.label}: ${current.toFixed(1)}`;
            }).join('\n');
            return `Current readings:\n${responses}`;
        }

        // List widgets
        if (lowerQuery.includes('list') || lowerQuery.includes('widgets')) {
            if (widgets.length === 0) return 'No widgets yet!';
            return `Widgets:\n${widgets.map((w, i) => `${i + 1}. ${w.label} (${w.type}) - ${w.pin}`).join('\n')}`;
        }

        // Help
        if (lowerQuery.includes('help')) {
            return `I can help with:\n📊 "current readings"\n📈 "average"\n⚠️ "any anomalies?"\n💻 "generate Arduino code"\n🤖 Ask anything!\n\nTry: "generate code" or any question!`;
        }

        // Use Gemini AI for everything else
        try {
            const anomalies = anomalyDetector.getRecentAnomalies(5);
            const response = await geminiService.chat(query, {
                widgets,
                datastreams,
                project,
                stats: { anomalies: anomalies.length }
            });
            return response;
        } catch (error) {
            console.error('Gemini error:', error);
            return `I'm having trouble connecting to AI. Try: "current readings", "list widgets", or "help".`;
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', text: input, timestamp: Date.now() };
        setMessages(prev => [...prev, userMessage]);

        // Typing indicator
        const typingMessage = { role: 'assistant', text: '...', timestamp: Date.now(), isTyping: true };
        setMessages(prev => [...prev, typingMessage]);

        try {
            const response = await processQuery(input);
            setMessages(prev => prev.filter(m => !m.isTyping));
            const assistantMessage = { role: 'assistant', text: response, timestamp: Date.now() };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            setMessages(prev => prev.filter(m => !m.isTyping));
            const errorMessage = { role: 'assistant', text: 'Sorry, I encountered an error. Try again!', timestamp: Date.now() };
            setMessages(prev => [...prev, errorMessage]);
        }

        setInput('');
    };

    const copyMessage = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const clearChat = () => {
        setMessages([
            { role: 'assistant', text: 'Chat cleared! How can I help you?', timestamp: Date.now() }
        ]);
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00e096, #06b6d4)',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(0, 224, 150, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 999,
                    transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                {isOpen ? <X size={28} color="white" /> : <MessageCircle size={28} color="white" />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    bottom: '100px',
                    right: '24px',
                    width: '380px',
                    height: '500px',
                    background: '#1a1d29',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                    border: '1px solid #2a2d3a',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 998
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '16px',
                        borderBottom: '1px solid #2a2d3a',
                        background: 'linear-gradient(135deg, #00e096, #06b6d4)',
                        borderRadius: '16px 16px 0 0'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <div style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <MessageCircle size={24} />
                                    AI Assistant
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                                    Powered by Google Gemini
                                </div>
                            </div>
                            <button
                                onClick={clearChat}
                                style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    color: 'white',
                                    fontSize: '0.85rem',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                                title="Clear chat history"
                            >
                                <Trash2 size={16} />
                                Clear
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                style={{
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '80%'
                                }}
                            >
                                <div style={{
                                    position: 'relative',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    background: msg.role === 'user'
                                        ? 'linear-gradient(135deg, #00e096, #06b6d4)'
                                        : '#22252f',
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {msg.text}
                                    <button
                                        onClick={() => copyMessage(msg.text, idx)}
                                        style={{
                                            position: 'absolute',
                                            bottom: '8px',
                                            right: '8px',
                                            background: 'rgba(0,0,0,0.2)',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '6px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            opacity: 0.7,
                                            transition: 'opacity 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                                        title="Copy message"
                                    >
                                        {copiedId === idx ? (
                                            <Check size={14} color="#22c55e" />
                                        ) : (
                                            <Copy size={14} color="white" />
                                        )}
                                    </button>
                                </div>
                                <div style={{
                                    fontSize: '0.7rem',
                                    color: '#8b92a7',
                                    marginTop: '4px',
                                    textAlign: msg.role === 'user' ? 'right' : 'left'
                                }}>
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div style={{
                        padding: '16px',
                        borderTop: '1px solid #2a2d3a'
                    }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask me anything..."
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #2a2d3a',
                                    background: '#22252f',
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                            />
                            <button
                                onClick={handleSend}
                                style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #00e096, #06b6d4)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIChatbot;
