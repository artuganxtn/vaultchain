import React, { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from '../../App';
import { useTranslation } from '../../contexts/LanguageContext';
import { CloseIcon, SendIcon, SparklesIcon } from '../ui/Icons';
import { getAiAssistanceStream } from '../../services/api';

interface FinancialAssistantProps {
  onClose: () => void;
}

type Message = {
  sender: 'user' | 'ai';
  text: string;
};

const FinancialAssistant: React.FC<FinancialAssistantProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const context = useContext(AppContext);
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: "Hello! I'm your financial assistant. How can I help you analyze your portfolio or the market today? Remember, I'm here for informational purposes and not to provide financial advice." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
        const user = context?.user;
        const assets = context?.data?.assets;
        
        let portfolioSummary = "The user has no assets in their portfolio.";
        if (user && user.portfolio.length > 0 && assets) {
            portfolioSummary = "The user's portfolio consists of: " + user.portfolio.map(item => {
                const asset = assets.find(a => a.id === item.assetId);
                return `${item.quantity.toFixed(4)} ${asset?.symbol || item.assetId} (average buy price: $${item.averageBuyPrice.toFixed(2)})`;
            }).join(', ') + ".";
        }

        let marketSummary = "Current market data is not available.";
        if (assets) {
            marketSummary = "Current market prices are: " + assets.slice(0, 10).map(a => `${a.symbol} at $${a.price.toFixed(2)}`).join(', ') + ".";
        }

      const responseStream = await getAiAssistanceStream(currentInput, portfolioSummary, marketSummary);

      setMessages(prev => [...prev, { sender: 'ai', text: '' }]);

      for await (const chunk of responseStream) {
          setMessages(prev => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage.sender === 'ai') {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = { ...lastMessage, text: lastMessage.text + chunk };
                  return newMessages;
              }
              return prev;
          });
      }

    } catch (err: any) {
      console.error("AI Assistant error:", err);
      const errorMessage = err?.message || t('aiError') || "Sorry, I encountered an error. Please try again.";
      setMessages(prev => [...prev, { sender: 'ai', text: `**Error:** ${errorMessage}\n\nPlease try again or contact support if the issue persists.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (text: string) => {
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>');       // Italics
    return formattedText.replace(/\n/g, '<br />');
  };

  return (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 p-0 sm:p-4" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-assistant-title"
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full h-[90%] sm:h-auto sm:max-h-[80vh] max-w-2xl flex flex-col transform transition-all duration-300" 
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-green-400/20 flex-shrink-0">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <SparklesIcon className="w-6 h-6 text-green-500" />
                <h2 id="ai-assistant-title" className="text-lg font-bold text-gray-900 dark:text-white">{t('askAI')}</h2>
            </div>
            <button onClick={onClose} className="text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <CloseIcon />
            </button>
        </header>

        <main className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
                <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                   {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-green-500"/></div>}
                   <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-green-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                        <div className="text-sm prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }} />
                   </div>
                </div>
            ))}
             {isLoading && (
                <div className="flex items-end gap-2 justify-start">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-green-500"/></div>
                    <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-gray-200 dark:bg-gray-700">
                        <div className="flex space-x-1 rtl:space-x-reverse">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </main>

        <footer className="p-4 border-t border-gray-200 dark:border-gray-700/50 flex-shrink-0">
            <div className="relative">
                <input 
                    type="text" 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about your portfolio..."
                    className="w-full p-3 ps-4 pe-12 text-sm bg-gray-100 dark:bg-gray-700/50 rounded-full border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    disabled={isLoading}
                />
                <button onClick={handleSend} disabled={isLoading || !input.trim()} className="absolute end-2 inset-y-1 w-10 h-10 flex items-center justify-center bg-green-500 text-white rounded-full transition-colors hover:bg-green-600 disabled:bg-gray-400 dark:disabled:bg-gray-600">
                    <SendIcon className="w-5 h-5" />
                </button>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default FinancialAssistant;