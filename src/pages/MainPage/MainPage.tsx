import notionLogo from '../../assets/notion.svg'
import supabaseLogo from '../../assets/supabase.svg';
import './MainPage.css'
import { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export const MainPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: '¡Hola! Soy tu asistente de Notion 2 Markdown. Puedes preguntarme cualquier cosa sobre la conversión de páginas de Notion a Markdown, sincronización con Supabase, o cualquier funcionalidad de la aplicación.',
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Agregar mensaje del usuario
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simular respuesta del asistente después de un delay
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `Gracias por tu mensaje: "${userMessage.content}". Esta es una respuesta automática de prueba. En el futuro, aquí se implementará la funcionalidad real de conversión de Notion a Markdown y sincronización con Supabase. ¡Pronto podrás interactuar completamente con la aplicación!`,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-container">
      {/* Header del Chat */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-avatars">
            <img src={notionLogo} className="logo-small notion" alt="Notion Logo" />
            <img src={supabaseLogo} className="logo-small supabase" alt="Supabase Logo" />
          </div>
          <div className="chat-title">
            <h1>Notion 2 Markdown Assistant</h1>
            <p className="chat-subtitle">Tu asistente para conversión y sincronización</p>
          </div>
        </div>
        <div className="chat-status">
          <div className="status-indicator online"></div>
          <span>En línea</span>
        </div>
      </div>

      {/* Área de Mensajes */}
      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender === 'user' ? 'message-user' : 'message-assistant'}`}
          >
            <div className="message-content">
              <p>{message.content}</p>
              <span className="message-time">
                {message.timestamp.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="message message-assistant">
            <div className="message-content typing">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="message-time">Escribiendo...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input del Chat */}
      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje aquí... (Enter para enviar)"
            className="chat-input"
            rows={1}
            disabled={isTyping}
          />
        </div>
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isTyping}
          className="send-button"
        >
          {isTyping ? '⏳' : '📤'}
        </button>
      </div>
    </div>
  )
}