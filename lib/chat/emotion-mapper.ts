import type { ExpressionName } from '../anty-v3/animation-state';

/**
 * Maps emotion tags from chat responses to Anty's expression names
 */
export function mapEmotionToExpression(emotion: string | undefined): ExpressionName | null {
  if (!emotion) {
    return null;
  }

  const emotionLower = emotion.toLowerCase();

  // Direct mappings
  const emotionMap: Record<string, ExpressionName> = {
    'happy': 'happy',
    'excited': 'excited',
    'shocked': 'shocked',
    'sad': 'sad',
    'angry': 'angry',
    'wink': 'wink',
    'idea': 'idea',
    'nod': 'nod',
    'headshake': 'headshake',
    'look-left': 'look-left',
    'look-right': 'look-right',
    'spin': 'spin',

    // Aliases and synonyms
    'joy': 'happy',
    'joyful': 'happy',
    'pleased': 'happy',
    'content': 'happy',
    'enthusiastic': 'excited',
    'thrilled': 'excited',
    'surprised': 'shocked',
    'amazed': 'shocked',
    'astonished': 'shocked',
    'unhappy': 'sad',
    'disappointed': 'sad',
    'upset': 'sad',
    'mad': 'angry',
    'frustrated': 'angry',
    'annoyed': 'angry',
    'playful': 'wink',
    'flirty': 'wink',
    'thinking': 'idea',
    'thoughtful': 'idea',
    'eureka': 'idea',
    'agree': 'nod',
    'yes': 'nod',
    'disagree': 'headshake',
    'no': 'headshake',
    'considering': 'look-left',
    'pondering': 'look-right',
    'celebrate': 'spin',
    'celebrating': 'spin',
  };

  const mappedExpression = emotionMap[emotionLower] || null;
  return mappedExpression;
}

/**
 * Extracts emotion tag from text
 * Format: [EMOTION:happy] or [EMOTION:look-left]
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
