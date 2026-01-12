import { type RefObject } from 'react';
import { type SearchBarConfig } from '../types';
export interface AntySearchBarProps {
    active: boolean;
    value: string;
    onChange: (value: string) => void;
    /** Callback when search is submitted (Enter pressed) */
    onSubmit?: (value: string) => void;
    inputRef: RefObject<HTMLInputElement | null>;
    barRef: RefObject<HTMLDivElement | null>;
    borderRef: RefObject<HTMLDivElement | null>;
    borderGradientRef: RefObject<HTMLDivElement | null>;
    placeholderRef: RefObject<HTMLDivElement | null>;
    kbdRef: RefObject<HTMLDivElement | null>;
    glowRef: RefObject<HTMLDivElement | null>;
    /** Ref for left bracket duplicate (CSS-positioned at top-left) */
    leftBracketRef?: RefObject<HTMLDivElement | null>;
    /** Ref for right bracket duplicate (CSS-positioned at bottom-right) */
    rightBracketRef?: RefObject<HTMLDivElement | null>;
    /** Scaled bracket size in pixels (for CSS-positioned duplicates) */
    scaledBracketSize?: number;
    /** Search bar configuration - controls dimensions and corner radius */
    config?: SearchBarConfig;
    /** Placeholder text shown when input is empty */
    placeholder?: string;
    /** Keyboard shortcut indicator (e.g., "⌘K") */
    keyboardShortcut?: string;
}
export declare function AntySearchBar({ active, value, onChange, onSubmit, inputRef, barRef, borderRef, borderGradientRef, placeholderRef, kbdRef, glowRef, leftBracketRef, rightBracketRef, scaledBracketSize, config, placeholder, keyboardShortcut, }: AntySearchBarProps): import("react/jsx-runtime").JSX.Element;
