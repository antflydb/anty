import OpenAI from 'openai';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  message: string;
  emotion?: string;
}

export class AntyChat {
  private client: OpenAI | null = null;
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || null;
    if (this.apiKey) {
      this.client = new OpenAI({
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: true, // For demo purposes
      });
    }
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  async sendMessage(
    messages: ChatMessage[],
    onChunk?: (chunk: string) => void
  ): Promise<ChatResponse> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized. Please set API key.');
    }

    const systemPrompt: ChatMessage = {
      role: 'system',
      content: `You are Anty, a helpful AI assistant with emotions. You're chatting with someone who can see you react to the conversation.

IMPORTANT: Include emotion tags in your responses to show how you feel. Add emotion tags like this: [EMOTION:happy], [EMOTION:excited], [EMOTION:shocked], etc.

Available emotions:
- happy: Use when things go well, user says nice things, or you're excited to help
- excited: Use when something really cool happens or you're very enthusiastic
- shocked: Use when surprised by something unexpected
- sad: Use when something unfortunate happens or user is having trouble
- angry: Use when frustrated or something goes wrong (use sparingly)
- wink: Use for playful, flirty, or joking moments
- idea: Use when you have an insight or eureka moment
- nod: Use to confirm or agree
- headshake: Use to disagree or say no
- look-left/look-right: Use when thinking or considering options
- spin: Use when very excited or celebrating

Add ONE emotion tag per response, at the START of your message. Example:
[EMOTION:happy] I'd love to help you with that!

Keep responses concise and friendly. Remember, you're demonstrating your emotional range to show off Anty's capabilities!`,
    };

    const allMessages = [systemPrompt, ...messages];

    try {
      const stream = await this.client.chat.completions.create({
        model: 'gpt-4o-mini', // Changed from gpt-4 for 60x cost savings
        messages: allMessages,
        stream: true,
        temperature: 0.8,
        max_tokens: 300,
      });

      let fullMessage = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullMessage += content;
          onChunk?.(content);
        }
      }

      // Parse emotion from response
      const emotionMatch = fullMessage.match(/\[EMOTION:(\w+(?:-\w+)?)\]/);
      const emotion = emotionMatch ? emotionMatch[1] : undefined;

      // Remove emotion tag from displayed message
      const cleanMessage = fullMessage.replace(/\[EMOTION:\w+(?:-\w+)?\]\s*/g, '');

      console.log('[CHAT] Full response:', fullMessage);
      console.log('[CHAT] Detected emotion:', emotion);
      console.log('[CHAT] Clean message:', cleanMessage);

      return {
        message: cleanMessage,
        emotion,
      };
    } catch (error: any) {
      console.error('[CHAT] Error sending message:', error);

      // Provide specific error messages
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error?.status === 401) {
        errorMessage = 'Invalid API key. Please check your OpenAI API key and try again.';
      } else if (error?.status === 429) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
      } else if (error?.status === 500 || error?.status === 503) {
        errorMessage = 'OpenAI service is currently unavailable. Please try again later.';
      } else if (error?.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error?.code === 'insufficient_quota') {
        errorMessage = 'Your OpenAI account has insufficient credits. Please add credits to your account.';
      }

      throw new Error(errorMessage);
    }
  }
}

export const createAntyChat = (apiKey?: string) => new AntyChat(apiKey);
