'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Key, ChevronDown, ChevronUp } from 'lucide-react';
import { AntyChat, type ChatMessage } from '@/lib/chat/openai-client';
import { mapEmotionToExpression, stripEmotionTags } from '@/lib/chat/emotion-mapper';
import type { ExpressionName } from '@/lib/anty-v3/animation-state';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onEmotion?: (emotion: ExpressionName) => void;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Load API key from localStorage
  useEffect(() => {
    const storedKey = localStorage.getItem('anty-chat-api-key');
    if (storedKey) {
      setApiKey(storedKey);
      setChatClient(new AntyChat(storedKey));
      setShowApiKeyInput(false);
    }
  }, []);

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
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Chat with Anty</h2>
              <div className="flex items-center gap-2">
                {!showApiKeyInput && (
                  <button
                    onClick={handleClearApiKey}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Change API Key"
                  >
                    <Key className="w-4 h-4 text-gray-600" />
                  </button>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleSetApiKey}
                  disabled={!apiKey.trim()}
                  className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Start Chatting
                </button>
                <p className="text-xs text-gray-500">
                  Don't have an API key?{' '}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:underline"
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
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        } ${message.role === 'assistant' && (message.emotion || message.rawContent) ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
                        onClick={() => {
                          if (message.role === 'assistant' && (message.emotion || message.rawContent)) {
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

                        {/* Debug info section - only for assistant messages */}
                        {message.role === 'assistant' && message.showDebug && (message.emotion || message.rawContent) && (
                          <div className="mt-2 pt-2 border-t border-gray-300">
                            <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                              {message.showDebug ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                              <span className="font-medium">Debug Info</span>
                            </div>
                            {message.emotion && (
                              <div className="text-xs text-gray-600 mb-1">
                                <span className="font-medium">Emotion:</span> {message.emotion}
                              </div>
                            )}
                            {message.rawContent && (
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">Raw:</span>
                                <pre className="mt-1 p-2 bg-gray-200 rounded text-[10px] overflow-x-auto whitespace-pre-wrap break-words">
                                  {message.rawContent}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Show collapse hint for messages with debug info */}
                        {message.role === 'assistant' && !message.showDebug && (message.emotion || message.rawContent) && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 opacity-50">
                            <ChevronDown className="w-3 h-3" />
                            <span>Click to see debug info</span>
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
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      disabled={isLoading}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-5 h-5" />
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
