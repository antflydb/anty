'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Key, ChevronDown, ChevronUp, MoreVertical } from 'lucide-react';
import gsap from 'gsap';
import { AntyChat, type ChatMessage } from '@/lib/chat/openai-client';
import { mapEmotionToExpression, stripEmotionTags } from '@/lib/chat/emotion-mapper';
import type { EmotionType } from '@/lib/anty-v3/animation/types';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onEmotion?: (emotion: EmotionType) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  emotion?: string;
  rawContent?: string;
  showDebug?: boolean;
}

export function ChatPanel({ isOpen, onClose, onEmotion }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
  const [chatClient, setChatClient] = useState<AntyChat | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputBorderRef = useRef<HTMLDivElement>(null);
  const borderTweenRef = useRef<gsap.core.Tween | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && !showApiKeyInput) {
      inputRef.current?.focus();
    }
  }, [isOpen, showApiKeyInput]);

  // Click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Click outside to close panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      // Delay adding listener to avoid closing immediately on open
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  // Load API key from localStorage
  useEffect(() => {
    const storedKey = localStorage.getItem('anty-chat-api-key');
    if (storedKey) {
      setApiKey(storedKey);
      setChatClient(new AntyChat(storedKey));
      setShowApiKeyInput(false);
    }
  }, []);

  // Rotating gradient border animation
  useEffect(() => {
    if (!isOpen || showApiKeyInput) return;

    // Small delay to ensure ref is attached after render
    const timer = setTimeout(() => {
      if (!inputBorderRef.current) return;

      const rotationAnim = { deg: 0 };
      borderTweenRef.current = gsap.to(rotationAnim, {
        deg: 360,
        duration: 4,
        ease: 'none',
        repeat: -1,
        onUpdate: () => {
          if (inputBorderRef.current) {
            inputBorderRef.current.style.background = `linear-gradient(white, white) padding-box, conic-gradient(from ${rotationAnim.deg}deg, #E5EDFF 0%, #C7D2FE 25%, #D8B4FE 50%, #C7D2FE 75%, #E5EDFF 100%) border-box`;
          }
        },
      });
    }, 50);

    return () => {
      clearTimeout(timer);
      borderTweenRef.current?.kill();
      borderTweenRef.current = null;
    };
  }, [isOpen, showApiKeyInput]);

  // ESC key to close chat
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSetApiKey = () => {
    if (!apiKey.trim()) return;
    localStorage.setItem('anty-chat-api-key', apiKey);
    setChatClient(new AntyChat(apiKey));
    setShowApiKeyInput(false);

    // Add welcome message
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: "Hey there! I'm Anty, your AI companion. I'll react emotionally to our conversation. Try asking me something!",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);

    // Trigger happy emotion
    const expression = mapEmotionToExpression('happy');
    if (expression) {
      onEmotion?.(expression);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !chatClient || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Create a placeholder message for streaming
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const chatHistory: ChatMessage[] = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      chatHistory.push({
        role: 'user',
        content: userMessage.content,
      });

      let rawResponse = '';

      // Stream the response
      const response = await chatClient.sendMessage(chatHistory, (chunk) => {
        rawResponse += chunk;
        // Strip emotion tags from the displayed content during streaming
        const cleanChunk = stripEmotionTags(rawResponse);

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: cleanChunk }
              : msg
          )
        );
      });

      // Update with final message including debug info
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: response.message,
                emotion: response.emotion,
                rawContent: rawResponse,
              }
            : msg
        )
      );

      // Trigger emotion if present
      if (response.emotion) {
        const expression = mapEmotionToExpression(response.emotion);
        if (expression) {
          onEmotion?.(expression);
        } else {
          console.warn('[CHAT UI] No expression mapping found for emotion:', response.emotion);
        }
      }
    } catch (error: any) {
      console.error('[CHAT UI] Error sending message:', error);

      // Remove the placeholder message
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));

      // Show specific error message
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: error.message || 'Oops! Something went wrong. Please try again.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);

      // Trigger sad emotion
      const expression = mapEmotionToExpression('sad');
      if (expression) {
        onEmotion?.(expression);
      }
    } finally {
      setIsLoading(false);
      // Auto-focus input after sending message
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showApiKeyInput) {
        handleSetApiKey();
      } else {
        handleSend();
      }
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('anty-chat-api-key');
    setApiKey('');
    setChatClient(null);
    setShowApiKeyInput(true);
    setMessages([]);
    setShowMenu(false);
  };

  const toggleDebugInfo = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, showDebug: !msg.showDebug } : msg
      )
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - removed dark overlay for clear view */}

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-[10px] top-[10px] bottom-[10px] w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col rounded-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4">
              <h2 className="text-lg font-semibold text-gray-900 pl-2">Anty Chat</h2>
              <div className="flex items-center gap-2">
                {!showApiKeyInput && (
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Menu"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                    {showMenu && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
                        <button
                          onClick={handleClearApiKey}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Key className="w-4 h-4" />
                          Change API Key
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* API Key Input */}
            {showApiKeyInput && (
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Enter your OpenAI API Key
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Your API key is stored locally and never sent to our servers.
                  </p>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleSetApiKey}
                  disabled={!apiKey.trim()}
                  className="w-full px-4 py-2 bg-[#8B5CF6] text-white rounded-lg hover:bg-[#7C3AED] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Start Chatting
                </button>
                <p className="text-xs text-gray-500">
                  Don't have an API key?{' '}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8B5CF6] hover:underline"
                  >
                    Get one here
                  </a>
                </p>
              </div>
            )}

            {/* Messages */}
            {!showApiKeyInput && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.role === 'user'
                            ? 'bg-[#8B5CF6] text-white'
                            : 'bg-gray-100 text-gray-900'
                        } ${message.role === 'assistant' && message.emotion ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
                        onClick={() => {
                          if (message.role === 'assistant' && message.emotion) {
                            toggleDebugInfo(message.id);
                          }
                        }}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>

                        {/* Debug info section - only show emotion for assistant messages */}
                        {message.role === 'assistant' && message.showDebug && message.emotion && (
                          <div className="mt-2 pt-2 border-t border-gray-300">
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">Emotion:</span> {message.emotion}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg px-4 py-2">
                        <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4">
                  <div
                    ref={inputBorderRef}
                    className="relative rounded-full"
                    style={{
                      padding: '2px',
                      background: 'linear-gradient(white, white) padding-box, conic-gradient(from 0deg, #E5EDFF 0%, #C7D2FE 25%, #D8B4FE 50%, #C7D2FE 75%, #E5EDFF 100%) border-box',
                      border: '2px solid transparent',
                    }}
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      disabled={isLoading}
                      className="w-full pl-4 pr-12 py-3 bg-white rounded-full focus:outline-none disabled:opacity-50 placeholder:text-[#D4D3D3]"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full disabled:cursor-not-allowed transition-colors ${
                        !input.trim() || isLoading
                          ? 'bg-gray-200 text-gray-600 opacity-30'
                          : 'bg-[#8B5CF6] text-white hover:bg-[#7C3AED]'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
