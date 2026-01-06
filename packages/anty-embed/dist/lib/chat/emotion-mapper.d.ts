import type { EmotionType } from '../animation/types';
/**
 * Maps emotion tags from chat responses to Anty's emotion types
 */
export declare function mapEmotionToExpression(emotion: string | undefined): EmotionType | null;
/**
 * Extracts emotion tag from text
 * Format: [EMOTION:happy] or [EMOTION:back-forth]
 */
export declare function extractEmotion(text: string): string | null;
/**
 * Removes emotion tags from text
 */
export declare function stripEmotionTags(text: string): string;
/**
 * Removes emotion tags from text during streaming (also handles partial tags)
 */
export declare function stripEmotionTagsStreaming(text: string): string;
