# Anty Chat Feature

## Overview

Anty now has an interactive chat experience powered by ChatGPT! When you chat with Anty, he reacts emotionally to the conversation in real-time, displaying his full range of 14+ expressions.

## How to Use

1. **Start the dev server**: `npm run dev`
2. **Open the app**: Navigate to `http://localhost:3001` (or whatever port Next.js assigns)
3. **Click the orange chat button**: It's the first button in the bottom row (with the grid/mesh icon)
4. **Enter your OpenAI API key**: On first use, you'll be prompted to enter your API key
   - Get an API key from: https://platform.openai.com/api-keys
   - Your key is stored in `localStorage` only (never sent to any server except OpenAI)
5. **Start chatting!**: Type a message and watch Anty react with emotions

## Features

### Emotional Reactions
Anty will react to the conversation with expressions like:
- **Happy** 😊 - When things go well or you say nice things
- **Excited** 🎉 - When something really cool happens
- **Shocked** 😲 - When surprised by something unexpected
- **Sad** 😢 - When something unfortunate happens
- **Wink** 😉 - During playful or flirty moments
- **Idea** 💡 - When having an insight or eureka moment
- **Nod** ✅ - To confirm or agree
- **Headshake** ❌ - To disagree
- **Look-left/right** 👀 - When thinking or considering options
- **Spin** 🎊 - When celebrating

### UI Features
- **Slide-in panel** from the right side
- **Auto-scroll** to latest messages
- **Streaming responses** - Messages appear word-by-word in real-time (emotion tags hidden during streaming)
- **Typing indicator** while Anty is thinking
- **Timestamp** on each message
- **Clickable debug info** - Click any assistant message to see detected emotion and raw response
- **API key management** (store, change, or clear)
- **Responsive design** (works on mobile and desktop)
- **Specific error messages** - Clear feedback for different error types (invalid API key, rate limits, network issues, etc.)

## Architecture

### Components Created
1. **ChatPanel** (`components/anty-chat/chat-panel.tsx`)
   - Main chat UI component
   - Handles message state and API calls
   - Triggers Anty's emotional reactions

2. **AntyChat Client** (`lib/chat/openai-client.ts`)
   - OpenAI API integration
   - Streaming message responses
   - Emotion tag parsing

3. **Emotion Mapper** (`lib/chat/emotion-mapper.ts`)
   - Maps emotion tags to Anty expressions
   - Handles synonyms and aliases

### How Emotions Work

The ChatGPT model is instructed to include emotion tags in its responses like this:
```
[EMOTION:happy] I'd love to help you with that!
```

The chat panel:
1. Receives the message from ChatGPT
2. Extracts the emotion tag (e.g., "happy")
3. Maps it to an Anty expression (via `emotion-mapper.ts`)
4. Triggers the `onEmotion` callback
5. Anty displays the emotion for 3 seconds
6. Anty returns to "idle" state

The emotion tag is stripped from the displayed message, so users only see the clean text.

### Integration Points

**Modified Files:**
- `app/page.tsx`: Added chat panel state and integrated with Anty's expression system
  - Added `isChatOpen` state
  - Modified chat button handler to open panel (instead of tilt animation)
  - Added `ChatPanel` component with emotion callback

**New Files:**
- `components/anty-chat/chat-panel.tsx`
- `components/anty-chat/index.ts`
- `lib/chat/openai-client.ts`
- `lib/chat/emotion-mapper.ts`

## Demo Tips

For the best demo experience:

1. **Ask emotional questions**:
   - "That's amazing!" → Anty gets excited 🎉
   - "Can you help me with something?" → Anty looks happy 😊
   - "Oh no, something broke!" → Anty looks sad 😢
   - "Wow, I didn't expect that!" → Anty looks shocked 😲

2. **Try different conversation styles**:
   - Playful/joking → Anty winks 😉
   - Ask for ideas → Anty has lightbulb moments 💡
   - Celebrate achievements → Anty spins with joy 🎊

3. **Watch the reactions**: The emotions happen in real-time as Anty responds

## Future Enhancements

As mentioned, there's a stretch goal to integrate **SearchAF's search capabilities**:
- Search through files
- Return relevant results
- Anty helps explain search results
- Document retrieval and Q&A

The current architecture supports this - you would:
1. Add a search API endpoint or client
2. Modify the system prompt to include search capabilities
3. Parse search queries and trigger searches
4. Return results in the chat

## API Costs

ChatGPT API usage costs money. The chat uses the `gpt-4o-mini` model with:
- Max tokens: 300 per response
- Temperature: 0.8 (for more creative/emotional responses)
- Streaming enabled (messages appear word-by-word in real-time)

Using GPT-4o-mini provides 60x cost savings compared to GPT-4 while maintaining excellent quality for this use case. Typical costs are fractions of a cent per conversation.

## Troubleshooting

**Chat panel doesn't open**:
- Check the browser console for errors
- Make sure the dev server is running

**"API key error"**:
- Verify your API key is valid
- Check you have credits in your OpenAI account
- Click the key icon to re-enter your API key

**Anty doesn't react**:
- Click on any assistant message to see debug info
- The debug section shows:
  - What emotion was detected in the AI response
  - The raw response including emotion tags
- The AI should include emotion tags like `[EMOTION:happy]` in responses
- Try asking more emotional questions to trigger reactions
- If no emotion shows in debug info, the AI may not be including emotion tags

**Build errors**:
- The build may show TypeScript errors in `anty-character-v3.tsx` (pre-existing issue)
- The app runs fine in dev mode despite this

## Technologies Used

- **Next.js 15** with App Router
- **OpenAI SDK** (`openai` package)
- **Framer Motion** for slide-in animations
- **Lucide React** for icons
- **Tailwind CSS 4** for styling
- **TypeScript** (strict mode)

---

Enjoy chatting with Anty! 🐜✨
