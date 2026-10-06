import React from 'react';
import { Bot, User, BookOpen } from 'lucide-react';

export default function Message({ message }) {
  const isUser = message.sender === 'user';

  return (
    <div className={`message-item ${isUser ? 'user' : 'assistant'}`}>
      <div className={`message-avatar ${isUser ? 'user' : 'assistant'}`}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      <div className="message-bubble">
        {message.isTyping ? (
          <div className="typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        ) : (
          <>
            <div>{message.text}</div>

            {message.sources && message.sources.length > 0 && (
              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #2A2A2A' }}>
                <div style={{ fontSize: '0.75rem', color: '#A1A1A1', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <BookOpen size={12} />
                  <span>Sources used:</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {message.sources.map((src, idx) => (
                    <span key={idx} className="source-badge">
                      {src}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '6px', textAlign: isUser ? 'right' : 'left' }}>
              {message.timestamp}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
