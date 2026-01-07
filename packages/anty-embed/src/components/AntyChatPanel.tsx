'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Send, Loader2, Key, MoreVertical, MessageSquarePlus, History, Trash2, ChevronLeft } from 'lucide-react';
import gsap from 'gsap';
import { AntyChat, type ChatMessage } from '../lib/chat/openai-client';
import { mapEmotionToExpression, stripEmotionTagsStreaming } from '../lib/chat/emotion-mapper';
import type { EmotionType } from '../lib/animation/types';
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
} from '../lib/chat/history';

export interface AntyChatPanelProps {
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

export function AntyChatPanel({ isOpen, onClose, onEmotion }: AntyChatPanelProps) {
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
  const [isVisible, setIsVisible] = useState(false); // For GSAP exit animation
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
  const isAnimatingRef = useRef(false);

  const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  // Handle panel enter/exit animations with GSAP (replaces Framer Motion)
  useEffect(() => {
    if (isOpen && !isVisible) {
      // Opening: show immediately, then animate in
      setIsVisible(true);
    } else if (!isOpen && isVisible && panelRef.current && !isAnimatingRef.current) {
      // Closing: animate out, then hide
      isAnimatingRef.current = true;
      gsap.to(panelRef.current, {
        x: '100%',
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          setIsVisible(false);
          isAnimatingRef.current = false;
        },
      });
    }
  }, [isOpen, isVisible]);

