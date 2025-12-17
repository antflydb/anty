# Anty Redesign Plan - Simplified Tamagotchi

**Date**: 2025-12-16
**Status**: New Plan Based on User Specifications
**Figma References**:
- Layout: https://www.figma.com/design/nu19JQ7QO9gEKVrnSaKYV0/antfly?node-id=577-193
- Expressions: https://www.figma.com/design/nu19JQ7QO9gEKVrnSaKYV0/antfly?node-id=574-144

---

## Part 1: Core Requirements

### Visual Design from Figma

#### Expressions (6 Total)
From Figma node 574-144, these are the CORRECT eye designs:

1. **logo/normal** - NEVER USE AS DEFAULT (logo state only)
2. **idle** - DEFAULT EXPRESSION (rounded pill-shaped eyes, vertical orientation)
3. **happy** - Eyes raised up, more curved/rounded
4. **wink** - Left eye open (pill shape), right eye horizontal line
5. **sad** - Eyes curved downward in sad arch shape
6. **blink** - Both eyes as horizontal lines

**CRITICAL**: The eyes are **rounded pill/oval shapes**, NOT triangular arrows. Must extract exact SVG paths from Figma.

#### Layout from Figma
From node 577-193:
- White background
- Anty centered and large
- 4 circular buttons at bottom (orange highlighted = active)
- Minimal UI, clean spacing
- Small icons in top-right corner (menu/settings)

### Game Mechanics (Simplified)

#### Single Stat: Mood (0-3 Hearts)
```
0 hearts = Grumpy/Sad
1 heart = Neutral
2 hearts = Content
3 hearts = Happy/Psyched
```

#### Four Core Actions
1. **CHAT** - Talk to Anty (placeholder button for now)
   - Increases mood +1 heart
   - Shows chat expression (if we create one)

2. **FACES** - Expression menu (dropdown/popup)
   - Shows all 6 expressions
   - User can manually trigger expressions
   - Doesn't affect mood, just visual

3. **GAME(S)** - Play with Anty (TBD which game)
   - Increases mood +1 heart
   - Shows happy/excited expression during play

4. **EAT** - Give candy
   - Increases mood +1 heart
   - Shows happy/eating expression

#### Mood Decay
- Mood decreases by 1 heart every 2-3 hours (TBD exact timing)
- At 0 hearts, Anty shows sad expression automatically
- At 3 hearts, Anty shows happy expression automatically

---

## Part 2: Expression System Overhaul

### Current Problem
We created completely wrong eye shapes:
- Used triangular/arrow shapes from logo
- Created 15 expressions without Figma reference
- Eyes don't match user's design at all

### Solution: Extract from Figma

#### Step 1: Get SVG Paths from Figma
For each expression (idle, happy, wink, sad, blink):
1. Export LEFT eye SVG path
2. Export RIGHT eye SVG path
3. Keep LEFT and RIGHT bracket paths (same for all)

#### Step 2: Create Expression Map
```typescript
interface AntyExpression {
  leftEye: string;    // SVG path
  rightEye: string;   // SVG path
  description: string;
}

const expressions: Record<ExpressionName, AntyExpression> = {
  idle: {
    leftEye: "M... [exact path from Figma]",
    rightEye: "M... [exact path from Figma]",
    description: "Default calm state"
  },
  happy: {
    leftEye: "M... [exact path from Figma]",
    rightEye: "M... [exact path from Figma]",
    description: "Joyful, content"
  },
  wink: {
    leftEye: "M... [exact path from Figma]",
    rightEye: "M... [exact path from Figma - horizontal line]",
    description: "Playful wink"
  },
  sad: {
    leftEye: "M... [exact path from Figma]",
    rightEye: "M... [exact path from Figma]",
    description: "Sad, low mood"
  },
  blink: {
    leftEye: "M... [exact path from Figma - horizontal line]",
    rightEye: "M... [exact path from Figma - horizontal line]",
    description: "Quick blink animation"
  }
};

// NEVER include 'logo' as usable expression
type ExpressionName = 'idle' | 'happy' | 'wink' | 'sad' | 'blink';
```

