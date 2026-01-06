import { type RefObject } from 'react';
import type { AntyCharacterHandle } from '../components/AntyCharacter';
import type { SearchBarConfig } from '../types';
export interface SearchBarRefs {
    bar: RefObject<HTMLDivElement | null>;
    border: RefObject<HTMLDivElement | null>;
    borderGradient: RefObject<HTMLDivElement | null>;
    placeholder: RefObject<HTMLDivElement | null>;
    kbd: RefObject<HTMLDivElement | null>;
    glow: RefObject<HTMLDivElement | null>;
    input: RefObject<HTMLInputElement | null>;
}
export interface UseSearchMorphOptions {
    characterRef: RefObject<AntyCharacterHandle | null>;
    searchBarRefs: SearchBarRefs;
    config?: SearchBarConfig;
    onMorphStart?: () => void;
    onMorphComplete?: () => void;
    onReturnStart?: () => void;
    onReturnComplete?: () => void;
}
export interface UseSearchMorphReturn {
    morphToSearchBar: () => void;
    morphToCharacter: () => void;
    isMorphing: boolean;
}
export declare function useSearchMorph({ characterRef, searchBarRefs, config, onMorphStart, onMorphComplete, onReturnStart, onReturnComplete, }: UseSearchMorphOptions): UseSearchMorphReturn;