  // Animate panel in when it becomes visible
  useEffect(() => {
    if (isVisible && panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { x: '100%' },
        { x: 0, duration: 0.4, ease: 'power3.out' }
      );
    }
  }, [isVisible]);

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
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[CHAT UI] Error sending message:', error);
      }

      // Remove the placeholder message
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));

      // Show specific error message
      const errorContent = error instanceof Error ? error.message : 'Oops! Something went wrong. Please try again.';
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: errorContent,
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

  // Inline styles to avoid Tailwind dependency
  const styles = {
    panel: {
      position: 'fixed' as const,
      right: '10px',
      top: '10px',
      bottom: '10px',
      width: '384px',
      maxWidth: 'calc(100vw - 20px)',
      backgroundColor: 'white',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column' as const,
      borderRadius: '16px',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px',
    },
    headerTitle: {
      fontSize: '18px',
      fontWeight: 600,
      color: '#111827',
      paddingLeft: '8px',
    },
    headerButtons: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    iconButton: {
      padding: '8px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    messagesContainer: {
      flex: 1,
      overflowY: 'auto' as const,
      padding: '16px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px',
    },
    messageRow: (isUser: boolean) => ({
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
    }),
    messageBubble: (isUser: boolean) => ({
      maxWidth: '80%',
      borderRadius: '8px',
      padding: '8px 16px',
      backgroundColor: isUser ? '#8B5CF6' : '#f3f4f6',
      color: isUser ? 'white' : '#111827',
      cursor: !isUser ? 'pointer' : 'default',
    }),
    messageText: {
      fontSize: '14px',
      margin: 0,
    },
    messageTime: {
      fontSize: '12px',
      opacity: 0.7,
      marginTop: '4px',
    },
    inputContainer: {
      padding: '16px',
    },
    inputBorder: {
      position: 'relative' as const,
      borderRadius: '12px',
      padding: '2px',
      background: 'linear-gradient(white, white) padding-box, conic-gradient(from 0deg, #E5EDFF 0%, #C7D2FE 25%, #D8B4FE 50%, #C7D2FE 75%, #E5EDFF 100%) border-box',
      border: '2px solid transparent',
    },
    textarea: {
      width: '100%',
      paddingLeft: '16px',
      paddingRight: '48px',
      paddingTop: '12px',
      paddingBottom: '12px',
      backgroundColor: 'white',
      borderRadius: '10px',
      outline: 'none',
      border: 'none',
      resize: 'none' as const,
      fontSize: '14px',
      lineHeight: '24px',
      minHeight: '48px',
      maxHeight: '72px',
    },
    sendButton: (disabled: boolean) => ({
      position: 'absolute' as const,
      right: '12px',
      bottom: '8px',
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      border: 'none',
      backgroundColor: disabled ? '#e5e7eb' : '#8B5CF6',
      color: disabled ? '#6b7280' : 'white',
      opacity: disabled ? 0.3 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
    }),
    apiKeyContainer: {
      padding: '24px',
    },
    apiKeyTitle: {
      fontSize: '14px',
      fontWeight: 500,
      color: '#374151',
      marginBottom: '8px',
    },
    apiKeyDescription: {
      fontSize: '12px',
      color: '#6b7280',
      marginBottom: '16px',
    },
    apiKeyInput: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      outline: 'none',
      fontSize: '14px',
    },
    apiKeyButton: {
      width: '100%',
      padding: '8px 16px',
      backgroundColor: '#8B5CF6',
      color: 'white',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      marginTop: '16px',
      fontSize: '14px',
      fontWeight: 500,
    },
    historyItem: (isActive: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      cursor: 'pointer',
      backgroundColor: isActive ? '#f3e8ff' : 'transparent',
      borderBottom: '1px solid #f3f4f6',
    }),
    historyTitle: {
      fontSize: '14px',
      fontWeight: 500,
      color: '#111827',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const,
    },
    historyMeta: {
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '2px',
    },
    menu: {
      position: 'absolute' as const,
      right: 0,
      top: '100%',
      marginTop: '4px',
      width: '192px',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      padding: '4px 0',
      zIndex: 10,
    },
    menuItem: {
      width: '100%',
      padding: '8px 16px',
      textAlign: 'left' as const,
      fontSize: '14px',
      color: '#374151',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    loadingBubble: {
      backgroundColor: '#f3f4f6',
      borderRadius: '8px',
      padding: '8px 16px',
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      color: '#4b5563',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      paddingLeft: '4px',
      fontSize: '18px',
      fontWeight: 600,
    },
    emptyHistory: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: '#9ca3af',
      padding: '32px',
    },
  };

  return (
    <>
      {isVisible && (
        <>
          {/* Panel */}
          <div
            ref={panelRef}
            style={{ ...styles.panel, transform: 'translateX(100%)' }}
          >
            {/* Header */}
            <div style={styles.header}>
              {showHistory ? (
                <button
                  onClick={() => setShowHistory(false)}
                  style={styles.backButton}
                >
                  <ChevronLeft size={20} />
                  <span>History</span>
                </button>
              ) : (
                <h2 style={styles.headerTitle}>Anty Chat</h2>
              )}
              <div style={styles.headerButtons}>
                {!showApiKeyInput && !showHistory && (
                  <>
                    <button
                      onClick={handleNewChat}
                      style={styles.iconButton}
                      title="New Chat"
                    >
                      <MessageSquarePlus size={20} color="#4b5563" />
                    </button>
                    <button
                      onClick={() => {
                        setSessions(getSessions()); // Refresh before showing
                        setShowHistory(true);
                      }}
                      style={styles.iconButton}
                      title="Chat History"
                    >
                      <History size={20} color="#4b5563" />
                    </button>
                    <div style={{ position: 'relative' }} ref={menuRef}>
                      <button
                        onClick={() => setShowMenu(!showMenu)}
                        style={styles.iconButton}
                        title="Menu"
                      >
                        <MoreVertical size={20} color="#4b5563" />
                      </button>
                      {showMenu && (
                        <div style={styles.menu}>
                          <button
                            onClick={handleClearApiKey}
                            style={styles.menuItem}
                          >
                            <Key size={16} />
                            Change API Key
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
                <button
                  onClick={onClose}
                  style={styles.iconButton}
                >
                  <X size={20} color="#4b5563" />
                </button>
              </div>
            </div>

            {/* API Key Input */}
            {showApiKeyInput && (
              <div style={styles.apiKeyContainer}>
                <div>
                  <h3 style={styles.apiKeyTitle}>
                    Enter your OpenAI API Key
                  </h3>
                  <p style={styles.apiKeyDescription}>
                    Your API key is stored locally and never sent to our servers.
                  </p>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="sk-..."
                    style={styles.apiKeyInput}
                  />
                </div>
                <button
                  onClick={handleSetApiKey}
                  disabled={!apiKey.trim()}
                  style={{
                    ...styles.apiKeyButton,
                    opacity: !apiKey.trim() ? 0.5 : 1,
                    cursor: !apiKey.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  Start Chatting
                </button>
                <p style={{ ...styles.apiKeyDescription, marginTop: '16px' }}>
                  Don't have an API key?{' '}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#8B5CF6' }}
                  >
                    Get one here
                  </a>
                </p>
              </div>
            )}

            {/* History View */}
            {!showApiKeyInput && showHistory && (
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {sessions.filter(s => s.messages.some(m => m.role === 'user')).length === 0 ? (
                  <div style={styles.emptyHistory}>
                    <History size={48} style={{ opacity: 0.5, marginBottom: '12px' }} />
                    <p style={{ fontSize: '14px' }}>No chat history yet</p>
                  </div>
                ) : (
                  <div>
                    {sessions.filter(s => s.messages.some(m => m.role === 'user')).map((session) => (
                      <div
                        key={session.id}
                        onClick={() => handleSelectSession(session.id)}
                        style={styles.historyItem(session.id === currentSessionId)}
                      >
                        <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                          <p style={styles.historyTitle}>
                            {session.title}
                          </p>
                          <p style={styles.historyMeta}>
                            {formatSessionDate(session.updatedAt)} · {session.messages.length} messages
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          style={{ ...styles.iconButton, padding: '6px' }}
                          title="Delete chat"
                        >
                          <Trash2 size={16} color="#9ca3af" />
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
                <div style={styles.messagesContainer}>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      style={styles.messageRow(message.role === 'user')}
                    >
                      <div
                        style={styles.messageBubble(message.role === 'user')}
                        onClick={() => {
                          if (message.role === 'assistant' && message.emotion) {
                            toggleDebugInfo(message.id);
                          }
                        }}
                      >
                        <p style={styles.messageText}>{message.content}</p>
                        <p style={styles.messageTime}>
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>

                        {/* Debug info section - only show emotion for assistant messages */}
                        {message.role === 'assistant' && message.showDebug && message.emotion && (
                          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #d1d5db' }}>
                            <div style={{ fontSize: '12px', color: '#4b5563' }}>
                              <span style={{ fontWeight: 500 }}>Emotion:</span> {message.emotion}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <div style={styles.loadingBubble}>
                        <Loader2 size={20} color="#4b5563" style={{ animation: 'spin 1s linear infinite' }} />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div style={styles.inputContainer}>
                  {!messages.some(m => m.role === 'user') && (
                    <div style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'left', marginBottom: '8px', paddingLeft: '4px' }}>
                      GPT-4o-mini — API connected
                    </div>
                  )}
                  <div
                    ref={inputBorderRef}
                    style={styles.inputBorder}
                  >
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      disabled={isLoading}
                      rows={1}
                      style={styles.textarea}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      style={styles.sendButton(!input.trim() || isLoading)}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* CSS for spinner animation */}
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </>
      )}
    </>
  );
}
