/**
 * Chat history storage utilities
 * Manages conversation sessions in localStorage
 */

const STORAGE_KEY_SESSIONS = 'anty-chat-sessions';
const STORAGE_KEY_CURRENT_SESSION = 'anty-chat-current-session';
const MAX_SESSIONS = 50; // Keep last 50 conversations

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO string for storage
  emotion?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate a title from the first user message
 */
export function generateTitle(messages: ChatMessage[]): string {
  const firstUserMessage = messages.find(m => m.role === 'user');
  if (!firstUserMessage) return 'New Chat';

  // Truncate to ~40 chars
  const content = firstUserMessage.content.trim();
  if (content.length <= 40) return content;
  return content.substring(0, 37) + '...';
}

/**
 * Get all saved sessions, sorted by most recent first
 */
export function getSessions(): ChatSession[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (!stored) return [];
    const sessions: ChatSession[] = JSON.parse(stored);
    // Sort by updatedAt descending
    return sessions.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[CHAT HISTORY] Failed to parse stored sessions:', error);
    }
    return [];
  }
}

/**
 * Get a specific session by ID
 */
export function getSession(id: string): ChatSession | null {
  const sessions = getSessions();
  return sessions.find(s => s.id === id) || null;
}

/**
 * Save a session (create or update)
 */
export function saveSession(session: ChatSession): void {
  const sessions = getSessions();
  const existingIndex = sessions.findIndex(s => s.id === session.id);

  if (existingIndex >= 0) {
    sessions[existingIndex] = session;
  } else {
    sessions.unshift(session);
  }

  // Trim to max sessions
  const trimmed = sessions.slice(0, MAX_SESSIONS);

  localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(trimmed));
}

/**
 * Delete a session by ID
 */
export function deleteSession(id: string): void {
  const sessions = getSessions();
  const filtered = sessions.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(filtered));

  // Clear current session if it was deleted
  if (getCurrentSessionId() === id) {
    clearCurrentSessionId();
  }
}

/**
 * Get the current session ID
 */
export function getCurrentSessionId(): string | null {
  return localStorage.getItem(STORAGE_KEY_CURRENT_SESSION);
}

/**
 * Set the current session ID
 */
export function setCurrentSessionId(id: string): void {
  localStorage.setItem(STORAGE_KEY_CURRENT_SESSION, id);
}

/**
 * Clear the current session ID
 */
export function clearCurrentSessionId(): void {
  localStorage.removeItem(STORAGE_KEY_CURRENT_SESSION);
}

/**
 * Create a new empty session and set it as current
 */
export function createNewSession(): ChatSession {
  const now = new Date().toISOString();
  const session: ChatSession = {
    id: generateSessionId(),
    title: 'New Chat',
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
  saveSession(session);
  setCurrentSessionId(session.id);
  return session;
}

/**
 * Format a date for display in the history list
 */
export function formatSessionDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Today - show time
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'long' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}
