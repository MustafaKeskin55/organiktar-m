import { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  Sparkles,
  HelpCircle,
  ShoppingCart,
  Truck,
  Package,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { siteContentApi } from '@/lib/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  quickReplies?: string[];
}

interface ChatbotConfig {
  welcome_message: string;
  quick_questions: { icon: string; text: string }[];
  responses: Record<string, string>;
}

const iconMap: Record<string, React.ElementType> = {
  ShoppingCart,
  Truck,
  Package,
  HelpCircle,
};

function getBotResponse(userMessage: string, responses: Record<string, string>): string {
  const lowerMessage = userMessage.toLowerCase().trim();
  
  // Tam eslesme kontrolu
  if (responses[lowerMessage]) {
    return responses[lowerMessage];
  }
  
  // Anahtar kelime kontrolu
  for (const [key, response] of Object.entries(responses)) {
    if (lowerMessage.includes(key)) {
      return response;
    }
  }
  
  // Selamlama kontrolu
  if (lowerMessage.match(/^(merhaba|selam|hey|hi|hello)/)) {
    return responses['merhaba'] || 'Merhaba! Size nasil yardimci olabilirim?';
  }
  
  // Tesekkur kontrolu
  if (lowerMessage.match(/(tesekkur|sagol|tesekkurler)/)) {
    return responses['tesekkur'] || 'Rica ederim! Baska bir konuda yardimci olabilir miyim?';
  }
  
  return responses['default'] || 'Uzgunum, bu konuda tam olarak bilgi sahibi degilim. Daha fazla yardim icin musteri hizmetlerimize ulasabilirsiniz.';
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await siteContentApi.getChatbotConfig();
      setConfig(data);
      
      // Ilk mesaji ayarla
      setMessages([
        {
          id: '1',
          text: data.welcome_message || 'Merhaba! Size nasil yardimci olabilirim?',
          sender: 'bot',
          timestamp: new Date(),
          quickReplies: data.quick_questions?.map((q: any) => q.text) || [],
        },
      ]);
    } catch (error) {
      console.error('Chatbot config yuklenirken hata:', error);
      // Fallback
      setMessages([
        {
          id: '1',
          text: 'Merhaba! Organik Tarim sanal asistaniyim. Size nasil yardimci olabilirim?',
          sender: 'bot',
          timestamp: new Date(),
          quickReplies: ['Siparisim nerede?', 'Kargo ucreti nedir?', 'Abonelik nasil calisir?', 'Iade politikasi'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const responses = config?.responses || {};
      const botResponse = getBotResponse(userMessage.text, responses);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickReply = (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const responses = config?.responses || {};
      const botResponse = getBotResponse(text, responses);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = config?.quick_questions || [
    { icon: 'ShoppingCart', text: 'Siparisim nerede?' },
    { icon: 'Truck', text: 'Kargo ucreti nedir?' },
    { icon: 'Package', text: 'Abonelik nasil calisir?' },
    { icon: 'HelpCircle', text: 'Iade politikasi' },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600'
        }`}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <div className="relative">
            <MessageCircle className="h-6 w-6 text-white" />
            <span className="absolute -right-1 -top-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-300 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-400"></span>
            </span>
          </div>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 overflow-hidden rounded-2xl border bg-white shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-gradient-to-r from-green-600 to-green-500 p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-green-600 bg-green-400"></span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">CiftciBot</h3>
                <p className="text-xs text-green-100">Genellikle 1 dakika icinde yanit verir</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-white/80 hover:bg-white/20 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <ScrollArea className="h-80 bg-gray-50 p-4" ref={scrollRef}>
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-green-600 text-white'
                          : 'bg-white shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.sender === 'bot' && (
                          <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                        )}
                        <div>
                          <p className={`text-sm ${
                            message.sender === 'user' ? 'text-white' : 'text-gray-700'
                          }`}>
                            {message.text}
                          </p>
                          <p className={`mt-1 text-xs ${
                            message.sender === 'user' ? 'text-green-100' : 'text-gray-400'
                          }`}>
                            {message.timestamp.toLocaleTimeString('tr-TR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {messages[messages.length - 1]?.quickReplies && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {messages[messages.length - 1].quickReplies?.map((reply) => (
                      <button
                        key={reply}
                        onClick={() => handleQuickReply(reply)}
                        className="rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition-all hover:bg-green-100"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-green-400"></span>
                        <span className="h-2 w-2 animate-bounce rounded-full bg-green-400 [animation-delay:0.1s]"></span>
                        <span className="h-2 w-2 animate-bounce rounded-full bg-green-400 [animation-delay:0.2s]"></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="border-t bg-white p-2">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {quickQuestions.map((q) => {
                const IconComponent = iconMap[q.icon] || HelpCircle;
                return (
                  <button
                    key={q.text}
                    onClick={() => handleQuickReply(q.text)}
                    className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-all hover:border-green-300 hover:bg-green-50"
                  >
                    <IconComponent className="h-3.5 w-3.5 text-green-600" />
                    {q.text}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t bg-white p-3">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Mesajinizi yazin..."
                className="flex-1 border-gray-200 focus-visible:ring-green-500"
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                size="icon"
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
