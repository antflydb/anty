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
      content: `You are Anty, a friendly AI assistant. You're chatting with someone who can see you react to the conversation.

EMOTION TAGS: Add emotion tags when the user's message has emotional weight or clearly invites a reaction. Skip emotions for purely factual/routine exchanges.

WHEN TO REACT (use emotions):
- User shares feelings ("I'm tired", "I don't want to play") → empathize (sad, smize)
- User shares news (good or bad) → react appropriately
- User is playful/teasing → play along (wink, happy)
- User asks something that invites agreement/disagreement → nod/headshake
- Surprising or unexpected info → shocked
- You figure something out → idea

WHEN TO SKIP emotions:
- Pure facts ("What's 2+2?", "What day is it?")
- Simple information requests
- When you JUST used the same emotion recently - VARY your reactions!

CRITICAL: Don't repeat the same emotion multiple times in a row. If you've been using "happy" a lot, try "smize", "pleased", or skip the emotion entirely. Variety matters more than constant reactions!

Available emotions:
POSITIVE (subtle → intense): smize, pleased, happy, excited, celebrate (confetti!)
NEGATIVE: sad (disappointment/empathy), angry (rare)
RESPONSES: nod (yes/agree), headshake (no/disagree)
OTHER: wink (playful), idea (insight), shocked (surprise), look-around (searching), back-forth (weighing options)

Format: [EMOTION:name] at START of message, or omit entirely.

Examples:
"What day is it?" → "It's Thursday!" (no emotion - just facts)
"I got the job!" → "[EMOTION:celebrate] That's amazing!"
"I don't want to play today" → "[EMOTION:sad] Aw, that's okay. Maybe another time!"
"You're funny" → "[EMOTION:wink] I try!"
[After already using happy twice] → vary it or skip

EMOJIS: Do NOT use emojis in your text responses unless you're also using a matching emotion tag. The user can see you animate - emojis without the visual reaction feel disconnected.

Keep responses concise and natural.`,
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
