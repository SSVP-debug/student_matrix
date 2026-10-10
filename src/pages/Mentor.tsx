import { Sidebar } from '../components/Sidebar';
import { Send, Sparkles, Brain, BookOpen, Zap, Target } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface Message {
  id: number;
  message: string;
  isUser: boolean;
  timestamp: string;
}

export const Mentor = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      message: "Hello! I'm Pixie, your AI Learning Assistant. I'm here to help you explore the universe of knowledge. What would you like to learn today?",
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { icon: <BookOpen className="w-4 h-4" />, text: 'Explain quantum physics basics', prompt: 'Can you explain the basics of quantum physics in simple terms?' },
    { icon: <Zap className="w-4 h-4" />, text: 'Help with math problem', prompt: 'I need help solving a calculus problem about derivatives.' },
    { icon: <Brain className="w-4 h-4" />, text: 'Create study plan', prompt: 'Can you create a 7-day study plan for learning web development?' },
    { icon: <Target className="w-4 h-4" />, text: 'Quiz me on biology', prompt: 'Generate a 5-question quiz about human anatomy.' },
  ];

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl ${className}`}>
      {children}
    </div>
  );

  // Format message text to handle bold markdown
  const formatMessage = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-inherit font-semibold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const ChatBubble = ({ message, isUser, timestamp }: { message: string; isUser: boolean; timestamp: string }) => (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-3xl p-4 ${
          isUser
            ? 'bg-white text-black rounded-br-none'
            : 'bg-white/10 text-white rounded-bl-none border border-white/20'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">
          {formatMessage(message)}
        </p>
        <p className={`text-xs mt-2 ${isUser ? 'text-black/60' : 'text-white/60'}`}>{timestamp}</p>
      </div>
    </div>
  );

  // ===============================
  // REAL BACKEND AI RESPONSE
  // ===============================
  const getAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch("https://stellarlearn.onrender.com/api/mentor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.reply) {
        throw new Error('No response received from AI');
      }
      
      return data.reply;
    } catch (err) {
      console.error("Backend error:", err);
      return "I'm having trouble reaching my server right now. Please try again in a moment.";
    }
  };

  // ===============================
  // ✉ SEND MESSAGE HANDLER
  // ===============================
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    const newUserMessage: Message = {
      id: messages.length + 1,
      message: userMessage,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Add timeout for long responses
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 30000)
      );

      const aiResponse = await Promise.race([
        getAIResponse(userMessage),
        timeoutPromise
      ]);

      const newAIMessage: Message = {
        id: messages.length + 2,
        message: aiResponse,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, newAIMessage]);
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      const errorMessage: Message = {
        id: messages.length + 2,
        message: error instanceof Error && error.message === 'Request timeout' 
          ? "This is taking longer than expected. Please try again with a simpler question."
          : "Pixie is having some trouble responding right now. Please try again.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputValue(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8">
        <div className="max-w-7xl mx-auto flex flex-col h-full">
          {/* Header */}
          <div className="mb-6 flex-shrink-0">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">AI Mentor</h1>
            <p className="text-white/60 capitalize">Your personal learning companion</p>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
            {/* Chat Section */}
            <div className="lg:col-span-2 flex flex-col min-h-0">
              <GlassCard className="flex-1 flex flex-col min-h-0">
                {/* Messages */}
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6">
                  <div className="space-y-4 min-h-full">
                    {messages.map(msg => (
                      <ChatBubble
                        key={msg.id}
                        message={msg.message}
                        isUser={msg.isUser}
                        timestamp={msg.timestamp}
                      />
                    ))}

                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-3xl p-4 bg-white/10 text-white rounded-bl-none border border-white/20">
                          <div className="flex items-center gap-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            <span className="text-sm text-white/60">Pixie is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Input Section */}
                <div className="p-4 md:p-6 border-t border-white/10 bg-white/5 rounded-b-3xl flex-shrink-0">
                  {/* Quick Prompts */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {quickPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickPrompt(prompt.prompt)}
                        className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-300 text-sm text-white/80 hover:text-white"
                      >
                        {prompt.icon}
                        <span className="truncate">{prompt.text}</span>
                      </button>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="relative">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about learning..."
                      disabled={isLoading}
                      className="w-full px-4 md:px-6 py-3 md:py-4 pr-12 rounded-2xl bg-white/5 border-2 border-white/10 focus:border-white focus:shadow-lg focus:shadow-white/20 outline-none text-white placeholder-white/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/90 disabled:bg-white/30 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      <Send className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <GlassCard className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white/20">
                    <img 
                      src="https://res.cloudinary.com/dhn92qb61/image/upload/v1763296742/download_wym1cc.jpg" 
                      alt="Feature Icon"
                      className="w-full h-full object-cover object-top" 
                    />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Pixie</h3>
                <p className="text-sm text-white/60 mb-4">Your AI Learning Assistant</p>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-white">Online & Ready</span>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Learning Capabilities</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Explain Concepts</p>
                      <p className="text-xs text-white/60">Break down complex topics clearly</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Study Resources</p>
                      <p className="text-xs text-white/60">Create notes & learning materials</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Practice & Quizzes</p>
                      <p className="text-xs text-white/60">Generate exercises and tests</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Personalized Help</p>
                      <p className="text-xs text-white/60">Adapts to your learning needs</p>
                    </div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-white mb-3">Pro Tips</h3>
                <div className="space-y-2 text-sm text-white/70">
                  <p>• Be specific with your questions</p>
                  <p>• Ask for examples when confused</p>
                  <p>• Request practice problems</p>
                  <p>• Ask for different explanations</p>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};