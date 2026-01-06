/**
 * Chat history storage utilities
 * Manages conversation sessions in localStorage
 */
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    emotion?: string;
}
export interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: string;
    updatedAt: string;
}
/**
 * Generate a unique session ID
 */
export declare function generateSessionId(): string;
/**
 * Generate a title from the first user message
 */
export declare function generateTitle(messages: ChatMessage[]): string;
/**
 * Get all saved sessions, sorted by most recent first
 */
export declare function getSessions(): ChatSession[];
/**
 * Get a specific session by ID
 */
export declare function getSession(id: string): ChatSession | null;
/**
 * Save a session (create or update)
 */
export declare function saveSession(session: ChatSession): void;
/**
 * Delete a session by ID
 */
export declare function deleteSession(id: string): void;
/**
 * Get the current session ID
 */
export declare function getCurrentSessionId(): string | null;
/**
 * Set the current session ID
 */
export declare function setCurrentSessionId(id: string): void;
/**
 * Clear the current session ID
 */
export declare function clearCurrentSessionId(): void;
/**
 * Create a new empty session and set it as current
 */
export declare function createNewSession(): ChatSession;
/**
 * Format a date for display in the history list
 */
export declare function formatSessionDate(isoString: string): string;