#### Step 3: Expression Trigger Logic
```typescript
function getExpressionByMood(hearts: number): ExpressionName {
  if (hearts === 0) return 'sad';
  if (hearts === 3) return 'happy';
  return 'idle'; // 1-2 hearts = neutral idle
}
```

### Eye Shape Reference (From Figma)

**Idle Eyes**:
- Vertical pill/oval shape
- Rounded ends
- Symmetrical left and right
- Positioned in center of character

**Happy Eyes**:
- Similar pill shape but curved upward
- Slightly more rounded/wider
- Eyes positioned higher

**Sad Eyes**:
- Curved downward arch
- Drooping appearance
- Eyes positioned lower or tilted

**Wink**:
- Left eye: normal idle pill shape
- Right eye: horizontal line (closed)

**Blink**:
- Both eyes: horizontal lines

---

## Part 3: Backend Architecture

### State Management

#### Core State
```typescript
interface AntyState {
  // Single stat
  mood: number; // 0-3 hearts

  // Visual state
  currentExpression: ExpressionName;
  manualExpression: ExpressionName | null; // Set by Faces menu

  // Timing
  lastInteraction: string; // ISO timestamp
  lastMoodDecay: string; // ISO timestamp
  createdAt: string;

  // Meta
  totalChats: number;
  totalGames: number;
  totalCandy: number;
}
```

#### Actions Architecture
```typescript
// lib/anty/actions.ts

type ActionName = 'chat' | 'game' | 'eat';

interface ActionResult {
  newMood: number;
  message: string;
  expression: ExpressionName;
}

function executeAction(
  action: ActionName,
  currentMood: number
): ActionResult {
  const newMood = Math.min(3, currentMood + 1); // Cap at 3 hearts

  const messages = {
    chat: "Anty enjoyed chatting with you!",
    game: "Anty had fun playing!",
    eat: "Yum! Anty loved that candy!"
  };

  return {
    newMood,
    message: messages[action],
    expression: newMood === 3 ? 'happy' : 'idle'
  };
}

function applyMoodDecay(
  currentMood: number,
  lastDecayTime: string
): { mood: number; didDecay: boolean } {
  const now = Date.now();
  const lastDecay = new Date(lastDecayTime).getTime();
  const hoursElapsed = (now - lastDecay) / (1000 * 60 * 60);

  // Decay every 2 hours
  if (hoursElapsed >= 2) {
    const decayAmount = Math.floor(hoursElapsed / 2);
    const newMood = Math.max(0, currentMood - decayAmount);
    return { mood: newMood, didDecay: true };
  }

  return { mood: currentMood, didDecay: false };
}
```

#### Expression Engine
```typescript
// hooks/anty/use-anty-expression.ts

interface ExpressionEngineState {
  displayExpression: ExpressionName;
  isBlinking: boolean;
  manualOverride: ExpressionName | null;
}

function useAntyExpression(mood: number, manualExpression?: ExpressionName | null) {
  const [isBlinking, setIsBlinking] = useState(false);

  // Random blinking every 3-7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, Math.random() * 4000 + 3000);

    return () => clearInterval(interval);
  }, []);

  // Determine display expression
  const baseExpression = manualExpression || getExpressionByMood(mood);
  const displayExpression = isBlinking ? 'blink' : baseExpression;

  return {
    displayExpression,
    isBlinking
  };
}
```

