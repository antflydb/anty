/**
 * Anty Tamagotchi Expression System
 *
 * This file defines all 15 expressions for the Anty character, with SVG path data
 * for smooth morphing animations between expressions.
 *
 * Structure:
 * - 2 static outer brackets (from af-logo.svg paths 1 & 3)
 * - 2 morphing eye paths (left and right eyes)
 *
 * The eyes are the inner triangular shapes that morph to create different expressions.
 */

/**
 * All possible expressions for the Anty character
 */
export type Expression =
  // Base 6 expressions (from Figma)
  | 'logo'      // Default logo state
  | 'idle'      // Neutral, calm state
  | 'happy'     // Positive, content
  | 'sad'       // Low stats, neglected
  | 'wink'      // Playful interaction
  | 'blink'     // Natural animation cycle
  // New 9 expressions (derived)
  | 'excited'   // High energy, just fed or played with
  | 'tired'     // Low energy
  | 'thinking'  // Processing, considering
  | 'confused'  // Needs attention, unclear state
  | 'sick'      // Health critical
  | 'proud'     // Achievement unlocked
  | 'sleepy'    // Bedtime, very low energy
  | 'angry'     // Neglected for too long
  | 'curious';  // Exploring, learning

/**
 * Expression data containing SVG path definitions for left and right eyes
 */
export interface ExpressionData {
  /** SVG path 'd' attribute for the left eye */
  leftEye: string;
  /** SVG path 'd' attribute for the right eye */
  rightEye: string;
  /** Optional description of when this expression appears */
  description?: string;
  /** Optional stat thresholds that trigger this expression */
  triggers?: {
    energy?: { min?: number; max?: number };
    happiness?: { min?: number; max?: number };
    health?: { min?: number; max?: number };
  };
}

/**
 * Complete expression definitions with SVG paths and trigger logic
 */
