export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
export interface ChatResponse {
    message: string;
    emotion?: string;
}
export declare class AntyChat {
    private client;
    private apiKey;
    private initPromise;
    constructor(apiKey?: string);
    private initClient;
    private ensureClient;
    setApiKey(apiKey: string): Promise<void>;
    sendMessage(messages: ChatMessage[], onChunk?: (chunk: string) => void): Promise<ChatResponse>;
}
export declare const createAntyChat: (apiKey?: string) => AntyChat;