### Persistence
```typescript
// lib/anty/storage.ts

const STORAGE_KEY = 'anty-state-v2';

function saveState(state: AntyState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState(): AntyState | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    const state = JSON.parse(stored) as AntyState;

    // Apply mood decay on load
    const { mood, didDecay } = applyMoodDecay(state.mood, state.lastMoodDecay);

    return {
      ...state,
      mood,
      lastMoodDecay: didDecay ? new Date().toISOString() : state.lastMoodDecay
    };
  } catch {
    return null;
  }
}

function getInitialState(): AntyState {
  return {
    mood: 2, // Start with 2 hearts
    currentExpression: 'idle',
    manualExpression: null,
    lastInteraction: new Date().toISOString(),
    lastMoodDecay: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    totalChats: 0,
    totalGames: 0,
    totalCandy: 0
  };
}
```

---

## Part 4: Component Architecture

### Component Hierarchy
```
AntyPage
├── AntyCharacter (centered, large)
│   └── Uses current expression
├── MoodDisplay (0-3 hearts)
│   └── Shows filled/empty hearts
├── ActionButtons (bottom)
│   ├── ChatButton
│   ├── FacesButton (opens menu)
│   ├── GameButton
│   └── EatButton
└── FacesMenu (popup/dropdown)
    └── Expression selector grid
```

### New Components to Create

#### 1. MoodDisplay Component
```typescript
// components/anty/mood-display.tsx

interface MoodDisplayProps {
  hearts: number; // 0-3
}

export function MoodDisplay({ hearts }: MoodDisplayProps) {
  return (
    <div className="flex gap-2">
      {[0, 1, 2].map((index) => (
        <Heart key={index} filled={index < hearts} />
      ))}
    </div>
  );
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <div className={filled ? "text-red-500" : "text-gray-300"}>
      {filled ? "❤️" : "🤍"}
    </div>
  );
}
```

#### 2. ActionButtons Component
```typescript
// components/anty/action-buttons.tsx

interface ActionButtonsProps {
  onChat: () => void;
  onFaces: () => void;
  onGame: () => void;
  onEat: () => void;
}

export function ActionButtons({ onChat, onFaces, onGame, onEat }: ActionButtonsProps) {
  return (
    <div className="flex gap-4 justify-center">
      <ActionButton icon="💬" label="Chat" onClick={onChat} />
      <ActionButton icon="😊" label="Faces" onClick={onFaces} />
      <ActionButton icon="🎮" label="Game" onClick={onGame} />
      <ActionButton icon="🍬" label="Eat" onClick={onEat} />
    </div>
  );
}

function ActionButton({ icon, label, onClick }: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-orange-400 hover:bg-orange-500 transition-colors"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
}
```

#### 3. FacesMenu Component
```typescript
// components/anty/faces-menu.tsx

interface FacesMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExpression: (expression: ExpressionName) => void;
  currentExpression: ExpressionName;
}

export function FacesMenu({ isOpen, onClose, onSelectExpression, currentExpression }: FacesMenuProps) {
  if (!isOpen) return null;

  const expressions: ExpressionName[] = ['idle', 'happy', 'wink', 'sad', 'blink'];

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl p-4">
      <div className="grid grid-cols-3 gap-3">
        {expressions.map((expr) => (
          <button
            key={expr}
            onClick={() => {
              onSelectExpression(expr);
              onClose();
            }}
            className={`p-2 rounded ${
              currentExpression === expr ? 'bg-orange-100' : 'hover:bg-gray-100'
            }`}
          >
            <AntyCharacter expression={expr} size={60} />
            <p className="text-xs mt-1 capitalize">{expr}</p>
          </button>
        ))}
      </div>
      <button
        onClick={() => {
          onSelectExpression(null); // Reset to auto
          onClose();
        }}
        className="mt-3 w-full text-sm text-gray-600 hover:text-gray-800"
      >
        Auto (based on mood)
      </button>
    </div>
  );
}
```

