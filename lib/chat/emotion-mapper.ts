import type { EmotionType } from '../anty/animation/types';

/**
 * Maps emotion tags from chat responses to Anty's emotion types
 */
export function mapEmotionToExpression(emotion: string | undefined): EmotionType | null {
  if (!emotion) {
    return null;
  }

  const emotionLower = emotion.toLowerCase();

  // Direct mappings
  const emotionMap: Record<string, EmotionType> = {
    // Core emotions
    'happy': 'happy',
    'excited': 'excited',
    'celebrate': 'celebrate',
    'pleased': 'pleased',
    'shocked': 'shocked',
    'sad': 'sad',
    'angry': 'angry',
    'wink': 'wink',
    'jump': 'jump',
    'idea': 'idea',
    'nod': 'nod',
    'headshake': 'headshake',
    'look-left': 'look-left',
    'look-right': 'look-right',
    'spin': 'spin',
    'back-forth': 'back-forth',
    'smize': 'smize',

    // ===========================================
    // POSITIVE EMOTION SCALE ALIASES
    // Level 5: celebrate (EPIC - confetti)
    // Level 4: excited (BIG - jump + spin)
    // Level 3: happy (EXPRESSIVE - wiggle)
    // Level 2: pleased (MODERATE - bounce + happy eyes)
    // Level 1: smize (SUBTLE - happy eyes only)
    // ===========================================

    // Level 5 - celebrate (major celebrations, confetti)
    'ecstatic': 'celebrate',
    'overjoyed': 'celebrate',
    'elated': 'celebrate',
    'thrilled': 'celebrate',
    'euphoric': 'celebrate',
    'celebrating': 'celebrate',

    // Level 4 - excited (victories, accomplishments, jump+spin)
    'victorious': 'excited',
    'triumphant': 'excited',
    'accomplished': 'excited',
    'pumped': 'excited',

    // Level 3 - happy (general positivity)
    'joy': 'happy',
    'joyful': 'happy',
    'delighted': 'happy',
    'cheerful': 'happy',
    'enthusiastic': 'happy',

    // Level 2 - pleased (mild positive)
    'content': 'pleased',
    'satisfied': 'pleased',
    'glad': 'pleased',
    'grateful': 'pleased',
    'thankful': 'pleased',
    'relieved': 'pleased',
    'amused': 'pleased',

    // Level 1 - smize (subtle contentment, eyes only)
    'warm': 'smize',
    'cozy': 'smize',
    'peaceful': 'smize',

    // ===========================================
    // OTHER EMOTION ALIASES
    // ===========================================

    // Shocked/surprised
    'surprised': 'shocked',
    'amazed': 'shocked',
    'astonished': 'shocked',
    'stunned': 'shocked',

    // Sad
    'unhappy': 'sad',
    'disappointed': 'sad',
    'upset': 'sad',
    'down': 'sad',
    'melancholy': 'sad',

    // Angry
    'mad': 'angry',
    'frustrated': 'angry',
    'annoyed': 'angry',
    'irritated': 'angry',

    // Playful
    'playful': 'wink',
    'flirty': 'wink',
    'cheeky': 'wink',
    'mischievous': 'wink',

    // Thinking
    'thinking': 'idea',
    'thoughtful': 'idea',
    'eureka': 'idea',
    'curious': 'idea',

    // Agreement/Disagreement
    'agree': 'nod',
    'yes': 'nod',
    'disagree': 'headshake',
    'no': 'headshake',

    // Considering
    'considering': 'look-left',
    'pondering': 'look-right',

    // Looking around
    'look-around': 'look-around',
    'scanning': 'look-around',
    'searching': 'look-around',
    'suspicious': 'look-around',
    'cautious': 'look-around',
  };

  const mappedExpression = emotionMap[emotionLower] || null;
  return mappedExpression;
}

/**
 * Extracts emotion tag from text
 * Format: [EMOTION:happy] or [EMOTION:back-forth]
 */
export function extractEmotion(text: string): string | null {
  const match = text.match(/\[EMOTION:(\w+(?:-\w+)?)\]/i);
  return match ? match[1] : null;
}

/**
 * Removes emotion tags from text
 */
export function stripEmotionTags(text: string): string {
  return text.replace(/\[EMOTION:\w+(?:-\w+)?\]\s*/gi, '').trim();
}

/**
 * Removes emotion tags from text during streaming (also handles partial tags)
 */
export function stripEmotionTagsStreaming(text: string): string {
  // First strip any complete emotion tags
  let result = text.replace(/\[EMOTION:\w+(?:-\w+)?\]\s*/gi, '');

  // Also strip any partial emotion tag at the end (still being streamed)
  // This handles cases like "[EMOT", "[EMOTION:", "[EMOTION:hap", etc.
  result = result.replace(/\[EMOTION[^\]]*$/i, '');
  result = result.replace(/\[EMOTIO$/i, '');
  result = result.replace(/\[EMOTI$/i, '');
  result = result.replace(/\[EMOT$/i, '');
  result = result.replace(/\[EMO$/i, '');
  result = result.replace(/\[EM$/i, '');
  result = result.replace(/\[E$/i, '');
  result = result.replace(/\[$/i, '');

  return result.trim();
}
