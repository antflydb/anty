'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Key, MoreVertical, MessageSquarePlus, History, Trash2, ChevronLeft } from 'lucide-react';
import gsap from 'gsap';
import { AntyChat, type ChatMessage } from '@/lib/chat/openai-client';
import { mapEmotionToExpression, stripEmotionTags, stripEmotionTagsStreaming } from '@/lib/chat/emotion-mapper';
import type { EmotionType } from '@searchaf/anty-embed';
import {
  type ChatSession,
  type ChatMessage as StoredChatMessage,
  getSessions,
  getSession,
  saveSession,
  deleteSession,
  createNewSession,
  getCurrentSessionId,
  setCurrentSessionId,
  generateTitle,
  formatSessionDate,
} from '@/lib/chat/history';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onEmotion?: (emotion: EmotionType) => void;
}

// Convert between UI Message and stored ChatMessage formats
function toStoredMessage(msg: Message): StoredChatMessage {
  return {
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp.toISOString(),
    emotion: msg.emotion,
  };
}

function fromStoredMessage(msg: StoredChatMessage): Message {
  return {
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: new Date(msg.timestamp),
    emotion: msg.emotion,
  };
}

// Random greeting messages for Anty
const ANTY_GREETINGS = [
  "Hey! What's up?",
  "How's it going?",
  "What can I help you with?",
  "Heyo!",
  "Hey!",
  "What's going on?",
  "What's new?",
  "What can I do for you?",
  "What do you want to chat about?",
  "Hi there!",
  "Hey, good to see you!",
  "What's on your mind?",
  "Ready when you are!",
  "Let's chat!",
  "Hey friend!",
];

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
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionIdState] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputBorderRef = useRef<HTMLDivElement>(null);
  const borderTweenRef = useRef<gsap.core.Tween | null>(null);
  const initialLoadDone = useRef(false);
  const greetingInitiated = useRef(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  // Auto-scroll to bottom when new messages arrive or panel opens
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      // Small delay to ensure panel animation has started and content is rendered
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isOpen]);

  // Focus input when panel opens or API key input is dismissed
  useEffect(() => {
    if (isOpen && !showApiKeyInput && !isLoading) {
      // Small delay to ensure input is rendered after animation starts
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, showApiKeyInput, isLoading]);

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

  // Load sessions and current session on mount
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    // Load all sessions for history view
    setSessions(getSessions());

    // Try to restore current session
    const savedSessionId = getCurrentSessionId();
    if (savedSessionId) {
      const session = getSession(savedSessionId);
      if (session && session.messages.length > 0) {
        setCurrentSessionIdState(savedSessionId);
        setMessages(session.messages.map(fromStoredMessage));
      }
    }
  }, []);

  // Save messages to current session when they change
  useEffect(() => {
    if (!currentSessionId || messages.length === 0) return;

    const session = getSession(currentSessionId);
    if (session) {
      const updatedSession: ChatSession = {
        ...session,
        messages: messages.map(toStoredMessage),
        title: generateTitle(messages.map(toStoredMessage)),
        updatedAt: new Date().toISOString(),
      };
      saveSession(updatedSession);
      setSessions(getSessions()); // Refresh sessions list
    }
  }, [messages, currentSessionId]);

  // Add greeting when panel opens with no session
  useEffect(() => {
    // Reset when session changes
    if (!currentSessionId) {
      greetingInitiated.current = false;
    }
  }, [currentSessionId]);

  useEffect(() => {
    if (isOpen && !showApiKeyInput && messages.length === 0 && !currentSessionId) {
      // Create a new session
      const newSession = createNewSession();
      setCurrentSessionIdState(newSession.id);
    }
  }, [isOpen, showApiKeyInput, currentSessionId, messages.length]);

  useEffect(() => {
    if (isOpen && !showApiKeyInput && messages.length === 0 && currentSessionId && !greetingInitiated.current) {
      greetingInitiated.current = true;
      setIsLoading(true);

      const timer = setTimeout(() => {
        const randomGreeting = ANTY_GREETINGS[Math.floor(Math.random() * ANTY_GREETINGS.length)];
        const greetingMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: randomGreeting,
          timestamp: new Date(),
        };
        setMessages([greetingMessage]);
        setIsLoading(false);
      }, 400 + Math.random() * 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen, showApiKeyInput, currentSessionId, messages.length]);

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

  // Inactivity timer - reset chat after 5 minutes of no user messages
  useEffect(() => {
    // Only run when panel is open and we have a session with user messages
    const hasUserMessages = messages.some(m => m.role === 'user');
    if (!isOpen || !currentSessionId || !hasUserMessages || showApiKeyInput) {
      return;
    }

    const checkInactivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;

      if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
        // Save current session (already saved via messages effect) and start new chat
        const newSession = createNewSession();
        setCurrentSessionIdState(newSession.id);
        setMessages([]);
        greetingInitiated.current = false;
        setSessions(getSessions());

        // Show new greeting
        setIsLoading(true);
        setTimeout(() => {
          const randomGreeting = ANTY_GREETINGS[Math.floor(Math.random() * ANTY_GREETINGS.length)];
          const greetingMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: randomGreeting,
            timestamp: new Date(),
          };
          setMessages([greetingMessage]);
          setIsLoading(false);
          lastActivityRef.current = Date.now();
        }, 400 + Math.random() * 300);
      }
    };

    // Check every 30 seconds
    inactivityTimerRef.current = setInterval(checkInactivity, 30000);

    return () => {
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    };
  }, [isOpen, currentSessionId, messages, showApiKeyInput]);

  const handleSetApiKey = () => {
    if (!apiKey.trim()) return;
    localStorage.setItem('anty-chat-api-key', apiKey);
    setChatClient(new AntyChat(apiKey));
    setShowApiKeyInput(false);

    // Show loading then add welcome message with random greeting
    setIsLoading(true);
    setTimeout(() => {
      const randomGreeting = ANTY_GREETINGS[Math.floor(Math.random() * ANTY_GREETINGS.length)];
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: randomGreeting,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      setIsLoading(false);

      // Trigger happy emotion
      const expression = mapEmotionToExpression('happy');
      if (expression) {
        onEmotion?.(expression);
      }
    }, 400 + Math.random() * 300);
  };

  const handleSend = async () => {
    if (!input.trim() || !chatClient || isLoading) return;

    // Reset inactivity timer
    lastActivityRef.current = Date.now();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = '48px';
    }
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
        // Strip emotion tags from the displayed content during streaming (handles partial tags)
        const cleanChunk = stripEmotionTagsStreaming(rawResponse);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showApiKeyInput) {
        handleSetApiKey();
      } else {
        handleSend();
      }
    }
  };

  // Auto-resize textarea up to 3 lines
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    const textarea = e.target;
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';

    // Calculate line height (approximately 24px per line with padding)
    const lineHeight = 24;
    const maxLines = 3;
    const maxHeight = lineHeight * maxLines;

    // Set height to scrollHeight, but cap at maxHeight
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('anty-chat-api-key');
    setApiKey('');
    setChatClient(null);
    setShowApiKeyInput(true);
    setMessages([]);
    setCurrentSessionIdState(null);
    setShowMenu(false);
    setShowHistory(false);
  };

  const handleNewChat = () => {
    // Create a new session
    const newSession = createNewSession();
    setCurrentSessionIdState(newSession.id);
    setMessages([]);
    setShowMenu(false);
    setShowHistory(false);
    setSessions(getSessions());

    // Show new greeting after a brief delay
    setIsLoading(true);
    setTimeout(() => {
      const randomGreeting = ANTY_GREETINGS[Math.floor(Math.random() * ANTY_GREETINGS.length)];
      const greetingMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: randomGreeting,
        timestamp: new Date(),
      };
      setMessages([greetingMessage]);
      setIsLoading(false);
    }, 400 + Math.random() * 300);
  };

  const handleSelectSession = (sessionId: string) => {
    const session = getSession(sessionId);
    if (session) {
      setCurrentSessionIdState(sessionId);
      setCurrentSessionId(sessionId);
      setMessages(session.messages.map(fromStoredMessage));
      setShowHistory(false);
      // Reset inactivity timer when loading a session
      lastActivityRef.current = Date.now();
    }
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger select
    deleteSession(sessionId);
    setSessions(getSessions());

    // If we deleted the current session, clear it
    if (sessionId === currentSessionId) {
      setCurrentSessionIdState(null);
      setMessages([]);
    }
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
              {showHistory ? (
                <button
                  onClick={() => setShowHistory(false)}
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors pl-1"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="text-lg font-semibold">History</span>
                </button>
              ) : (
                <h2 className="text-lg font-semibold text-gray-900 pl-2">Anty Chat</h2>
              )}
              <div className="flex items-center gap-1">
                {!showApiKeyInput && !showHistory && (
                  <>
                    <button
                      onClick={handleNewChat}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="New Chat"
                    >
                      <MessageSquarePlus className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => {
                        setSessions(getSessions()); // Refresh before showing
                        setShowHistory(true);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Chat History"
                    >
                      <History className="w-5 h-5 text-gray-600" />
                    </button>
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
                  </>
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
                    onKeyDown={handleKeyDown}
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

            {/* History View */}
            {!showApiKeyInput && showHistory && (
              <div className="flex-1 overflow-y-auto">
                {sessions.filter(s => s.messages.some(m => m.role === 'user')).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                    <History className="w-12 h-12 mb-3 opacity-50" />
                    <p className="text-sm">No chat history yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {sessions.filter(s => s.messages.some(m => m.role === 'user')).map((session) => (
                      <div
                        key={session.id}
                        onClick={() => handleSelectSession(session.id)}
                        className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                          session.id === currentSessionId ? 'bg-purple-50' : ''
                        }`}
                      >
                        <div className="flex-1 min-w-0 pr-3">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {session.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatSessionDate(session.updatedAt)} · {session.messages.length} messages
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Delete chat"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Messages */}
            {!showApiKeyInput && !showHistory && (
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
                  {!messages.some(m => m.role === 'user') && (
                    <div className="text-xs text-gray-400 text-left mb-2 pl-1">
                      GPT-4o-mini — API connected
                    </div>
                  )}
                  <div
                    ref={inputBorderRef}
                    className="relative rounded-[12px]"
                    style={{
                      padding: '2px',
                      background: 'linear-gradient(white, white) padding-box, conic-gradient(from 0deg, #E5EDFF 0%, #C7D2FE 25%, #D8B4FE 50%, #C7D2FE 75%, #E5EDFF 100%) border-box',
                      border: '2px solid transparent',
                    }}
                  >
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      disabled={isLoading}
                      rows={1}
                      className="w-full pl-4 pr-12 py-3 bg-white rounded-[10px] focus:outline-none disabled:opacity-50 placeholder:text-[#D4D3D3] resize-none overflow-y-auto leading-6"
                      style={{ minHeight: '48px', maxHeight: '72px' }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className={`absolute right-3 bottom-2 w-8 h-8 flex items-center justify-center rounded-full disabled:cursor-not-allowed transition-colors ${
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