export const expressions: Record<Expression, ExpressionData> = {
  /**
   * LOGO - Default brand state
   * The standard SearchAF logo appearance
   */
  logo: {
    leftEye: 'M11.8783 15.1175C11.8806 14.4067 12.7401 14.0522 13.2428 14.5549L17.8625 19.1746C18.1747 19.4867 18.1747 19.9928 17.8625 20.3049L13.2134 24.9541C12.709 25.4584 11.8467 25.0996 11.8489 24.3863L11.8783 15.1175Z',
    rightEye: 'M27.2721 24.5018C27.2698 25.2127 26.4103 25.5671 25.9076 25.0645L21.1775 20.3344C20.8653 20.0223 20.8653 19.5162 21.1775 19.2041L25.9377 14.4438C26.4421 13.9395 27.3044 14.2983 27.3022 15.0116L27.2721 24.5018Z',
    description: 'Default logo state, symmetrical and balanced',
  },

  /**
   * IDLE - Neutral, calm state
   * Triggered: When all stats are moderate (40-70%)
   */
  idle: {
    leftEye: 'M11.8783 15.1175C11.8806 14.4067 12.7401 14.0522 13.2428 14.5549L17.8625 19.1746C18.1747 19.4867 18.1747 19.9928 17.8625 20.3049L13.2134 24.9541C12.709 25.4584 11.8467 25.0996 11.8489 24.3863L11.8783 15.1175Z',
    rightEye: 'M27.2721 24.5018C27.2698 25.2127 26.4103 25.5671 25.9076 25.0645L21.1775 20.3344C20.8653 20.0223 20.8653 19.5162 21.1775 19.2041L25.9377 14.4438C26.4421 13.9395 27.3044 14.2983 27.3022 15.0116L27.2721 24.5018Z',
    description: 'Neutral expression, waiting for interaction',
    triggers: {
      energy: { min: 40, max: 70 },
      happiness: { min: 40, max: 70 },
      health: { min: 40, max: 70 },
    },
  },

  /**
   * HAPPY - Positive, content state
   * Triggered: High happiness (>70%) or after feeding/playing
   */
  happy: {
    // Eyes slightly wider and higher (upward curved expression)
    leftEye: 'M11.8783 14.1175C11.8806 13.4067 12.7401 13.0522 13.2428 13.5549L18.3625 18.6746C18.6747 18.9867 18.6747 19.4928 18.3625 19.8049L13.2134 24.9541C12.709 25.4584 11.8467 25.0996 11.8489 24.3863L11.8783 14.1175Z',
    rightEye: 'M27.2721 24.5018C27.2698 25.2127 26.4103 25.5671 25.9076 25.0645L20.6775 19.8344C20.3653 19.5223 20.3653 19.0162 20.6775 18.7041L25.9377 13.4438C26.4421 12.9395 27.3044 13.2983 27.3022 14.0116L27.2721 24.5018Z',
    description: 'Happy expression with upward-curved eyes',
    triggers: {
      happiness: { min: 70 },
    },
  },

  /**
   * SAD - Low stats, neglected state
   * Triggered: Low happiness (<30%) or multiple low stats
   */
  sad: {
    // Eyes drooping downward
    leftEye: 'M11.8783 16.1175C11.8806 15.4067 12.7401 15.0522 13.2428 15.5549L17.3625 19.6746C17.6747 19.9867 17.6747 20.4928 17.3625 20.8049L13.2134 25.9541C12.709 26.4584 11.8467 26.0996 11.8489 25.3863L11.8783 16.1175Z',
    rightEye: 'M27.2721 25.5018C27.2698 26.2127 26.4103 26.5671 25.9076 26.0645L21.6775 21.8344C21.3653 21.5223 21.3653 21.0162 21.6775 20.7041L25.9377 15.4438C26.4421 14.9395 27.3044 14.2983 27.3022 15.0116L27.2721 25.5018Z',
    description: 'Sad expression with downward-curved eyes',
    triggers: {
      happiness: { max: 30 },
    },
  },

  /**
   * WINK - Playful interaction
   * Triggered: During interaction animations or randomly when happy
   */
  wink: {
    // Right eye closed (horizontal line), left eye normal
    leftEye: 'M11.8783 15.1175C11.8806 14.4067 12.7401 14.0522 13.2428 14.5549L17.8625 19.1746C18.1747 19.4867 18.1747 19.9928 17.8625 20.3049L13.2134 24.9541C12.709 25.4584 11.8467 25.0996 11.8489 24.3863L11.8783 15.1175Z',
    rightEye: 'M27.2721 19.7518C27.2698 20.0627 26.4103 20.2171 25.9076 20.0645L21.1775 19.9344C20.8653 19.9223 20.8653 19.6162 21.1775 19.6041L25.9377 19.4438C26.4421 19.3895 27.3044 19.5483 27.3022 19.8116L27.2721 19.7518Z',
    description: 'Playful wink with one eye closed',
    triggers: {
      happiness: { min: 60 },
    },
  },

  /**
   * BLINK - Natural animation cycle
   * Triggered: Periodically during idle state
   */
  blink: {
    // Both eyes closed (horizontal lines)
    leftEye: 'M11.8783 19.6175C11.8806 19.9067 12.7401 20.0522 13.2428 19.9549L17.8625 19.8746C18.1747 19.8667 18.1747 19.6928 17.8625 19.6849L13.2134 19.6041C12.709 19.5584 11.8467 19.6996 11.8489 19.9863L11.8783 19.6175Z',
    rightEye: 'M27.2721 19.7518C27.2698 20.0627 26.4103 20.2171 25.9076 20.0645L21.1775 19.9344C20.8653 19.9223 20.8653 19.6162 21.1775 19.6041L25.9377 19.4438C26.4421 19.3895 27.3044 19.5483 27.3022 19.8116L27.2721 19.7518Z',
    description: 'Both eyes closed for natural blinking animation',
  },

  /**
   * EXCITED - High energy, just fed or played with
   * Triggered: Immediately after feeding or playing, energy >80%
   */
  excited: {
    // Wide open eyes, sparkle effect
    leftEye: 'M11.8783 13.1175C11.8806 12.4067 12.7401 12.0522 13.2428 12.5549L18.8625 18.1746C19.1747 18.4867 19.1747 18.9928 18.8625 19.3049L13.2134 25.9541C12.709 26.4584 11.8467 26.0996 11.8489 25.3863L11.8783 13.1175Z',
    rightEye: 'M27.2721 25.5018C27.2698 26.2127 26.4103 26.5671 25.9076 26.0645L20.1775 20.3344C19.8653 20.0223 19.8653 19.5162 20.1775 19.2041L25.9377 12.4438C26.4421 11.9395 27.3044 12.2983 27.3022 13.0116L27.2721 25.5018Z',
    description: 'Excited expression with wide, sparkling eyes',
    triggers: {
      energy: { min: 80 },
      happiness: { min: 75 },
    },
  },

  /**
   * TIRED - Low energy state
   * Triggered: Energy <30%
   */
  tired: {
    // Half-closed droopy eyes
    leftEye: 'M11.8783 17.1175C11.8806 16.4067 12.7401 16.0522 13.2428 16.5549L16.8625 20.1746C17.1747 20.4867 17.1747 20.9928 16.8625 21.3049L13.2134 25.4541C12.709 25.9584 11.8467 25.5996 11.8489 24.8863L11.8783 17.1175Z',
    rightEye: 'M27.2721 24.5018C27.2698 25.2127 26.4103 25.5671 25.9076 25.0645L22.1775 21.3344C21.8653 21.0223 21.8653 20.5162 22.1775 20.2041L25.9377 16.4438C26.4421 15.9395 27.3044 16.2983 27.3022 17.0116L27.2721 24.5018Z',
    description: 'Tired expression with half-closed eyes',
    triggers: {
      energy: { max: 30 },
    },
  },

  /**
   * THINKING - Processing, considering
   * Triggered: During mini-game or when user hovers over stats
   */
  thinking: {
    // One eye normal, one eye slightly squinted
    leftEye: 'M11.8783 15.1175C11.8806 14.4067 12.7401 14.0522 13.2428 14.5549L17.8625 19.1746C18.1747 19.4867 18.1747 19.9928 17.8625 20.3049L13.2134 24.9541C12.709 25.4584 11.8467 25.0996 11.8489 24.3863L11.8783 15.1175Z',
    rightEye: 'M27.2721 23.5018C27.2698 24.2127 26.4103 24.5671 25.9076 24.0645L21.6775 19.8344C21.3653 19.5223 21.3653 19.0162 21.6775 18.7041L25.9377 15.4438C26.4421 14.9395 27.3044 15.2983 27.3022 16.0116L27.2721 23.5018Z',
    description: 'Thoughtful expression with asymmetric eyes',
  },

  /**
   * CONFUSED - Needs attention, unclear state
   * Triggered: When multiple stats are in different ranges (one high, one low)
   */
  confused: {
    // Eyes at different angles, misaligned
    leftEye: 'M11.8783 14.1175C11.8806 13.4067 12.7401 13.0522 13.2428 13.5549L17.3625 17.6746C17.6747 17.9867 17.6747 18.4928 17.3625 18.8049L13.2134 23.9541C12.709 24.4584 11.8467 24.0996 11.8489 23.3863L11.8783 14.1175Z',
    rightEye: 'M27.2721 25.5018C27.2698 26.2127 26.4103 26.5671 25.9076 26.0645L22.6775 22.8344C22.3653 22.5223 22.3653 22.0162 22.6775 21.7041L25.9377 16.4438C26.4421 15.9395 27.3044 16.2983 27.3022 17.0116L27.2721 25.5018Z',
    description: 'Confused expression with misaligned eyes',
  },

  /**
   * SICK - Critical health state
   * Triggered: Health <20%
   */
  sick: {
    // Swirly, dizzy eyes
    leftEye: 'M12.8783 16.1175C12.8806 15.4067 13.2401 15.0522 13.7428 15.5549L16.8625 18.6746C17.1747 18.9867 17.1747 19.4928 16.8625 19.8049L14.2134 23.4541C13.709 23.9584 13.8467 23.5996 13.8489 22.8863L12.8783 16.1175Z',
    rightEye: 'M26.2721 23.5018C26.2698 24.2127 25.4103 24.5671 24.9076 24.0645L22.1775 21.3344C21.8653 21.0223 21.8653 20.5162 22.1775 20.2041L24.9377 16.4438C25.4421 15.9395 26.3044 15.2983 26.3022 16.0116L26.2721 23.5018Z',
    description: 'Sick expression with dizzy, unfocused eyes',
    triggers: {
      health: { max: 20 },
    },
  },

  /**
   * PROUD - Achievement unlocked
   * Triggered: When leveling up or completing achievements
   */
  proud: {
    // Confident, slightly narrowed eyes with upward tilt
    leftEye: 'M11.8783 14.6175C11.8806 13.9067 12.7401 13.5522 13.2428 14.0549L17.8625 18.6746C18.1747 18.9867 18.1747 19.4928 17.8625 19.8049L13.2134 23.9541C12.709 24.4584 11.8467 24.0996 11.8489 23.3863L11.8783 14.6175Z',
    rightEye: 'M27.2721 24.0018C27.2698 24.7127 26.4103 25.0671 25.9076 24.5645L21.1775 19.8344C20.8653 19.5223 20.8653 19.0162 21.1775 18.7041L25.9377 14.0438C26.4421 13.5395 27.3044 13.8983 27.3022 14.6116L27.2721 24.0018Z',
    description: 'Proud expression with confident, narrowed eyes',
  },

  /**
   * SLEEPY - Bedtime, very low energy
   * Triggered: Energy <15% or during nighttime hours
   */
  sleepy: {
    // Very droopy, nearly closed eyes with "Z" shapes
    leftEye: 'M11.8783 18.1175C11.8806 17.4067 12.7401 17.0522 13.2428 17.5549L15.8625 20.1746C16.1747 20.4867 16.1747 20.9928 15.8625 21.3049L13.2134 24.9541C12.709 25.4584 11.8467 25.0996 11.8489 24.3863L11.8783 18.1175Z',
    rightEye: 'M27.2721 23.5018C27.2698 24.2127 26.4103 24.5671 25.9076 24.0645L23.1775 21.3344C22.8653 21.0223 22.8653 20.5162 23.1775 20.2041L25.9377 17.4438C26.4421 16.9395 27.3044 17.2983 27.3022 18.0116L27.2721 23.5018Z',
    description: 'Very sleepy expression with heavily drooped eyes',
    triggers: {
      energy: { max: 15 },
    },
  },

  /**
   * ANGRY - Neglected for too long
   * Triggered: All stats <40% or happiness <15%
   */
  angry: {
    // Sharp, angular eyes pointing inward (angry brow)
    leftEye: 'M11.8783 16.1175C11.8806 15.4067 12.7401 15.0522 13.2428 15.5549L18.3625 20.6746C18.6747 20.9867 18.6747 21.4928 18.3625 21.8049L13.2134 25.9541C12.709 26.4584 11.8467 26.0996 11.8489 25.3863L11.8783 16.1175Z',
    rightEye: 'M27.2721 25.5018C27.2698 26.2127 26.4103 26.5671 25.9076 26.0645L20.6775 20.8344C20.3653 20.5223 20.3653 20.0162 20.6775 19.7041L25.9377 15.4438C26.4421 14.9395 27.3044 15.2983 27.3022 16.0116L27.2721 25.5018Z',
    description: 'Angry expression with sharp, angled eyes',
    triggers: {
      happiness: { max: 15 },
    },
  },

  /**
   * CURIOUS - Exploring, learning
   * Triggered: During tutorial or when discovering new features
   */
  curious: {
    // Wide, slightly offset eyes (looking at something)
    leftEye: 'M12.8783 14.6175C12.8806 13.9067 13.7401 13.5522 14.2428 14.0549L18.8625 18.6746C19.1747 18.9867 19.1747 19.4928 18.8625 19.8049L14.2134 24.4541C13.709 24.9584 12.8467 24.5996 12.8489 23.8863L12.8783 14.6175Z',
    rightEye: 'M26.2721 24.0018C26.2698 24.7127 25.4103 25.0671 24.9076 24.5645L20.1775 19.8344C19.8653 19.5223 19.8653 19.0162 20.1775 18.7041L24.9377 14.0438C25.4421 13.5395 26.3044 13.8983 26.3022 14.6116L26.2721 24.0018Z',
    description: 'Curious expression with wide, attentive eyes',
  },
};

