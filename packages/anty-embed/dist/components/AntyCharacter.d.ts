import { type ExpressionName } from '../lib/animation/types';
import { type SearchBarConfig } from '../types';
export interface AntyCharacterProps {
    /** Current expression/emotion to display */
    expression?: ExpressionName;
    /** Character size in pixels (default: 160) */
    size?: number;
    /** Whether super mode is active */
    isSuperMode?: boolean;
    /** Freeze all animations (idle, breathing, etc.) for static display */
    frozen?: boolean;
    /** Logo mode: OFF eyes at full color, no shadow/glow, no blinks. Emotions can play but return to logo eyes. */
    logoMode?: boolean;
    /** Whether search mode is active (external control - deprecated, use searchEnabled instead) */
    searchMode?: boolean;
    /** Whether to show debug overlays */
    debugMode?: boolean;
    /** Whether to show shadow (default: true) */
    showShadow?: boolean;
    /** Whether to show glow effects (default: true) */
    showGlow?: boolean;
    /** Callback when a spontaneous expression occurs */
    onSpontaneousExpression?: (expression: ExpressionName) => void;
    /** Callback when an emotion animation completes */
    onEmotionComplete?: (emotion: string) => void;
    /** Callback when animation sequence changes (for debugging) */
    onAnimationSequenceChange?: (sequence: string) => void;
    /** Callback for random actions (for debugging) */
    onRandomAction?: (action: string) => void;
    /** Additional CSS class name */
    className?: string;
    /** Additional inline styles */
    style?: React.CSSProperties;
    /** External ref for shadow element (if managing shadow externally) */
    shadowRef?: React.RefObject<HTMLDivElement | null>;
    /** External ref for inner glow element (if managing glow externally) */
    innerGlowRef?: React.RefObject<HTMLDivElement | null>;
    /** External ref for outer glow element (if managing glow externally) */
    outerGlowRef?: React.RefObject<HTMLDivElement | null>;
    /** Enable integrated search bar (renders internally, controlled via ref) */
    searchEnabled?: boolean;
    /** Current search value (controlled) */
    searchValue?: string;
    /** Callback when search value changes */
    onSearchChange?: (value: string) => void;
    /** Callback when search is submitted (Enter pressed) */
    onSearchSubmit?: (value: string) => void;
    /** Search bar placeholder text */
    searchPlaceholder?: string;
    /** Keyboard shortcut indicator (e.g., "⌘K") */
    searchShortcut?: string;
    /** Search bar configuration */
    searchConfig?: SearchBarConfig;
    /** Callback when morph to search starts */
    onSearchOpen?: () => void;
    /** Callback when morph to search completes */
    onSearchOpenComplete?: () => void;
    /** Callback when morph back to character starts */
    onSearchClose?: () => void;
    /** Callback when morph back to character completes */
    onSearchCloseComplete?: () => void;
}
export interface AntyCharacterHandle {
    spawnFeedingParticles: () => void;
    spawnSparkle?: (x: number, y: number, color?: string) => void;
    spawnLoveHearts?: () => void;
    spawnConfetti?: (x: number, y: number, count?: number) => void;
    showSearchGlow?: () => void;
    hideSearchGlow?: () => void;
    playEmotion?: (emotion: ExpressionName, options?: {
        isChatOpen?: boolean;
        showLightbulb?: boolean;
        quickDescent?: boolean;
    }) => boolean;
    killAll?: () => void;
    pauseIdle?: () => void;
    resumeIdle?: () => void;
    startLook?: (direction: 'left' | 'right') => void;
    endLook?: () => void;
    setSuperMode?: (scale: number | null) => void;
    powerOff?: () => void;
    wakeUp?: () => void;
    showGlows?: (fadeIn?: boolean) => void;
    hideGlows?: () => void;
    hideShadow?: () => void;
    showShadow?: () => void;
    /** Morph character into search bar */
    morphToSearchBar?: () => void;
    /** Morph search bar back to character */
    morphToCharacter?: () => void;
    /** Check if currently in search mode */
    isSearchMode?: () => boolean;
    leftBodyRef?: React.RefObject<HTMLDivElement | null>;
    rightBodyRef?: React.RefObject<HTMLDivElement | null>;
    leftEyeRef?: React.RefObject<HTMLDivElement | null>;
    rightEyeRef?: React.RefObject<HTMLDivElement | null>;
    leftEyePathRef?: React.RefObject<SVGPathElement | null>;
    rightEyePathRef?: React.RefObject<SVGPathElement | null>;
    shadowRef?: React.RefObject<HTMLDivElement | null>;
    innerGlowRef?: React.RefObject<HTMLDivElement | null>;
    outerGlowRef?: React.RefObject<HTMLDivElement | null>;
    characterRef?: React.RefObject<HTMLDivElement | null>;
}
/**
 * Main Anty Character component with GSAP animations
 *
 * Features:
 * - Continuous idle animations (floating, rotation, breathing)
 * - Emotion animations with eye morphing
 * - Canvas-based particle system
 * - Self-contained shadow and glow effects
 * - Power on/off animations
 */
export declare const AntyCharacter: import("react").ForwardRefExoticComponent<AntyCharacterProps & import("react").RefAttributes<AntyCharacterHandle>>;