#### 4. Updated AntyCharacter Component
```typescript
// components/anty/anty-character.tsx (REWRITE)

interface AntyCharacterProps {
  expression: ExpressionName;
  size?: number;
}

export function AntyCharacter({ expression, size = 200 }: AntyCharacterProps) {
  const { leftEye, rightEye } = expressions[expression];

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className="anty-character"
    >
      {/* Left bracket (static) */}
      <path
        d={staticBrackets.leftBracket}
        fill="#052333"
      />

      {/* Right bracket (static) */}
      <path
        d={staticBrackets.rightBracket}
        fill="#052333"
      />

      {/* Left eye (morphing) */}
      <path
        d={leftEye}
        fill="#052333"
      />

      {/* Right eye (morphing) */}
      <path
        d={rightEye}
        fill="#052333"
      />
    </svg>
  );
}
```

---

## Part 5: Page Layout

### Layout Structure (Matching Figma 577-193)
```
┌─────────────────────────────────────┐
│                          ⚙️ ℹ️ ☰    │ ← Top right icons
│                                     │
│                                     │
│         ┌─────────────┐            │
│         │             │            │
│         │    ANTY     │            │ ← Centered, large
│         │  (300px)    │            │
│         │             │            │
│         └─────────────┘            │
│                                     │
│           ❤️ ❤️ ❤️                  │ ← Mood hearts
│                                     │
│                                     │
│    ┌──┐  ┌──┐  ┌──┐  ┌──┐        │
│    │💬│  │😊│  │🎮│  │🍬│        │ ← 4 action buttons
│    └──┘  └──┘  └──┘  └──┘        │
│                                     │
└─────────────────────────────────────┘
```

### Page Component Structure
```typescript
// app/anty/page.tsx (COMPLETE REWRITE)

'use client';

import { useState, useEffect } from 'react';
import { AntyCharacter } from '@/components/anty/anty-character';
import { MoodDisplay } from '@/components/anty/mood-display';
import { ActionButtons } from '@/components/anty/action-buttons';
import { FacesMenu } from '@/components/anty/faces-menu';
import { useAntyExpression } from '@/hooks/anty/use-anty-expression';
import { executeAction, type ActionName } from '@/lib/anty/actions';
import { loadState, saveState, getInitialState } from '@/lib/anty/storage';
import type { AntyState } from '@/lib/anty/types';

export default function AntyPage() {
  const [state, setState] = useState<AntyState>(getInitialState());
  const [isHydrated, setIsHydrated] = useState(false);
  const [showFacesMenu, setShowFacesMenu] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const { displayExpression } = useAntyExpression(state.mood, state.manualExpression);

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadState();
    if (loaded) {
      setState(loaded);
    }
    setIsHydrated(true);
  }, []);

  // Save on state change
  useEffect(() => {
    if (isHydrated) {
      saveState(state);
    }
  }, [state, isHydrated]);

  const handleAction = (action: ActionName) => {
    const result = executeAction(action, state.mood);

    setState({
      ...state,
      mood: result.newMood,
      currentExpression: result.expression,
      lastInteraction: new Date().toISOString(),
      [`total${action.charAt(0).toUpperCase() + action.slice(1)}s`]:
        state[`total${action.charAt(0).toUpperCase() + action.slice(1)}s`] + 1
    });

    setFeedbackMessage(result.message);
    setTimeout(() => setFeedbackMessage(''), 3000);
  };

  const handleExpressionSelect = (expression: ExpressionName | null) => {
    setState({
      ...state,
      manualExpression: expression
    });
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Loading Anty...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Feedback Toast */}
      {feedbackMessage && (
        <div className="fixed top-4 right-4 bg-white shadow-lg rounded-lg px-6 py-4 border-l-4 border-orange-500">
          <p className="text-gray-800 font-medium">{feedbackMessage}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen gap-8">
        {/* Character */}
        <AntyCharacter expression={displayExpression} size={300} />

        {/* Mood Hearts */}
        <MoodDisplay hearts={state.mood} />

        {/* Action Buttons */}
        <ActionButtons
          onChat={() => handleAction('chat')}
          onFaces={() => setShowFacesMenu(true)}
          onGame={() => handleAction('game')}
          onEat={() => handleAction('eat')}
        />

        {/* Faces Menu */}
        <FacesMenu
          isOpen={showFacesMenu}
          onClose={() => setShowFacesMenu(false)}
          onSelectExpression={handleExpressionSelect}
          currentExpression={displayExpression}
        />
      </div>
    </div>
  );
}
```

