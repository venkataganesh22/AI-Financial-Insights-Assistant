import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, ChevronRight, Bot } from 'lucide-react';
import Message from './Message';

export default function Chat({ messages, setMessages, token, apiUrl }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ message: query.trim() })
      });

      if (!res.ok) {
        throw new Error('Failed to fetch AI response');
      }

      const data = await res.json();
      const botMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: data.response,
        sources: data.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: 'Sorry, I encountered an error connecting to the financial AI service. Please ensure the backend server is running.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const prompts = [
    "Analyze my spending",
    "Where did I spend the most?",
    "Explain my savings",
    "What is an SIP?"
  ];

  return (
    <div className="chat-container">
      <div className="messages-list">
        {messages.length === 0 ? (
          <div className="chat-welcome">
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#1C1C1C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #333'
            }}>
              <Bot size={28} color="#FFF" />
            </div>
            <h2>How can I help with your finances?</h2>
            <p style={{ fontSize: '0.9rem', maxWidth: '480px' }}>
              Ask questions about your uploaded Indian spending transactions, savings patterns, or general personal finance concepts.
            </p>

            <div className="prompt-suggestions">
              {prompts.map((p, idx) => (
                <div 
                  key={idx} 
                  className="prompt-card"
                  onClick={() => handleSend(p)}
                >
                  <span>{p}</span>
                  <ChevronRight size={16} color="#A1A1A1" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <Message key={msg.id} message={msg} />
          ))
        )}

        {loading && (
          <Message message={{ sender: 'assistant', isTyping: true }} />
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-wrapper">
        <div className="chat-input-box">
          <input
            type="text"
            placeholder="Ask about your spending or personal finance..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <button 
            className="send-btn"
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
