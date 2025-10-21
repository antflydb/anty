/**
 * Calculate reading time for markdown content
 * Average reading speed: 200 words per minute
 */
export function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;

  // Remove markdown syntax and count words
  const text = content
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]*`/g, '') // Remove inline code
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Extract link text
    .replace(/[#*_~`]/g, '') // Remove markdown formatting
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);

  return `${minutes} min read`;
}