---

## Part 6: Implementation Phases

### Phase 1: Expression System Fix (CRITICAL)
**Priority**: HIGHEST - User emphasized this multiple times

**Tasks**:
- [ ] Access Figma and export SVG paths for each expression
- [ ] Extract exact LEFT eye path for: idle, happy, wink, sad, blink
- [ ] Extract exact RIGHT eye path for: idle, happy, wink, sad, blink
- [ ] Verify brackets are correct (LEFT and RIGHT from logo)
- [ ] Create new `expressions-v2.ts` with correct paths
- [ ] Update AntyCharacter component to use new paths
- [ ] Test each expression renders correctly
- [ ] Verify with user before proceeding

**Files to Create/Update**:
- `/lib/anty/expressions-v2.ts` - New correct expressions
- `/components/anty/anty-character.tsx` - Rewrite to use correct paths
- `/lib/anty/types.ts` - Expression types

**Validation**:
- Compare rendered SVGs side-by-side with Figma
- All 5 expressions (idle, happy, wink, sad, blink) look correct
- Eyes are rounded pills/ovals, NOT triangles

---

### Phase 2: Backend Architecture
**Priority**: HIGH - Need foundation for interactions

**Tasks**:
- [ ] Create simplified action system (chat, game, eat)
- [ ] Implement 0-3 heart mood system
- [ ] Create mood decay logic (every 2 hours)
- [ ] Build localStorage persistence
- [ ] Create state management hooks
- [ ] Add expression auto-selection by mood

**Files to Create**:
- `/lib/anty/actions-v2.ts` - Simple 3-action system
- `/lib/anty/storage-v2.ts` - State persistence
- `/lib/anty/types-v2.ts` - New type definitions
- `/hooks/anty/use-anty-state.ts` - State management
- `/hooks/anty/use-anty-expression.ts` - Expression selection

**Remove/Archive**:
- `/lib/anty/interactions.ts` - Old 7-action system
- `/lib/anty/stat-system.ts` - Old 4-stat system
- `/lib/anty/time-decay.ts` - Old decay system
- All Phase 2 components (stat-display, action-panel)

---

### Phase 3: UI Components
**Priority**: MEDIUM - Build visual interface

**Tasks**:
- [ ] Create MoodDisplay component (hearts)
- [ ] Create ActionButtons component (4 buttons)
- [ ] Create FacesMenu component (expression selector)
- [ ] Update page layout to match Figma 577-193
- [ ] Implement white background, centered design
- [ ] Add feedback toast for actions

**Files to Create**:
- `/components/anty/mood-display.tsx`
- `/components/anty/action-buttons.tsx`
- `/components/anty/faces-menu.tsx`

**Files to Update**:
- `/app/anty/page.tsx` - Complete rewrite for new layout

---

### Phase 4: Polish & Features
**Priority**: LOW - Nice-to-haves

**Tasks**:
- [ ] Design mini-game(s) - TBD which type
- [ ] Implement chat placeholder UI
- [ ] Add sound effects (optional)
- [ ] Create stats screen (total chats/games/candy)
- [ ] Add animation polish
- [ ] Mobile responsive tweaks

---

## Part 7: Critical Differences from Old Implementation

### What We're REMOVING
- ❌ 7-action system (feed, play, rest, optimize, query, reindex, train)
- ❌ 4-stat system (energy, happiness, knowledge, indexHealth)
- ❌ Complex cooldown timers (6-16 seconds)
- ❌ 15 expressions (too many)
- ❌ Complex time decay calculations
- ❌ Gradient backgrounds
- ❌ Floating animations
- ❌ Multiple UI sections (stats, tips, info cards)
- ❌ Debug menu
- ❌ Triangle/arrow eye shapes