/**
 * Static outer bracket paths (these never change)
 */
export const staticBrackets = {
  leftBracket: 'M28.3149 6.96011H11.2167C8.86587 6.96012 6.96011 8.86587 6.9601 11.2167V28.3149L1.39945 33.8755C0.883015 34.392 0 34.0262 0 33.2958V11.2167C4.48304e-06 5.02189 5.02189 9.39218e-06 11.2167 0H33.2958C34.0262 0 34.3919 0.883017 33.8755 1.39945L28.3149 6.96011Z',
  rightBracket: 'M39.2842 28.0677C39.2842 34.2626 34.2623 39.2845 28.0674 39.2845H6.10853C5.37819 39.2845 5.01243 38.4015 5.52886 37.885L11.0896 32.3243H28.0674C30.4183 32.3243 32.324 30.4186 32.324 28.0677V11.0898L37.8847 5.5291C38.4012 5.01267 39.2842 5.37843 39.2842 6.10877V28.0677Z',
} as const;

/**
 * Helper function to get expression by current stats
 * Compatible with AntyStats interface (energy, happiness, knowledge, indexHealth)
 */
export function getExpressionByStats(stats: {
  energy: number;
  happiness: number;
  knowledge?: number;
  indexHealth?: number;
}): Expression {
  // Priority order: critical states first, then specific states, then default

  const health = stats.indexHealth ?? 100; // Default to healthy if not provided

  // Critical health
  if (health < 20) return 'sick';

  // Very low energy
  if (stats.energy < 15) return 'sleepy';

  // Neglected/angry
  if (stats.happiness < 15) return 'angry';
  if (stats.energy < 40 && stats.happiness < 40 && health < 40) return 'angry';

  // Low energy
  if (stats.energy < 30) return 'tired';

  // Sad
  if (stats.happiness < 30) return 'sad';

  // Excited
  if (stats.energy > 80 && stats.happiness > 75) return 'excited';

  // Happy
  if (stats.happiness > 70) return 'happy';

  // Confused (conflicting stats)
  if (
    (stats.energy > 70 && stats.happiness < 30) ||
    (stats.energy < 30 && stats.happiness > 70)
  ) return 'confused';

  // Default to idle
  return 'idle';
}

/**
 * Helper function to validate expression morphing compatibility
 */
export function canMorphBetween(from: Expression, to: Expression): boolean {
  // All expressions use the same path structure, so all morphs are possible
  // This function can be extended if certain transitions need to be restricted
  return true;
}