### What We're ADDING
- ✅ 3-action system (chat, game, eat) + faces menu
- ✅ 1-stat system (mood: 0-3 hearts)
- ✅ No cooldowns (simple interaction)
- ✅ 5 expressions (idle, happy, wink, sad, blink)
- ✅ Simple hourly decay
- ✅ Pure white background
- ✅ No idle animations (or minimal)
- ✅ Single centered view
- ✅ Clean minimal UI
- ✅ Correct rounded pill/oval eyes from Figma

---

## Part 8: Success Criteria

### Expression Success (Phase 1)
- [ ] Eyes match Figma designs exactly
- [ ] Idle is default (never logo)
- [ ] All 5 expressions render correctly
- [ ] Smooth morphing between expressions
- [ ] User approval: "These look right"

### Mechanics Success (Phase 2)
- [ ] Mood system works (0-3 hearts)
- [ ] Actions increase mood correctly
- [ ] Mood decays naturally over time
- [ ] State persists in localStorage
- [ ] Expression auto-changes based on mood

### UI Success (Phase 3)
- [ ] Matches Figma layout (577-193)
- [ ] White background, centered Anty
- [ ] 4 buttons work correctly
- [ ] Faces menu shows all expressions
- [ ] Clean, minimal design
- [ ] Mobile responsive

### Overall Success
- [ ] User rates design: 8+/10
- [ ] User rates function: 8+/10
- [ ] User rates instruction-following: 9+/10

---

## Part 9: Questions Before Starting

### Phase 1 (Expressions)
1. Can you provide direct access to Figma file for SVG export?
2. Do you want expressions to morph smoothly or snap instantly?
3. Should we keep any of the old expression variants (excited, tired, etc.)?

### Phase 2 (Mechanics)
4. Exact mood decay rate? (Currently planning 1 heart every 2 hours)
5. Should mood ever go negative or stay at 0?
6. What should "Chat" do besides increase mood? (Show text? Placeholder?)

### Phase 3 (UI)
7. Exact button styling from Figma? (Colors, sizes, spacing)
8. Should Faces menu be dropdown, popup, or modal?
9. Mobile layout: same as desktop or adjusted?

### Phase 4 (Future)
10. What type of game? (Suggestions: left/right guess, number guess, memory match)
11. Sound effects desired? (Beeps, boops, etc.)
12. Any special animations for eating candy or playing games?

---

## Part 10: File Structure Changes

### New Structure
```
lib/anty/
├── expressions-v2.ts         (NEW - correct Figma eyes)
├── actions-v2.ts              (NEW - 3 actions)
├── storage-v2.ts              (NEW - simple persistence)
├── types-v2.ts                (NEW - simplified types)
└── [archive old files]

components/anty/
├── anty-character.tsx         (REWRITE - use correct eyes)
├── mood-display.tsx           (NEW - heart display)
├── action-buttons.tsx         (NEW - 4 buttons)
├── faces-menu.tsx             (NEW - expression selector)
└── [remove stat-display, action-panel, debug-menu]

hooks/anty/
├── use-anty-state.ts          (NEW - state management)
├── use-anty-expression.ts     (NEW - expression logic)
└── [remove use-expression-engine, use-anty-state old]

app/anty/
└── page.tsx                   (COMPLETE REWRITE)
```

### Files to Archive (Not Delete)
Move to `/lib/anty/archive/`:
- `interactions.ts`
- `stat-system.ts`
- `time-decay.ts`
- `expressions.ts` (old wrong version)
- All old tests
- All old documentation

Keep for reference but don't use.

---

## Next Steps

1. **WAIT for user approval** of this plan
2. **Get Figma SVG export access** for expressions
3. **Start Phase 1** - Fix eyes to match Figma
4. **Validate Phase 1** with user before continuing
5. **Proceed to Phase 2** only after approval

---

**Status**: Awaiting user feedback and Figma access for Phase 1 implementation.
